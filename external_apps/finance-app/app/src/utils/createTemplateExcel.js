import * as XLSX from 'xlsx';

/**
 * Create a template Excel file for DKKB DAN REALISASI
 * This creates an empty template with the expected structure
 */
export const createTemplateExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create REALISASI sheet with basic structure
    const realisasiData = [
        ['LAPORAN REALISASI ANGGARAN'],
        [''],
        ['TABEL 1'],
        [''],
        ['BAGIAN', ':', 'SEKSI PENGEMBANGAN'],
        ['SUMBER ANGGARAN', ':', 'PAD MURNI'],
        ['PROGRAM', ':', 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI'],
        ['Kegiatan', ':', 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah'],
        ['Sub Kegiatan', ':', 'Penyusunan Dokumen Perencanaan Perangkat Daerah'],
        [''],
        ['NO', 'KODE REKENING', 'URAIAN', 'SEBELUM', 'SETELAH', 'JUMLAH', 'PAPBD', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES', 'JUMLAH REALISASI'],
        // Empty data rows - users will fill these in
    ];
    
    const ws_realisasi = XLSX.utils.aoa_to_sheet(realisasiData);
    XLSX.utils.book_append_sheet(wb, ws_realisasi, 'REALISASI');
    
    return wb;
};

/**
 * Download the template Excel file
 */
export const downloadTemplateExcel = () => {
    const wb = createTemplateExcel();
    XLSX.writeFile(wb, 'DKKB DAN REALISASI.xlsx');
};
