/**
 * Transaction Data Model
 * Struktur data untuk DKKB (rencana) dan Realisasi (aktual)
 * FOKUS UTAMA: Realisasi & Sisa Anggaran
 */

import { BULAN } from './masterData.js';

/**
 * Create transaction entry (DKKB or Realisasi)
 */
export const createTransaction = ({
    tahun,
    bulan,
    rekeningId,
    rekeningKode,
    seksiId,
    sumberDana,
    nilai,
    type // 'DKKB' or 'REALISASI'
}) => ({
    id: `${type}_${tahun}_${bulan}_${rekeningKode}_${sumberDana}`,
    tahun,
    bulan,
    rekeningId,
    rekeningKode,
    seksiId,
    sumberDana,
    nilai,
    type,
    inputDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

/**
 * Create empty transaction data structure for a year
 */
export const createYearData = (tahun = 2025) => ({
    tahun,
    dkkb: [], // Array of DKKB transactions (rencana - optional)
    realisasi: [] // Array of Realisasi transactions (aktual - PRIORITAS!)
});

/**
 * Get transactions for specific month
 */
export const getTransactionsByMonth = (transactions, bulan) => {
    return transactions.filter(t => t.bulan === bulan);
};

/**
 * Get transactions for specific rekening
 */
export const getTransactionsByRekening = (transactions, rekeningId, sumberDana = null) => {
    return transactions.filter(t => {
        const matchRekening = t.rekeningId === rekeningId;
        const matchSumber = sumberDana ? t.sumberDana === sumberDana : true;
        return matchRekening && matchSumber;
    });
};

/**
 * Get transaction value for specific rekening and month
 */
export const getTransactionValue = (transactions, rekeningId, sumberDana, bulan) => {
    const found = transactions.find(t =>
        t.rekeningId === rekeningId &&
        t.sumberDana === sumberDana &&
        t.bulan === bulan
    );

    return found ? found.nilai : 0;
};

/**
 * Calculate total REALISASI for rekening up to a specific month
 * FUNGSI PENTING: Untuk menghitung Total Realisasi sampai bulan berjalan
 */
export const calculateTotalRealisasiUpToMonth = (realisasiTransactions, rekeningId, sumberDana, sampaiDengan) => {
    const bulanIndex = BULAN.indexOf(sampaiDengan.toLowerCase());

    if (bulanIndex === -1) return 0;

    const bulanList = BULAN.slice(0, bulanIndex + 1);

    return bulanList.reduce((total, bulan) => {
        const value = getTransactionValue(realisasiTransactions, rekeningId, sumberDana, bulan);
        return total + value;
    }, 0);
};

/**
 * Calculate SISA ANGGARAN for rekening
 * FUNGSI UTAMA: Sisa Anggaran = Anggaran PAPBD - Total Realisasi
 */
export const calculateSisaAnggaran = (anggaranPAPBD, totalRealisasi) => {
    return anggaranPAPBD - totalRealisasi;
};

/**
 * Calculate percentage of budget used (absorpsi)
 */
export const calculateAbsorpsi = (totalRealisasi, anggaranPAPBD) => {
    if (anggaranPAPBD === 0) return 0;
    return (totalRealisasi / anggaranPAPBD) * 100;
};

/**
 * Group transactions by seksi and sumber dana
 */
export const groupTransactionsBySeksiSumber = (transactions, rekenings) => {
    const grouped = {};

    transactions.forEach(trans => {
        const rekening = rekenings.find(r => r.id === trans.rekeningId);
        if (!rekening) return;

        const key = `${trans.seksiId}_${trans.sumberDana}`;

        if (!grouped[key]) {
            grouped[key] = {
                seksiId: trans.seksiId,
                sumberDana: trans.sumberDana,
                transactions: []
            };
        }

        grouped[key].transactions.push(trans);
    });

    return Object.values(grouped);
};

/**
 * Get realisasi summary for a rekening
 * Returns: { totalRealisasi, sisaAnggaran, absorpsi }
 */
export const getRealisasiSummary = (realisasiTransactions, rekening, sumberDana, sampaiDengan) => {
    const anggaranPAPBD = rekening.anggaranPAPBD[sumberDana] || 0;
    const totalRealisasi = calculateTotalRealisasiUpToMonth(
        realisasiTransactions,
        rekening.id,
        sumberDana,
        sampaiDengan
    );
    const sisaAnggaran = calculateSisaAnggaran(anggaranPAPBD, totalRealisasi);
    const absorpsi = calculateAbsorpsi(totalRealisasi, anggaranPAPBD);

    return {
        anggaranPAPBD,
        totalRealisasi,
        sisaAnggaran,
        absorpsi
    };
};
