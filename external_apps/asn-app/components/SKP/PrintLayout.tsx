import React from 'react';
import { Activity, UserProfile } from '../../types';
import { Trash2, Edit2 } from 'lucide-react';

interface PrintLayoutProps {
  activities: Activity[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selectedPeriod: string; // YYYY-MM
  userProfile: UserProfile;
  isDownloading?: boolean;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ activities, onEdit, onDelete, selectedPeriod, userProfile, isDownloading = false }) => {
  // Chunk activities into groups of 3
  const chunkSize = 3;
  const pages: Activity[][] = [];
  
  for (let i = 0; i < activities.length; i += chunkSize) {
    pages.push(activities.slice(i, i + chunkSize));
  }
  
  if (pages.length === 0) {
    pages.push([]);
  }

  const totalPages = pages.length;

  const getHeaderDate = () => {
    if (!selectedPeriod) return '...';
    const date = new Date(selectedPeriod + "-01");
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <div id="skp-print-container" className="w-full flex flex-col items-center">
      {pages.map((pageActivities, pageIndex) => (
        <div 
          key={pageIndex} 
          className={`sheet ${isDownloading ? 'sheet-print' : 'sheet-preview'}`}
        >
          {/* Header per Page */}
          <div className="text-center mb-6 pb-2 border-b-2 border-black flex-shrink-0">
            <h1 className="text-lg font-bold uppercase tracking-wide leading-tight text-black">
              DOKUMENTASI KINERJA BULAN {getHeaderDate()}
            </h1>
            <h2 className="text-base font-bold uppercase mt-1 text-black">
              {userProfile.unitKerja || 'NAMA INSTANSI BELUM DIISI'}
            </h2>
            <div className="text-sm font-bold mt-1 text-black uppercase">
                {userProfile.nama || 'NAMA PEGAWAI'} 
                {userProfile.jabatan ? ` - ${userProfile.jabatan}` : ''}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            {pageActivities.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-gray-400 italic border-2 border-dashed border-gray-200 rounded-lg">
                 Belum ada laporan kinerja untuk bulan ini.
               </div>
            ) : (
              pageActivities.map((activity) => (
                <div key={activity.id} className="flex gap-5 border-b border-gray-200 pb-6 last:border-0 relative group">
                  
                  {/* Action Buttons */}
                  {!isDownloading && (
                    <div className="absolute -right-2 -top-2 flex gap-2 no-print z-[9999] pointer-events-auto">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(activity.id);
                        }}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:scale-110 transition-all cursor-pointer active:scale-95 touch-manipulation"
                        title="Edit"
                        aria-label="Edit kegiatan"
                      >
                        <Edit2 size={18} className="pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(activity.id);
                        }}
                        className="p-3 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 hover:scale-110 transition-all cursor-pointer active:scale-95 touch-manipulation"
                        title="Hapus"
                        aria-label="Hapus kegiatan"
                      >
                        <Trash2 size={18} className="pointer-events-none" />
                      </button>
                    </div>
                  )}

                  {/* Image Section */}
                  <div className="w-[40%] flex-shrink-0">
                    <div className="w-full aspect-[4/3] bg-gray-100 rounded overflow-hidden border border-gray-300 shadow-sm">
                      {activity.image ? (
                        <img 
                          src={activity.image} 
                          alt="Dokumentasi" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="w-[60%] flex flex-col gap-2 text-gray-800 text-sm">
                    <div>
                      <h4 className="font-bold text-gray-600 text-xs uppercase">Tgl</h4>
                      <p className="font-semibold text-black">
                        {new Date(activity.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-600 text-xs uppercase tracking-wide">LOKASI</h4>
                      <p className="font-medium text-black leading-snug">
                        {activity.location}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-600 text-xs uppercase tracking-wide">KEGIATAN</h4>
                      <p className="text-black leading-relaxed text-justify whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer Page Number */}
          <div className="mt-auto pt-4 border-t border-gray-300 flex justify-end text-xs text-gray-500 flex-shrink-0">
            <span className="font-semibold italic text-black">Halaman {pageIndex + 1} dari {totalPages}</span>
          </div>
        </div>
      ))}
    </div>
  );
};