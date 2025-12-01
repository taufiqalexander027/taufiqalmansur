/**
 * Transaction Service
 * Handle CRUD operations for transactions (DKKB & Realisasi)
 * Uses localStorage for persistence
 */

import { createYearData, createTransaction } from '../models/transactionData.js';

const STORAGE_KEY = 'realisasi_keuangan_transactions';

/**
 * Load transaction data from storage
 */
export const getTransactionData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : createYearData();
    } catch (error) {
        console.error('Error loading transaction data:', error);
        return createYearData();
    }
};

/**
 * Save transaction data to storage
 */
export const saveTransactionData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving transaction data:', error);
        return false;
    }
};

/**
 * Save a single transaction (DKKB or Realisasi)
 */
export const saveTransaction = (transaction) => {
    const data = getTransactionData();
    const collection = transaction.type === 'DKKB' ? data.dkkb : data.realisasi;

    // Check if exists (update) or new (push)
    const index = collection.findIndex(t => t.id === transaction.id);

    if (index >= 0) {
        collection[index] = { ...collection[index], ...transaction, updatedAt: new Date().toISOString() };
    } else {
        collection.push(transaction);
    }

    return saveTransactionData(data);
};

/**
 * Batch save transactions
 */
export const saveBatchTransactions = (transactions) => {
    const data = getTransactionData();

    transactions.forEach(t => {
        const collection = t.type === 'DKKB' ? data.dkkb : data.realisasi;
        const index = collection.findIndex(existing => existing.id === t.id);

        if (index >= 0) {
            collection[index] = { ...collection[index], ...t, updatedAt: new Date().toISOString() };
        } else {
            collection.push(t);
        }
    });

    return saveTransactionData(data);
};

/**
 * Get all transactions for a specific month
 */
export const getTransactionsByMonth = (bulan) => {
    const data = getTransactionData();
    return {
        dkkb: data.dkkb.filter(t => t.bulan === bulan),
        realisasi: data.realisasi.filter(t => t.bulan === bulan)
    };
};

/**
 * Get transactions by rekening ID
 */
export const getTransactionsByRekening = (rekeningId) => {
    const data = getTransactionData();
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

/**
 * Reset all transaction data
 */
export const resetTransactions = () => {
    return saveTransactionData(createYearData());
};
