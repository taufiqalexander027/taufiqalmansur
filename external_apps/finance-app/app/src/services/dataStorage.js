/**
 * LocalStorage service for data persistence
 */

const STORAGE_KEY = 'realisasi_keuangan_data';

/**
 * Save data to localStorage
 */
export const saveData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
};

/**
 * Load data from localStorage
 */
export const loadData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
};

/**
 * Clear all data
 */
export const clearData = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
};

/**
 * Check if data exists
 */
export const hasData = () => {
    return localStorage.getItem(STORAGE_KEY) !== null;
};
