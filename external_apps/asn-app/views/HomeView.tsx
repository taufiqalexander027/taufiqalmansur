import React from 'react';
import { Briefcase, Star, FileText, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface HomeViewProps {
  onChangeView: (view: ViewState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  return (
    <div className="relative w-full min-h-[80vh]">
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative z-10">
        <div className="text-center mb-10 animate-slide-in">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Selamat Datang</h2>
          <p className="text-gray-600 text-sm md:text-base">Silakan pilih menu layanan di bawah ini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Card 1: SKP */}
          <button
            onClick={() => onChangeView('SKP')}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 text-left touch-manipulation active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase size={100} className="text-blue-900" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-900 group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">Dokumentasi Kinerja Harian</h3>
              <p className="text-sm text-gray-500 mb-6">
                Catat kegiatan harian, dokumentasi foto, dan cetak laporan bulanan otomatis.
              </p>

              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                Buka Layanan <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </button>

          {/* Card 2: Berakhlak */}
          <button
            onClick={() => onChangeView('BERAKHLAK')}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-2xl hover:border-yellow-300 hover:-translate-y-1 transition-all duration-300 text-left touch-manipulation active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star size={100} className="text-yellow-600" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 text-yellow-600 group-hover:scale-110 transition-transform">
                <Star size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">Self Assessment Berakhlak</h3>
              <p className="text-sm text-gray-500 mb-6">
                Evaluasi mandiri penerapan nilai-nilai dasar ASN Berakhlak.
              </p>

              <div className="flex items-center text-yellow-600 font-semibold group-hover:translate-x-2 transition-transform">
                Mulai Penilaian <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </button>

          {/* Card 3: Laporan Kinerja UMUM */}
          <button
            onClick={() => onChangeView('UMUM')}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 text-left touch-manipulation active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={100} className="text-green-600" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                <FileText size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">Laporan Kinerja UMUM</h3>
              <p className="text-sm text-gray-500 mb-6">
                Pencatatan kinerja umum lainnya untuk dokumentasi kegiatan ASN.
              </p>

              <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                Mulai Penilaian <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};