import * as XLSX from 'xlsx';
import { generateUUID } from '../models/financialData';

/**
 * Parse Excel file DKKB DAN REALISASI.xlsx
 * Extract data from REALISASI sheet (Tables 1, 2, 3, 7)
 */
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let allParsedData = [];

                // Iterate through all sheets
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    console.log(`Parsing sheet: ${sheetName}`);

                    try {
                        const sheetData = parseRealisasiTables(worksheet, sheetName);
                        if (sheetData && sheetData.length > 0) {
                            console.log(`Sheet ${sheetName}: Found ${sheetData.length} items`);
                            allParsedData = [...allParsedData, ...sheetData];
                        }
                    } catch (err) {
                        console.warn(`Error parsing sheet ${sheetName}:`, err);
                    }
                });

                if (allParsedData.length === 0) {
                    console.warn('No data found in any sheet');
                }

                resolve(allParsedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Parse specific tables from REALISASI sheet
 */
const parseRealisasiTables = (worksheet, sheetName) => {
    if (!worksheet['!ref']) return [];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const allItems = [];

    // Strategy: Scan entire sheet and detect sections by looking for:
    // 1. "TABEL" keyword with number (Tabel 1, 2, 3)
    // 2. Section headers with "KODE REKENING" or "BAGIAN" (for all tables)
    // 3. Yellow background cells (optional visual marker)

    let currentSeksi = null;
    let currentSumberDana = null;
    let currentProgram = null;
    let currentKegiatan = null;
    let currentSubKegiatan = null;
    let skipCurrentTable = false; // Flag to skip summary tables (Tabel 4, 5, 6)

    for (let row = 0; row <= range.e.r; row++) {
        const col1 = getCellValue(worksheet, row, 0); // Column A
        const col2 = getCellValue(worksheet, row, 1); // Column B
        const col3 = getCellValue(worksheet, row, 2); // Column C
        const col4 = getCellValue(worksheet, row, 3);

        // Detect section headers (BAGIAN, KODE REKENING, etc.)
        const col1Str = col1 ? col1.toString().toUpperCase() : '';
        const col2Str = col2 ? col2.toString().toUpperCase() : '';
        const col3Str = col3 ? col3.toString().toUpperCase() : '';

        // Detect BAGIAN/Seksi
        if (col1Str.includes('BAGIAN') || col2Str === 'BAGIAN') {
            currentSeksi = col3 || col2;
            console.log('Found Seksi:', currentSeksi);
        }

        // Also check KETERANGAN field (might contain seksi info)
        if (col2Str === 'KETERANGAN' || col1Str.includes('KETERANGAN')) {
            const keteranganValue = (col3 || col2).toString().toUpperCase();
            if (keteranganValue.includes('PELATIHAN PERTANIAN')) {
                currentSeksi = 'SEKSI PELATIHAN';
                console.log('Found Seksi from Keterangan:', currentSeksi);
            }
        }

        // Detect SUMBER ANGGARAN
        if (col2Str === 'SUMBER ANGGARAN' || col1Str.includes('SUMBER ANGGARAN')) {
            currentSumberDana = col3 || col2;
            console.log(`[Sheet Debug] Found Sumber Dana: ${currentSumberDana}`);

            // Check if this is a summary table (combined sumber dana with '+')
            const sumberDanaStr = currentSumberDana ? currentSumberDana.toString().toUpperCase() : '';
            if (sumberDanaStr.includes('+')) {
                skipCurrentTable = true;
                console.log('Skipping summary table (combined sumber dana):', currentSumberDana);
            } else {
                skipCurrentTable = false;
            }
        }

        // Skip processing if in summary table
        if (skipCurrentTable) {
            continue;
        }

        // Detect PROGRAM
        if (col2Str === 'PROGRAM' || col1Str.includes('PROGRAM')) {
            currentProgram = col3 || col4 || col2;
            console.log(`[Sheet Debug] Found Program: ${currentProgram}`);

            // Normalize Program Name
            if (currentProgram && currentProgram.toString().includes('PENUNJANG')) {
                currentProgram = 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI';
            } else if (currentProgram && currentProgram.toString().includes('PENYULUHAN')) {
                currentProgram = 'PROGRAM PENYULUHAN PERTANIAN';
            }
        }

        // Detect Kegiatan
        if (col2Str === 'KEGIATAN' || col2Str.includes('KEGIATAN')) {
            currentKegiatan = col3 === ':' ? col4 : col3;
        }

        // Detect Sub Kegiatan
        if (col2Str === 'SUB KEGIATAN' || col2Str.includes('SUB KEGIATAN')) {
            currentSubKegiatan = col3 === ':' ? col4 : col3;
        }

        // Detect data rows: Number in col1, Kode Rekening (with dots) in col2
        if (typeof col1 === 'number' && col2 && typeof col2 === 'string' && col2.includes('.')) {
            // This is a data row
            const anggaranPAPBD = getCellValue(worksheet, row, 6) || 0; // Column G
            const normalizedSeksi = normalizeSeksi(currentSeksi);

            // Skip if seksi is null (summary tables)
            if (normalizedSeksi === null) {
                continue;
            }

            allItems.push({
                sheetName: sheetName, // Add sheet name
                seksi: normalizedSeksi,
                sumberAnggaran: currentSumberDana,
                program: currentProgram || 'DEFAULT',
                kegiatan: currentKegiatan || 'DEFAULT',
                subKegiatan: currentSubKegiatan || 'DEFAULT',
                kodeRekening: col2.toString().trim(),
                uraian: col3 ? col3.toString().trim() : '',
                anggaranPAPBD: Number(anggaranPAPBD) || 0
            });
        }
    }

    console.log(`Total items parsed: ${allItems.length}`);
    console.log('Unique Seksi found:', [...new Set(allItems.map(i => i.seksi))]);
    return allItems;
};

/**
 * Parse a single table starting from specific row
 */
const parseTable = (worksheet, startRow, maxRow) => {
    const items = [];

    // Read Header Info (Bagian, Sumber Anggaran, Program)
    // Usually within 10 rows after TABEL marker
    let seksi = '';
    let sumberDana = '';
    let currentProgram = '';
    let currentKegiatan = '';
    let currentSubKegiatan = '';

    // Iterate rows for this table until next table or end
    for (let row = startRow; row <= maxRow; row++) {
        const col1 = getCellValue(worksheet, row, 0);
        const col2 = getCellValue(worksheet, row, 1);
        const col3 = getCellValue(worksheet, row, 2);
        const col4 = getCellValue(worksheet, row, 3);

        // Stop if we hit another table
        if (col1 === 'TABEL' && row > startRow) break;

        // Detect Header Info
        if (col2 === 'BAGIAN') seksi = col3;
        if (col2 === 'SUMBER ANGGARAN') sumberDana = col3;

        // Detect Program
        if (col2 === 'PROGRAM' || (col1 && col1.toString().includes('PROGRAM'))) {
            // Handle various formats of Program header
            currentProgram = col3 || col4 || col1;
        }

        // Detect Kegiatan
        // Format 1: col2='Kegiatan', col3=nama
        if (col2 === 'Kegiatan' && col3) {
            currentKegiatan = col3;
        }
        // Format 2: col2='Kegiatan', col3=':', col4=nama
        else if (col2 === 'Kegiatan' && col3 === ':' && col4) {
            currentKegiatan = col4;
        }

        // Detect Sub Kegiatan
        // Format 1: col2='Sub Kegiatan', col3=nama
        if (col2 === 'Sub Kegiatan' && col3) {
            currentSubKegiatan = col3;
        }
        // Format 2: col2='Sub Kegiatan', col3=':', col4=nama
        else if (col2 === 'Sub Kegiatan' && col3 === ':' && col4) {
            currentSubKegiatan = col4;
        }

        // Detect Item (Number in col1, Kode Rekening in col2)
        if (typeof col1 === 'number' && col2 && typeof col2 === 'string' && col2.includes('.')) {
            // Extract Anggaran PAPBD (Column G / Index 6)
            // Note: Column index might vary, usually col 6 (G) is PAPBD
            const anggaranPAPBD = getCellValue(worksheet, row, 6) || 0;

            items.push({
                seksi: normalizeSeksi(seksi),
                sumberAnggaran: sumberDana, // Pass raw sumber dana
                program: currentProgram,
                kegiatan: currentKegiatan,
                subKegiatan: currentSubKegiatan,
                kodeRekening: col2.toString().trim(),
                uraian: col3 ? col3.toString().trim() : '',
                anggaranPAPBD: Number(anggaranPAPBD) || 0
            });
        }
    }

    return items;
};

/**
 * Normalize Seksi Name
 */
const normalizeSeksi = (rawSeksi) => {
    if (!rawSeksi) return 'UMUM';
    const upper = rawSeksi.toString().toUpperCase().trim();

    // Check for exact match first (already normalized from BAGIAN detection)
    if (upper === 'SEKSI PELATIHAN') {
        return 'SEKSI PELATIHAN';
    }
    if (upper === 'SEKSI PENGEMBANGAN') {
        return 'SEKSI PENGEMBANGAN';
    }
    if (upper === 'SUB BAGIAN TATA USAHA') {
        return 'SUB BAGIAN TATA USAHA';
    }

    // SEKSI PELATIHAN (Tabel 2) - from raw Excel data
    // Includes: "UPT PELATIHAN", "PELATIHAN PERTANIAN", etc.
    if ((upper.includes('UPT') && upper.includes('PELATIHAN')) ||
        upper.includes('PELATIHAN PERTANIAN') ||
        (upper.includes('PELATIHAN') && upper.includes('PERTANIAN'))) {
        return 'SEKSI PELATIHAN';
    }

    // Ignore UPT summary tables (Tabel 4, 5, 6)
    // These are combinations of raw data tables
    if (upper.includes('UPT') && !upper.includes('SEKSI')) {
        return null; // Skip this - it's a summary table
    }

    // SEKSI PENGEMBANGAN (Tabel 1, 3)
    else if (upper.includes('PENGEMBANGAN') || upper.includes('BANGLAT')) {
        return 'SEKSI PENGEMBANGAN';
    }
    // SUB BAGIAN TATA USAHA (Tabel 7)
    else if (upper.includes('TATA USAHA') || upper.includes('TU') || upper.includes('SUB BAGIAN')) {
        return 'SUB BAGIAN TATA USAHA';
    }

    // Return null for unrecognized (will be skipped)
    return null;
};

/**
 * Parse Standardized Excel Format
 * Columns: NO | SEKSI | PROGRAM | KEGIATAN | SUB KEGIATAN | KODE REKENING | URAIAN | SUMBER DANA | ANGGARAN | REALISASI JAN...DEC
 */
export const parseStandardizedExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                if (!worksheet['!ref']) {
                    resolve([]);
                    return;
                }

                const range = XLSX.utils.decode_range(worksheet['!ref']);
                const items = [];

                // Assuming Row 1 is Header, Data starts at Row 2 (Index 1)
                for (let row = 1; row <= range.e.r; row++) {
                    const colSeksi = getCellValue(worksheet, row, 1); // B
                    const colProgram = getCellValue(worksheet, row, 2); // C
                    const colKegiatan = getCellValue(worksheet, row, 3); // D
                    const colSubKegiatan = getCellValue(worksheet, row, 4); // E
                    const colKode = getCellValue(worksheet, row, 5); // F
                    const colUraian = getCellValue(worksheet, row, 6); // G
                    const colSumberDana = getCellValue(worksheet, row, 7); // H
                    const colAnggaran = getCellValue(worksheet, row, 8); // I

                    // Skip if no Kode Rekening
                    if (!colKode) continue;

                    // Create Record
                    let seksi = colSeksi ? colSeksi.toString().toUpperCase() : 'UMUM';

                    // Normalize Typos
                    if (seksi.includes('SUB BAGIN')) {
                        seksi = seksi.replace('SUB BAGIN', 'SUB BAGIAN');
                    }

                    const record = {
                        id: generateUUID(),
                        seksi: seksi.trim(),
                        program: colProgram ? colProgram.toString().trim() : '',
                        kegiatan: colKegiatan ? colKegiatan.toString().trim() : '',
                        subKegiatan: colSubKegiatan ? colSubKegiatan.toString().trim() : '',
                        kodeRekening: colKode.toString().trim(),
                        uraian: colUraian ? colUraian.toString().trim() : '',
                        sumberDana: colSumberDana ? colSumberDana.toString().trim().toUpperCase() : 'PAD MURNI',
                        anggaran: {
                            sebelum: 0,
                            setelah: 0,
                            papbd: Number(colAnggaran) || 0
                        },
                        realisasi: {}
                    };

                    // Parse Monthly Realization (Columns J to U)
                    // J=Jan, K=Feb, ... U=Dec
                    const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
                    months.forEach((month, index) => {
                        const colIndex = 9 + index; // J is index 9
                        const val = getCellValue(worksheet, row, colIndex);
                        record.realisasi[month] = {
                            dkkb: 0,
                            realisasi: Number(val) || 0
                        };
                    });

                    items.push(record);
                }

                resolve(items);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Get cell value from worksheet
 */
const getCellValue = (worksheet, row, col) => {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = worksheet[cellAddress];
    return cell ? cell.v : null;
};
