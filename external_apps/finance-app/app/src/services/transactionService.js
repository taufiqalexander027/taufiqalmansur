/**
 * Transaction Service
 * Handle CRUD operations for transactions (DKKB & Realisasi)
 * Uses API for persistence
 */

import { getTransactions, saveTransaction as apiSaveTransaction } from './apiService';

/**
 * Load transaction data from API
 * Returns { dkkb: [], realisasi: [] }
 */
export const getTransactionData = async (tahun = 2025) => {
    try {
        const transactions = await getTransactions(tahun);
        return {
            dkkb: transactions.filter(t => t.type === 'DKKB'),
            realisasi: transactions.filter(t => t.type === 'REALISASI')
        };
    } catch (error) {
        console.error('Error loading transaction data:', error);
        return { dkkb: [], realisasi: [] };
    }
};

/**
 * Save a single transaction (DKKB or Realisasi)
 */
export const saveTransaction = async (transaction) => {
    return await apiSaveTransaction(transaction);
};

/**
 * Batch save transactions
 */
export const saveBatchTransactions = async (transactions) => {
    try {
        const promises = transactions.map(t => apiSaveTransaction(t));
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Batch save failed:', error);
        return false;
    }
};

/**
 * Get all transactions for a specific month
 * NOTE: This now requires passing the full data object, or fetching it first.
 * To avoid refactoring everything, we'll assume the component fetches data first.
 */
export const filterTransactionsByMonth = (data, bulan) => {
    return {
        dkkb: data.dkkb.filter(t => t.bulan === bulan),
        realisasi: data.realisasi.filter(t => t.bulan === bulan)
    };
};

/**
 * Get transactions by rekening ID
 */
export const filterTransactionsByRekening = (data, rekeningId) => {
    return {
        dkkb: data.dkkb.filter(t => t.rekeningId === rekeningId),
        realisasi: data.realisasi.filter(t => t.rekeningId === rekeningId)
    };
};

/**
 * Calculate total realisasi up to a specific month
 */
export const calculateTotalRealisasiUpToMonth = (realisasiData, rekeningId, sumberDana, upToMonth) => {
    const bulanOrder = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
    const monthIndex = bulanOrder.indexOf(upToMonth.toLowerCase());

    if (monthIndex === -1) return 0;

    const relevantMonths = bulanOrder.slice(0, monthIndex + 1);

    return realisasiData
        .filter(t =>
            t.rekeningId === rekeningId &&
            t.sumberDana === sumberDana &&
            relevantMonths.includes(t.bulan.toLowerCase())
        )
        .reduce((sum, t) => sum + (t.nilai || 0), 0);
};

/**
 * Calculate sisa anggaran (remaining budget)
 */
export const calculateSisaAnggaran = (anggaran, totalRealisasi) => {
    return anggaran - totalRealisasi;
};

/**
 * Get transaction value for a specific rekening, sumber dana, and month
 */
export const getTransactionValue = (transactionArray, rekeningId, sumberDana, bulan) => {
    const transaction = transactionArray.find(t =>
        t.rekeningId === rekeningId &&
        t.sumberDana === sumberDana &&
        t.bulan.toLowerCase() === bulan.toLowerCase()
    );
    return transaction ? transaction.nilai : 0;
};

