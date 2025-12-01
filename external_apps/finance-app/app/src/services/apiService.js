import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://taufiqalmansur-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
};

export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};

// --- Finance API ---

export const getRekenings = async () => {
    try {
        const response = await api.get('/finance/rekenings');
        return response.data.data;
    } catch (error) {
        console.error('Get rekenings failed:', error);
        return [];
    }
};

export const syncMasterData = async (rekenings) => {
    try {
        const response = await api.post('/finance/sync-master', { rekenings });
        return response.data.success;
    } catch (error) {
        console.error('Sync master data failed:', error);
        return false;
    }
};

export const getTransactions = async (tahun) => {
    try {
        const response = await api.get(`/finance/transactions?tahun=${tahun}`);
        return response.data.data;
    } catch (error) {
        console.error('Get transactions failed:', error);
        return [];
    }
};

export const saveTransaction = async (transaction) => {
    try {
        const response = await api.post('/finance/transactions', transaction);
        return response.data.success;
    } catch (error) {
        console.error('Save transaction failed:', error);
        return false;
    }
};
