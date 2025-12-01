import React, { useState, useEffect, useMemo } from 'react';
import { Assessment, UserProfile } from '../types';
import { getAssessments, saveAssessments, getUserProfile } from '../services/storageService';
import { AssessmentForm } from '../components/Assessment/AssessmentForm';
import { AssessmentPrintLayout } from '../components/Assessment/AssessmentPrintLayout';
import { UserProfileForm } from '../components/UserProfileForm';
import { Download, Calendar, Info, Filter, Clock } from 'lucide-react';

// Constants
const INDICATORS = [
  "1. BERORIENTASI PELAYANAN - Berkomitmen memberikan pelayanan prima demi kepuasan masyarakat",
  "2. AKUNTABEL - Bertanggungjawab atas kepercayaan yang diberikan",
  "3. KOMPETEN - Terus belajar dan mengembangkan kapabilitas",
  "4. HARMONIS - Saling peduli dan menghargai perbedaan",
  "5. LOYAL - Berdedikasi dan mengutamakan kepentingan Bangsa dan Negara",
  "6. ADAPTIF - Terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan",
  "7. KOLABORATIF - Membangun kerjasama yang sinergis"
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

export const AssessmentView: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ nama: '', jabatan: '', unitKerja: '' });
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter States
  const [selectedIndicator, setSelectedIndicator] = useState<string>('ALL');
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
    setAssessments(getAssessments());
    setUserProfile(getUserProfile());
  }, []);

  // Filter Logic
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesIndicator = selectedIndicator === 'ALL' || a.indicator === selectedIndicator;

      // SPECIAL LOGIC FOR INDICATOR 8 (UMUM)
      if (selectedIndicator.startsWith('8.') && currentFormDate) {
        // Filter STRICTLY by the date selected in the form
        // This ensures PDF only contains the single activity (or activities) for that specific day
        // instead of piling up the whole month.
        const itemDate = a.date || a.timestamp.split('T')[0];
        return matchesIndicator && itemDate === currentFormDate;
      }

      // STANDARD LOGIC FOR OTHERS (1-7 or ALL)
      // Filter by Month (YYYY-MM)
      const itemDate = a.date || a.timestamp;
      return matchesIndicator && itemDate.startsWith(selectedPeriod);
    });
  }, [assessments, selectedPeriod, selectedIndicator, currentFormDate]);

  // Handlers
  const handleSave = (data: Omit<Assessment, 'id' | 'timestamp'>) => {
    // If editing existing
    if (editingAssessment) {
      const updatedList = assessments.map(a =>
        a.id === editingAssessment.id
          ? { ...a, ...data }
          : a
      );
      const saved = saveAssessments(updatedList);
      setAssessments(saved);
      setEditingAssessment(null); // Clear edit mode after update
    } else {
      // Create new
      const timestamp = new Date().toISOString();
      const newItem: Assessment = {
        ...data,
        id: Date.now().toString(),
        timestamp: timestamp
      };
      const updated = saveAssessments([...assessments, newItem]);
      setAssessments(updated);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus penilaian ini?')) {
      const updated = assessments.filter(a => a.id !== id);
      const saved = saveAssessments(updated);
      setAssessments(saved);
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
          filename: `Laporan_Berakhlak_${userProfile.nama}_${selectedPeriod}.pdf`,
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
          <h2 className="text-2xl font-bold text-blue-900 leading-tight">Self Assessment Berakhlak</h2>
          <p className="text-gray-600 text-sm">Evaluasi Penerapan Nilai Dasar ASN.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          {/* Indicator Filter */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64 bg-white rounded-lg border border-gray-300 shadow-sm flex items-center px-3 py-2">
            <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <select
              value={selectedIndicator}
              onChange={(e) => {
                setSelectedIndicator(e.target.value);
                setEditingAssessment(null); // Reset form when changing filter
              }}
              className="w-full bg-transparent outline-none text-sm text-gray-700 font-medium appearance-none truncate pr-4"
              style={{ backgroundImage: 'none' }}
            >
              <option value="ALL">Semua Indikator (Gabung)</option>
              {INDICATORS.map((ind) => (
                <option key={ind} value={ind}>
                  {ind.split('-')[0].trim()}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>

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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 font-bold transition-colors disabled:bg-gray-400 whitespace-nowrap"
          >
            {isDownloading ? <span className="animate-spin">⌛</span> : <Download size={18} />}
            Unduh PDF
          </button>
        </div>
      </div>

      <UserProfileForm onProfileUpdate={setUserProfile} />

      {/* Dynamic Content Area */}
      <div className="mb-8 animate-fade-in">
        {selectedIndicator === 'ALL' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Siap Mengisi Laporan?</h3>
              <p className="text-sm leading-relaxed text-blue-700">
                Silakan pilih salah satu <span className="font-bold">Indikator Berakhlak</span> pada menu dropdown di atas (sebelah kiri pemilih bulan) untuk membuka formulir input.
              </p>
            </div>
          </div>
        ) : (
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
                          {item.indicator.startsWith('8.') && (
                            <div className="text-xs font-bold text-blue-600 uppercase mb-1">{item.customTitle}</div>
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
        )}
      </div>

      {/* Preview Section */}
      <div className="animate-slide-in">
        <div className="flex justify-center mb-6 no-print">
          <div className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full text-sm font-bold shadow-sm">
            Preview Laporan
            {selectedIndicator.startsWith('8.') && currentFormDate
              ? ` Tanggal ${formatFullDate(currentFormDate)}`
              : ` Bulan ${formatMonth(selectedPeriod)}`
            }
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mb-4 no-print mt-[-1rem]">
          {selectedIndicator === 'ALL'
            ? 'Menampilkan semua data.'
            : selectedIndicator.startsWith('8.')
              ? 'Mode Tugas Umum: Menampilkan HANYA tanggal yang dipilih di form input.'
              : 'Menampilkan data indikator terpilih satu bulan penuh.'}
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