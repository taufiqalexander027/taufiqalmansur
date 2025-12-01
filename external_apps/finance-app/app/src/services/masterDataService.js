/**
 * Master Data Service
 * Handle CRUD operations for master data (Seksi, Program, Kegiatan, Rekening)
 * Uses localStorage for persistence
 */

import { createMasterData, createRekening } from '../models/masterData.js';

const STORAGE_KEY = 'realisasi_keuangan_master_data';

/**
 * Load master data from storage
 */
export const getMasterData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : createMasterData();
    } catch (error) {
        console.error('Error loading master data:', error);
        return createMasterData();
    }
};

/**
 * Save master data to storage
 */
export const saveMasterData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ Master data saved successfully to localStorage');
        console.log('   Total rekening:', data.rekenings.length);
        console.log('   Total seksi:', data.seksi.length);
        return true;
    } catch (error) {
        console.error('❌ Error saving master data:', error);
        return false;
    }
};

/**
 * Initialize master data from imported Excel data
 * This is a one-time setup function
 */
export const initializeFromImport = (parsedData) => {
    console.log('initializeFromImport called with', parsedData.length, 'items');
    const masterData = createMasterData();

    // Extract unique Seksi, Programs, Kegiatans, SubKegiatans
    const seksiMap = new Map();
    const programMap = new Map();
    const kegiatanMap = new Map();
    const subKegiatanMap = new Map();

    // parsedData is a flat array of items from the Excel parser
    parsedData.forEach((item, index) => {
        try {
            // Debug logging for SEKSI PELATIHAN
            if (item.seksi === 'SEKSI PELATIHAN') {
                console.log(`Processing SEKSI PELATIHAN item ${index}:`, item);
            }

            // 1. Seksi
            if (!seksiMap.has(item.seksi)) {
                seksiMap.set(item.seksi, {
                    id: item.seksi.replace(/\s+/g, '_').toUpperCase(),
                    nama: item.seksi
                });
            }
            const seksiId = seksiMap.get(item.seksi).id;

            // 2. Program
            const programKey = item.program || 'DEFAULT';
            if (!programMap.has(programKey)) {
                programMap.set(programKey, {
                    id: `PROG_${programKey.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`,
                    nama: programKey,
                    kode: programKey.split(' ')[0] // Assuming code is at start
                });
            }
            const program = programMap.get(programKey);

            // 3. Kegiatan
            const kegiatanKey = item.kegiatan || 'DEFAULT';
            if (!kegiatanMap.has(kegiatanKey)) {
                kegiatanMap.set(kegiatanKey, {
                    id: `KEG_${kegiatanKey.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`,
                    nama: kegiatanKey
                });
            }
            const kegiatan = kegiatanMap.get(kegiatanKey);

            // 4. Sub Kegiatan
            const subKegiatanKey = item.subKegiatan || 'DEFAULT';
            if (!subKegiatanMap.has(subKegiatanKey)) {
                subKegiatanMap.set(subKegiatanKey, {
                    id: `SUBKEG_${subKegiatanKey.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`,
                    nama: subKegiatanKey
                });
            }
            const subKegiatan = subKegiatanMap.get(subKegiatanKey);

            // 5. Rekening
            // Check if rekening already exists (same kode AND same seksiId)
            const existingRek = masterData.rekenings.find(r =>
                r.kode === item.kodeRekening && r.seksiId === seksiId
            );

            // Determine Sumber Dana from item.sumberAnggaran
            const sumberDana = item.sumberAnggaran && item.sumberAnggaran.toUpperCase().includes('DBHCHT')
                ? 'DBHCHT'
                : 'PAD MURNI';

            if (existingRek) {
                // Update existing rekening (same kode, same seksi, different sumber dana)
                if (!existingRek.sumberDana.includes(sumberDana)) {
                    existingRek.sumberDana.push(sumberDana);
                }
                existingRek.anggaranPAPBD[sumberDana] = item.anggaranPAPBD;

                if (item.seksi === 'SEKSI PELATIHAN') {
                    console.log(`Updated existing rekening for SEKSI PELATIHAN:`, existingRek.kode);
                }
            } else {
                // Create new rekening (new kode OR same kode but different seksi)
                const newRek = createRekening({
                    kode: item.kodeRekening,
                    uraian: item.uraian,
                    seksiId: seksiId,
                    sumberDana: [sumberDana],
                    programId: program.id,
                    programNama: program.nama,
                    kegiatanId: kegiatan.id,
                    kegiatanNama: kegiatan.nama,
                    subKegiatanId: subKegiatan.id,
                    subKegiatanNama: subKegiatan.nama,
                    anggaranPAPBD: {
                        [sumberDana]: item.anggaranPAPBD
                    },
                    sheetName: item.sheetName // Preserve sheet name
                });
                masterData.rekenings.push(newRek);

                if (item.seksi === 'SEKSI PELATIHAN') {
                    console.log(`Created new rekening for SEKSI PELATIHAN:`, newRek.kode);
                }
            }
        } catch (error) {
            console.error(`Error processing item ${index}:`, item, error);
        }
    });

    // Convert Maps to Arrays
    masterData.seksi = Array.from(seksiMap.values());
    masterData.programs = Array.from(programMap.values());
    masterData.kegiatans = Array.from(kegiatanMap.values());
    masterData.subKegiatans = Array.from(subKegiatanMap.values());

    console.log('Saving masterData.seksi:', masterData.seksi);
    console.log('Total rekenings:', masterData.rekenings.length);

    // Log rekening distribution by seksi
    const rekeningBySeksi = {};
    masterData.rekenings.forEach(rek => {
        const seksiNama = masterData.seksi.find(s => s.id === rek.seksiId)?.nama || 'Unknown';
        rekeningBySeksi[seksiNama] = (rekeningBySeksi[seksiNama] || 0) + 1;
    });
    console.log('Rekening distribution by seksi:', rekeningBySeksi);

    saveMasterData(masterData);
    return masterData;
};

/**
 * Get list of all rekenings
 */
export const getAllRekening = () => {
    const data = getMasterData();
    return data.rekenings;
};

/**
 * Get rekenings filtered by seksi and sumber dana
 */
export const getRekeningBySeksi = (seksiId, sumberDana) => {
    const data = getMasterData();
    return data.rekenings.filter(r =>
        (seksiId === 'ALL' || r.seksiId === seksiId) &&
        (sumberDana === 'ALL' || r.sumberDana.includes(sumberDana))
    );
};
