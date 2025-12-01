import React, { useState, useEffect, useMemo } from 'react';
import { Assessment, UserProfile } from '../types';
import { getAssessments, saveAssessment, updateAssessment, deleteAssessment, getUserProfile } from '../services/apiService';
import { AssessmentForm } from '../components/Assessment/AssessmentForm';
import { AssessmentPrintLayout } from '../components/Assessment/AssessmentPrintLayout';
import { UserProfileForm } from '../components/UserProfileForm';
import { Download, Calendar, Info, Filter, Clock } from 'lucide-react';

// Constants
const INDICATORS = [
  "UMUM - Kinerja lainnya diluar indikator Berakhlak"
];

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const UmumView: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ nama: '', jabatan: '', unitKerja: '' });
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter States - Always set to UMUM for this view
  const [selectedIndicator, setSelectedIndicator] = useState<string>('UMUM - Kinerja lainnya diluar indikator Berakhlak');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // State to track the date currently selected in the form
  // Used specifically for filtering Indicator 8 (Umum)
  const [currentFormDate, setCurrentFormDate] = useState<string>('');

  // Derived Year/Month for Dropdowns
  const getPeriodParts = () => {
    const parts = selectedPeriod.split('-');
    if (parts.length === 2) return { year: parts[0], month: parts[1] };
    const now = new Date();
    return {
      year: now.getFullYear().toString(),
      month: String(now.getMonth() + 1).padStart(2, '0')
    };
  };
  const { year: currentSelectedYear, month: currentSelectedMonth } = getPeriodParts();
  const currentYearInt = new Date().getFullYear();
  const YEARS = Array.from({ length: 6 }, (_, i) => currentYearInt - 1 + i);

  useEffect(() => {
    const loadData = async () => {
      const allAssessments = await getAssessments();
      setAssessments(allAssessments);
      const profile = await getUserProfile();
      setUserProfile(profile);
    };
    loadData();
  }, []);

  // Filter Logic
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesIndicator = selectedIndicator === 'ALL' || a.indicator === selectedIndicator;

      // SPECIAL LOGIC FOR UMUM - Filter by specific date
      // For UMUM view, we want to show only the data for the selected date, not the whole month
      if (selectedIndicator.startsWith('UMUM') && currentFormDate) {
        // Filter STRICTLY by the date selected in the form
        // This ensures PDF only contains the single activity (or activities) for that specific day
        const itemDate = a.date || a.timestamp.split('T')[0];
        return matchesIndicator && itemDate === currentFormDate;
      }

      // FALLBACK - If no date selected yet, show nothing to avoid confusion
      if (selectedIndicator.startsWith('UMUM') && !currentFormDate) {
        return false;
      }

      // STANDARD LOGIC (should not reach here in UmumView since indicator is always UMUM)
      // Filter by Month (YYYY-MM)
      const itemDate = a.date || a.timestamp;
      return matchesIndicator && itemDate.startsWith(selectedPeriod);
    });
  }, [assessments, selectedPeriod, selectedIndicator, currentFormDate]);

  // Handlers
  const handleSave = async (data: Omit<Assessment, 'id' | 'timestamp'>, imageFiles?: File[]) => {
    // If editing existing
    if (editingAssessment) {
      const updated = await updateAssessment({
        ...editingAssessment,
        ...data
      }, imageFiles);

      if (updated) {
        setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? updated : a));
        setEditingAssessment(null); // Clear edit mode after update
      }
    } else {
      // Create new
      const timestamp = new Date().toISOString();
      const saved = await saveAssessment({
        ...data,
        timestamp
      }, imageFiles);

      if (saved) {
        setAssessments(prev => [...prev, saved]);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus penilaian ini?')) {
      await deleteAssessment(id);
      setAssessments(prev => prev.filter(a => a.id !== id));
      if (editingAssessment?.id === id) {
        setEditingAssessment(null);
      }
    }
  };

  const handleEditClick = (id: string) => {
    const target = assessments.find(a => a.id === id);
    if (target) {
      setSelectedIndicator(target.indicator);
      setEditingAssessment(target);
      // Force date update so preview jumps to this item
      if (target.date) setCurrentFormDate(target.date);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setTimeout(async () => {
      const element = document.getElementById('assessment-print-container');
      if (element) {
        const opt = {
          margin: 0,
          filename: `Laporan_UMUM_${userProfile.nama}_${selectedPeriod}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
          await window.html2pdf().set(opt).from(element).save();
        } catch (e) {
          console.error("PDF Error", e);
          alert("Gagal export PDF");
        }
      }
      setIsDownloading(false);
    }, 100);
  };

  const formatMonth = (period: string) => {
    const d = new Date(period + "-01");
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Format specific date for Indicator 8 preview label
  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-900 leading-tight">Laporan Kinerja UMUM</h2>
          <p className="text-gray-600 text-sm">Pencatatan kinerja umum lainnya untuk dokumentasi kegiatan ASN.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">

          {/* Date Picker */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white px-2 py-1 rounded-lg border border-gray-300 shadow-sm">
            <div className="text-gray-400">
              <Calendar size={18} />
            </div>
            <select
              value={currentSelectedMonth}
              onChange={(e) => setSelectedPeriod(`${currentSelectedYear}-${e.target.value}`)}
              className="p-2 bg-transparent outline-none text-gray-700 font-medium cursor-pointer hover:text-blue-600 text-sm"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="w-px h-6 bg-gray-300"></div>
            <select
              value={currentSelectedYear}
              onChange={(e) => setSelectedPeriod(`${e.target.value}-${currentSelectedMonth}`)}
              className="p-2 bg-transparent outline-none text-gray-700 font-bold cursor-pointer hover:text-blue-600 text-sm"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || (filteredAssessments.length === 0)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 font-bold transition-colors disabled:bg-gray-400 whitespace-nowrap"
          >
            {isDownloading ? <span className="animate-spin">⌛</span> : <Download size={18} />}
            Unduh PDF
          </button>
        </div>
      </div>

      <UserProfileForm onProfileUpdate={setUserProfile} />

      {/* Dynamic Content Area */}
      <div className="mb-8 animate-fade-in">
        <div className="space-y-6">
          {/* Input Form */}
          <AssessmentForm
            key={editingAssessment ? editingAssessment.id : 'new'}
            forcedIndicator={selectedIndicator}
            selectedMonth={selectedPeriod}
            initialData={editingAssessment}
            onSubmit={handleSave}
            onUpdate={handleSave}
            onDateChange={setCurrentFormDate} // LINKED HERE
            onCancelEdit={() => {
              setEditingAssessment(null);
              setSelectedIndicator('ALL');
            }}
          />

          {/* Mini History List (To see what has been added) */}
          {/* Only show "History" list. If Indicator 8, show full month history but preview filters date. */}
          {/* To avoid confusion, let's show all items for the month in this list, so user knows they exist. */}
          {assessments.filter(a => a.indicator === selectedIndicator && a.timestamp.startsWith(selectedPeriod)).length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} /> Riwayat Input Bulan Ini ({formatMonth(selectedPeriod)})
              </h3>
              <div className="space-y-3">
                {assessments
                  .filter(a => a.indicator === selectedIndicator && a.timestamp.startsWith(selectedPeriod))
                  .sort((a, b) => {
                    // Sort by date (oldest to newest)
                    const dateA = a.date || a.timestamp.split('T')[0];
                    const dateB = b.date || b.timestamp.split('T')[0];
                    return dateA.localeCompare(dateB);
                  })
                  .map(item => (
                    <div key={item.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-1">
                          {item.date ? new Date(item.date).toLocaleDateString('id-ID') : formatMonth(selectedPeriod)}
                        </div>
                        {(item.indicator.startsWith('8.') || item.indicator.startsWith('UMUM')) && (
                          <div className="text-xs font-bold text-green-600 uppercase mb-1">{item.customTitle}</div>
                        )}
                        <p className="text-sm text-gray-800 line-clamp-2">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleEditClick(item.id)}
                        className="text-blue-600 text-xs font-bold hover:underline ml-4"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="animate-slide-in">
        <div className="flex justify-center mb-6 no-print">
          <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full text-sm font-bold shadow-sm">
            Preview Laporan
            {selectedIndicator.startsWith('UMUM') && currentFormDate
              ? ` Tanggal ${formatFullDate(currentFormDate)}`
              : ` Bulan ${formatMonth(selectedPeriod)}`
            }
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mb-4 no-print mt-[-1rem]">
          {selectedIndicator.startsWith('UMUM')
            ? 'Mode Laporan UMUM: Menampilkan HANYA tanggal yang dipilih di form input.'
            : 'Menampilkan semua data.'}
        </p>

        <AssessmentPrintLayout
          assessments={filteredAssessments}
          onDelete={handleDelete}
          onEdit={handleEditClick}
          selectedPeriod={selectedPeriod}
          userProfile={userProfile}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};