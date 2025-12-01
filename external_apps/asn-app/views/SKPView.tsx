import React, { useState, useEffect } from 'react';
import { Activity, UserProfile } from '../types';
import { getActivities, saveActivities, getUserProfile } from '../services/storageService';
import { ActivityForm } from '../components/SKP/ActivityForm';
import { PrintLayout } from '../components/SKP/PrintLayout';
import { UserProfileForm } from '../components/UserProfileForm';
import { Download, Calendar } from 'lucide-react';

export const SKPView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  // Initialize with current date directly to support dropdowns immediately
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({ nama: '', jabatan: '', unitKerja: '' });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Constants for Dropdowns
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

  const currentYear = new Date().getFullYear();
  // Generate range: 1 year back to 5 years forward
  const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);

  useEffect(() => {
    // Init data
    const allActivities = getActivities();
    setActivities(allActivities);
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  useEffect(() => {
    // Filter activities when list or period changes
    let filtered = activities;
    if (selectedPeriod) {
      filtered = activities.filter(a => a.date.startsWith(selectedPeriod));
    }
    // Sort by date ascending
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    setFilteredActivities(sorted);
  }, [activities, selectedPeriod]);

  const handleAddActivity = (data: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...data,
      id: Date.now().toString()
    };
    const updated = saveActivities([...activities, newActivity]);
    setActivities(updated);
  };

  const handleUpdateActivity = (data: Activity) => {
    const updatedList = activities.map(a => a.id === data.id ? data : a);
    const saved = saveActivities(updatedList);
    setActivities(saved);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      const updatedList = activities.filter(a => a.id !== id);
      const saved = saveActivities(updatedList);
      setActivities(saved);
    }
  };

  const handleEditClick = (id: string) => {
    const target = activities.find(a => a.id === id);
    if (target) {
      setEditingActivity(target);
      // Scroll to form
      const formElement = document.getElementById('activity-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    // Wait for state update to hide buttons
    setTimeout(async () => {
      const element = document.getElementById('skp-print-container');
      if (element) {
        const opt = {
          margin: 0,
          filename: `SKP_${userProfile.nama}_${selectedPeriod}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
          await window.html2pdf().set(opt).from(element).save();
        } catch (e) {
          console.error("PDF Generation failed", e);
          alert("Gagal membuat PDF. Silakan coba lagi.");
        }
      }
      setIsDownloading(false);
    }, 100);
  };

  const formatMonth = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Helper to safely get parts of selectedPeriod
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Laporan Kinerja SKP</h2>
          <p className="text-gray-600 text-sm">Kelola dan cetak laporan harian Anda.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
            <div className="pl-2 text-gray-400">
              <Calendar size={18} />
            </div>
            <select
              value={currentSelectedMonth}
              onChange={(e) => {
                setSelectedPeriod(`${currentSelectedYear}-${e.target.value}`);
              }}
              className="p-2 bg-transparent outline-none text-gray-700 font-medium cursor-pointer hover:text-blue-600 text-sm"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="w-px h-6 bg-gray-300"></div>
            <select
              value={currentSelectedYear}
              onChange={(e) => {
                setSelectedPeriod(`${e.target.value}-${currentSelectedMonth}`);
              }}
              className="p-2 bg-transparent outline-none text-gray-700 font-bold cursor-pointer hover:text-blue-600 text-sm"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || filteredActivities.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 font-medium transition-colors disabled:bg-gray-400 whitespace-nowrap"
          >
            {isDownloading ? <span className="animate-spin">⌛</span> : <Download size={18} />}
            Unduh PDF
          </button>
        </div>
      </div>

      <UserProfileForm onProfileUpdate={setUserProfile} />

      <div id="activity-form-container">
        <ActivityForm
          onSubmit={handleAddActivity}
          onUpdate={handleUpdateActivity}
          onCancelEdit={() => setEditingActivity(null)}
          initialData={editingActivity}
          selectedMonth={selectedPeriod}
        />
      </div>

      {/* Preview Section */}
      <div className="animate-slide-in mt-8">
        <div className="flex justify-center mb-6 no-print">
          <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm font-bold shadow-sm">
            Preview Laporan Bulan {formatMonth(selectedPeriod)}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mb-4 no-print">
          Hanya menampilkan data bulan terpilih. Data bulan lain tetap tersimpan aman.
        </p>

        <PrintLayout
          activities={filteredActivities}
          onEdit={handleEditClick}
          onDelete={handleDeleteActivity}
          selectedPeriod={selectedPeriod}
          userProfile={userProfile}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};