import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

/**
 * Create a template Excel file for DKKB DAN REALISASI
 */
const createTemplateExcel = () => {
    const wb = XLSX.utils.book_new();

    // Create REALISASI sheet with headers
    const realisasiData = [
        ['LAPORAN REALISASI ANGGARAN'],
        [''],
        ['TABEL 1 - SEKSI PENGEMBANGAN'],
        [''],
        ['BAGIAN', ':', 'SEKSI PENGEMBANGAN'],
        ['SUMBER ANGGARAN', ':', 'PAD MURNI'],
        ['PROGRAM', ':', 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI'],
        ['Kegiatan', ':', ''],
        ['Sub Kegiatan', ':', ''],
        [''],
        ['NO', 'KODE REKENING', 'URAIAN', 'SEBELUM', 'SETELAH', 'JUMLAH', 'PAPBD', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES', 'JUMLAH REALISASI'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ];

    const ws_realisasi = XLSX.utils.aoa_to_sheet(realisasiData);

    // Set column widths
    ws_realisasi['!cols'] = [
        { wch: 5 },   // NO
        { wch: 15 },  // KODE REKENING
        { wch: 40 },  // URAIAN
        { wch: 12 },  // SEBELUM
        { wch: 12 },  // SETELAH
        { wch: 12 },  // JUMLAH
        { wch: 12 },  // PAPBD
        { wch: 10 },  // JAN
        { wch: 10 },  // FEB
        { wch: 10 },  // MAR
        { wch: 10 },  // APR
        { wch: 10 },  // MEI
        { wch: 10 },  // JUN
        { wch: 10 },  // JUL
        { wch: 10 },  // AGU
        { wch: 10 },  // SEP
        { wch: 10 },  // OKT
        { wch: 10 },  // NOV
        { wch: 10 },  // DES
        { wch: 12 },  // JUMLAH REALISASI
    ];

    XLSX.utils.book_append_sheet(wb, ws_realisasi, 'REALISASI');

    return wb;
};

// Generate and save the file
const wb = createTemplateExcel();
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync('./public/DKKB DAN REALISASI.xlsx', buffer);

console.log('✅ Template Excel file created successfully at: public/DKKB DAN REALISASI.xlsx');
