/**
 * Master Data Service
 * Handle CRUD operations for master data (Seksi, Program, Kegiatan, Rekening)
 * Uses API for persistence
 */

import { createMasterData, createRekening } from '../models/masterData.js';
import { getRekenings, syncMasterData } from './apiService';

export { syncMasterData }; // Re-export

/**
 * Load master data from API
 * Returns full master data structure (reconstructed from flat rekenings)
 */
export const getMasterData = async () => {
    try {
        const rekenings = await getRekenings();

        // Reconstruct Seksi, Programs, etc. from Rekenings if needed
        // For now, we just return the structure expected by the app
        // The app mainly uses 'rekenings' array.

        return {
            tahun: 2025,
            rekenings: rekenings,
            seksi: [], // TODO: Extract if needed
            programs: [],
            kegiatans: [],
            subKegiatans: []
        };
    } catch (error) {
        console.error('Error loading master data:', error);
        return createMasterData();
    }
};

/**
 * Save master data to API
 * We only sync 'rekenings' as that's the core data
 */
export const saveMasterData = async (data) => {
    return await syncMasterData(data.rekenings);
};

/**
 * Initialize master data from imported Excel data
 * This is a one-time setup function
 */
export const initializeFromImport = async (parsedData) => {
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
            }
        } catch (error) {
            console.error(`Error processing item ${index}:`, item, error);
        }
    });

    console.log('Total rekenings generated:', masterData.rekenings.length);

    // Sync to API
    await syncMasterData(masterData.rekenings);
    return masterData;
};

/**
 * Get list of all rekenings
 */
export const getAllRekening = async () => {
    return await getRekenings();
};

/**
 * Get rekenings filtered by seksi and sumber dana
 */
export const getRekeningBySeksi = async (seksiId, sumberDana) => {
    const rekenings = await getRekenings();
    return rekenings.filter(r =>
        (seksiId === 'ALL' || r.seksiId === seksiId) &&
        (sumberDana === 'ALL' || r.sumberDana.includes(sumberDana))
    );
};
