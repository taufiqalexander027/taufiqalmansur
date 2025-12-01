/**
 * Financial Data Model
 * Stores manual input for the financial realization table.
 * ADAPTER: Fetches from API Services and formats for FinancialTable.
 */

import { getAllRekening } from '../services/masterDataService';
import { getTransactionData } from '../services/transactionService';

export const MONTHS = [
    { key: 'jan', label: 'Januari' },
    { key: 'feb', label: 'Februari' },
    { key: 'mar', label: 'Maret' },
    { key: 'apr', label: 'April' },
    { key: 'mei', label: 'Mei' },
    { key: 'jun', label: 'Juni' },
    { key: 'jul', label: 'Juli' },
    { key: 'aug', label: 'Agustus' },
    { key: 'sep', label: 'September' },
    { key: 'okt', label: 'Oktober' },
    { key: 'nov', label: 'November' },
    { key: 'des', label: 'Desember' }
];

export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const createFinancialRecord = ({
    seksi = '',
    program = '',
    kegiatan = '',
    subKegiatan = '',
    kodeRekening = '',
    uraian = '',
    sumberDana = 'PAD MURNI'
}) => {
    const record = {
        id: generateUUID(),
        seksi,
        program,
        kegiatan,
        subKegiatan,
        kodeRekening,
        uraian,
        sumberDana,
        anggaran: {
            sebelum: 0,
            setelah: 0,
            papbd: 0
        },
        realisasi: {}
    };

    // Initialize months
    MONTHS.forEach(m => {
        record.realisasi[m.key] = { dkkb: 0, realisasi: 0 };
    });

    return record;
};

// --- API Adapter Functions ---

export const getFinancialData = async () => {
    try {
        const [rekenings, transactions] = await Promise.all([
            getAllRekening(),
            getTransactionData()
        ]);

        // Merge Master Data (Rekenings) with Transactions
        return rekenings.map(rek => {
            const record = {
                id: rek.id,
                seksi: rek.seksiId, // Map seksiId to seksi for frontend compatibility
                program: rek.program?.nama || '',
                kegiatan: rek.kegiatan?.nama || '',
                subKegiatan: rek.subKegiatan?.nama || '',
                kodeRekening: rek.kode,
                uraian: rek.uraian,
                sumberDana: rek.sumberDana[0] || 'PAD MURNI', // Assuming 1 sumber dana per row for now
                anggaran: {
                    sebelum: 0,
                    setelah: 0,
                    papbd: rek.anggaranPAPBD[rek.sumberDana[0]] || 0
                },
                realisasi: {}
            };

            // Initialize months
            MONTHS.forEach(m => {
                record.realisasi[m.key] = { dkkb: 0, realisasi: 0 };
            });

            // Fill transactions
            // transactions.realisasi is array of { rekeningId, bulan, nilai, ... }
            transactions.realisasi.forEach(t => {
                if (t.rekeningId === rek.id) {
                    const monthKey = m => m.label.toLowerCase() === t.bulan.toLowerCase();
                    const m = MONTHS.find(monthKey);
                    if (m) {
                        record.realisasi[m.key].realisasi = t.nilai;
                    }
                }
            });

            transactions.dkkb.forEach(t => {
                if (t.rekeningId === rek.id) {
                    const monthKey = m => m.label.toLowerCase() === t.bulan.toLowerCase();
                    const m = MONTHS.find(monthKey);
                    if (m) {
                        record.realisasi[m.key].dkkb = t.nilai;
                    }
                }
            });

            return record;
        });

    } catch (error) {
        console.error('Error fetching financial data:', error);
        return [];
    }
};

// Deprecated: Use apiService.saveTransaction directly
export const saveFinancialData = (data) => {
    console.warn('saveFinancialData is deprecated. Use apiService directly.');
};

