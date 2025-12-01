import React from 'react';
import { Assessment, UserProfile } from '../../types';
import { Trash2, Edit2 } from 'lucide-react';

interface AssessmentPrintLayoutProps {
  assessments: Assessment[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  selectedPeriod: string;
  userProfile: UserProfile;
  isDownloading?: boolean;
}

export const AssessmentPrintLayout: React.FC<AssessmentPrintLayoutProps> = ({
  assessments,
  onDelete,
  onEdit,
  selectedPeriod,
  userProfile,
  isDownloading = false
}) => {

  const formatDateLong = (dateString: string) => {
    if (!dateString) return '-';
    // Handle both ISO string and YYYY-MM-DD
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const cleanIndicatorName = (fullIndicator: string) => {
    const match = fullIndicator.match(/^\d+\.\s*(.+)/);
    return match ? match[1] : fullIndicator;
  };

  // --- MANUAL PAGINATION LOGIC ---
  const paginateAssessment = (assessment: Assessment) => {
    const pages = [];
    const text = assessment.description || '';

    // KONFIGURASI BATAS KARAKTER (Diperbesar sesuai permintaan)
    // Halaman 1 dikurangi 200 char total untuk fit A4 dengan baik (2050 char)
    const CHARS_PAGE_1 = 1800;
    const CHARS_PAGE_FULL = 2700;

    // Biaya Enter dikurangi agar tidak terlalu agresif memotong
    const NEWLINE_COST = 15;

    let remainingText = text;
    let pageIndex = 0;

    while (remainingText.length > 0) {
      let limitRaw = pageIndex === 0 ? CHARS_PAGE_1 : CHARS_PAGE_FULL;
      let currentLimit = limitRaw;
      let accumulatedCost = 0;
      let cutIndex = 0;

      for (let i = 0; i < remainingText.length; i++) {
        const char = remainingText[i];
        const cost = (char === '\n') ? NEWLINE_COST : 1;

        accumulatedCost += cost;

        if (accumulatedCost > currentLimit) {
          break;
        }
        cutIndex++;
      }

      if (cutIndex < remainingText.length) {
        const lastSpace = remainingText.lastIndexOf(' ', cutIndex);
        if (lastSpace > 0) {
          cutIndex = lastSpace;
        }
      }

      const textChunk = remainingText.substring(0, cutIndex);
      remainingText = remainingText.substring(cutIndex).trimStart();

      pages.push({
        text: textChunk,
        isFirstPage: pageIndex === 0,
        pageIndex: pageIndex
      });

      pageIndex++;
      if (pageIndex > 20) break;
    }

    if (pages.length === 0) {
      pages.push({ text: '', isFirstPage: true, pageIndex: 0 });
    }

    return pages;
  };

  if (assessments.length === 0) {
    return (
      <div className="w-full flex justify-center p-10 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 italic">
        Belum ada data penilaian untuk indikator terpilih pada bulan ini.
      </div>
    );
  }

  return (
    <div id="assessment-print-container" className="w-full flex flex-col items-center">
      {assessments.map((assessment) => {
        const isUmum = assessment.indicator.startsWith("8.") || assessment.indicator.startsWith("UMUM");
        const assessmentPages = paginateAssessment(assessment);
        const totalAssessmentPages = assessmentPages.length;

        // Use assessment specific date, fallback to timestamp
        const displayDate = assessment.date || assessment.timestamp;

        return (
          <React.Fragment key={assessment.id}>
            {assessmentPages.map((page, pgIndex) => {
              const isLastPage = (pgIndex === totalAssessmentPages - 1);

              return (
                <div
                  key={`${assessment.id}_${pgIndex}`}
                  className={`sheet ${isDownloading ? 'sheet-print' : 'sheet-preview'}`}
                >
                  {/* Action Buttons (Only on First Page) */}
                  {!isDownloading && page.isFirstPage && (
                    <div className="absolute top-3 right-3 flex gap-2 no-print z-[9999]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(assessment.id);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(assessment.id);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* HEADER */}
                  <div className={`text-center relative flex-shrink-0 ${page.isFirstPage ? 'mb-6' : 'mb-4'}`}>
                    {page.isFirstPage && (
                      <>
                        <h2 className="text-xs font-bold uppercase text-black tracking-wide">
                          {userProfile.unitKerja || 'UPT. PELATIHAN PERTANIAN PROVINSI JAWA TIMUR'}
                        </h2>
                        <h3 className="text-xs font-bold uppercase text-black mt-0.5">
                          DINAS PERTANIAN DAN KETAHANAN PANGAN
                        </h3>
                        <h3 className="text-xs font-bold uppercase text-black">
                          PROVINSI JAWA TIMUR
                        </h3>

                        <div className="mt-2 pt-1 border-t-2 border-black w-full"></div>
                      </>
                    )}

                    <h1 className="text-sm font-bold uppercase mt-1 text-black">
                      LAPORAN REALISASI KEGIATAN {page.isFirstPage ? '' : '(LANJUTAN)'}
                    </h1>
                    <div className="mt-1 border-b-2 border-black w-full"></div>
                  </div>

                  {/* IDENTITY TABLE */}
                  {page.isFirstPage && (
                    <div className="mb-6 px-4 flex-shrink-0">
                      <table className="w-full text-sm leading-snug">
                        <tbody>
                          <tr>
                            <td className="align-top font-medium w-40 text-black py-1">Nama Lengkap</td>
                            <td className="align-top text-black px-2 py-1">:</td>
                            <td className="align-top font-bold text-black uppercase py-1">
                              {userProfile.nama || '(Belum diisi)'}
                            </td>
                          </tr>
                          <tr>
                            <td className="align-top font-medium text-black py-1">NIP</td>
                            <td className="align-top text-black px-2 py-1">:</td>
                            <td className="align-top font-bold text-black py-1">
                              {userProfile.nip || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="align-top font-medium text-black py-1">Pangkat / Gol.</td>
                            <td className="align-top text-black px-2 py-1">:</td>
                            <td className="align-top font-bold text-black py-1">
                              {userProfile.pangkat || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="align-top font-medium text-black py-1">Jabatan</td>
                            <td className="align-top text-black px-2 py-1">:</td>
                            <td className="align-top font-bold text-black py-1">
                              {userProfile.jabatan || '-'}
                            </td>
                          </tr>

                          {isUmum ? (
                            <tr>
                              <td className="align-top font-medium text-black py-1">Tupoksi / Kegiatan</td>
                              <td className="align-top text-black px-2 py-1">:</td>
                              <td className="align-top font-bold text-black py-1">
                                {assessment.customTitle || '-'}
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td className="align-top font-medium text-black py-1">Indikator BERAKHLAK</td>
                              <td className="align-top text-black px-2 py-1">:</td>
                              <td className="align-top font-bold text-black py-1">
                                {cleanIndicatorName(assessment.indicator)}
                              </td>
                            </tr>
                          )}

                          <tr>
                            <td className="align-top font-medium text-black py-1">Tanggal</td>
                            <td className="align-top text-black px-2 py-1">:</td>
                            <td className="align-top font-bold text-black py-1">
                              {formatDateLong(displayDate)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  <div className="flex-1 mb-2 px-4">
                    <h4 className="font-bold text-sm text-black uppercase mb-2">
                      {page.isFirstPage ? 'URAIAN KEGIATAN' : ''}
                    </h4>
                    <p className="text-sm text-black leading-relaxed text-justify whitespace-pre-wrap">
                      {page.text}
                    </p>
                  </div>

                  {/* DOCUMENTATION & SIGNATURE (Only on Last Page) */}
                  {isLastPage && (
                    <div className="flex-shrink-0 mt-auto mb-10">
                      {(() => {
                        const allImages = assessment.images && assessment.images.length > 0
                          ? assessment.images
                          : (assessment.image ? [assessment.image] : []);

                        if (allImages.length === 0) return null;

                        return (
                          <div className="mb-4 px-4 text-center">
                            <h4 className="font-bold text-sm text-black uppercase mb-2">DOKUMENTASI KEGIATAN</h4>
                            <div className="flex justify-center gap-4">
                              {allImages.slice(0, 2).map((img, imgIndex) => (
                                <div key={imgIndex} className="border border-gray-400 p-1 bg-white shadow-sm" style={{ width: '48%' }}>
                                  <img
                                    src={img}
                                    alt={`Dokumentasi ${imgIndex + 1}`}
                                    className="w-full aspect-[4/3] object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* SIGNATURE */}
                      <div className="px-4 w-full flex justify-end">
                        <div className="text-center min-w-[200px]">
                          <p className="text-sm text-black mb-6">
                            {userProfile.kota || 'Malang'}, {formatDateLong(displayDate)}
                          </p>
                          <div className="h-24 flex justify-center items-center relative z-10">
                            {userProfile.nama && userProfile.nama.toLowerCase().includes('taufiq mansur') ? (
                              <img src="/signature.png" alt="Tanda Tangan" className="h-full object-contain scale-125 mix-blend-multiply" />
                            ) : null}
                          </div>
                          <p className="text-sm font-bold text-black uppercase border-b border-black inline-block pb-0.5 px-2 relative z-20 mt-2">
                            {userProfile.nama || 'NAMA PEGAWAI'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Page Number */}
                  <div className="w-full text-center mt-2 pt-1 border-t-2 border-dotted border-blue-200 text-[10px] text-gray-500 italic flex justify-center items-center gap-2 flex-shrink-0">
                    {!isDownloading && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                    <span className={`px-3 py-1 rounded-full ${!isDownloading ? 'bg-blue-50 border border-blue-200' : ''}`}>
                      {isDownloading ? `Halaman ${pgIndex + 1} dari ${totalAssessmentPages}` : `✓ Halaman ${pgIndex + 1} / ${totalAssessmentPages} - A4`}
                    </span>
                    {!isDownloading && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};