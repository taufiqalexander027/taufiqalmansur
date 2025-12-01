import axios from 'axios';
import { Activity, Assessment, UserProfile } from '../types';

// Use environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://taufiqalmansur-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.reload(); // Force login
        }
        return Promise.reject(error);
    }
);

// --- Auth ---
export const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
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

export const isLoggedIn = (): boolean => {
    return !!localStorage.getItem('token');
};

// --- Profile ---
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const response = await api.get('/skp/profile');
        if (response.data.success) {
            return response.data.data;
        }
        return { nama: '', jabatan: '', unitKerja: '' };
    } catch (error) {
        console.error('Get profile failed:', error);
        return { nama: '', jabatan: '', unitKerja: '' };
    }
};

export const saveUserProfile = async (profile: UserProfile) => {
    try {
        await api.put('/skp/profile', profile);
    } catch (error) {
        console.error('Save profile failed:', error);
    }
};

// --- Activities ---
export const getActivities = async (): Promise<Activity[]> => {
    try {
        const response = await api.get('/skp/activities');
        if (response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Get activities failed:', error);
        return [];
    }
};

export const saveActivity = async (activity: Omit<Activity, 'id'>, imageFile?: File): Promise<Activity | null> => {
    try {
        const formData = new FormData();
        formData.append('date', activity.date);
        formData.append('location', activity.location);
        formData.append('description', activity.description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await api.post('/skp/activities', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Save activity failed:', error);
        return null;
    }
};

export const updateActivity = async (activity: Activity, imageFile?: File): Promise<Activity | null> => {
    try {
        const formData = new FormData();
        formData.append('date', activity.date);
        formData.append('location', activity.location);
        formData.append('description', activity.description);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await api.put(`/skp/activities/${activity.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Update activity failed:', error);
        return null;
    }
};

export const deleteActivity = async (id: string) => {
    try {
        await api.delete(`/skp/activities/${id}`);
    } catch (error) {
        console.error('Delete activity failed:', error);
    }
};

// --- Assessments ---
export const getAssessments = async (): Promise<Assessment[]> => {
    try {
        const response = await api.get('/skp/assessments');
        if (response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Get assessments failed:', error);
        return [];
    }
};

export const saveAssessment = async (assessment: Omit<Assessment, 'id'>, imageFiles?: File[]): Promise<Assessment | null> => {
    try {
        const formData = new FormData();
        formData.append('indicator', assessment.indicator);
        formData.append('description', assessment.description);
        formData.append('timestamp', assessment.timestamp);
        if (assessment.date) formData.append('date', assessment.date);
        if (assessment.customTitle) formData.append('customTitle', assessment.customTitle);

        if (imageFiles) {
            imageFiles.forEach(file => {
                formData.append('images', file);
            });
        }

        const response = await api.post('/skp/assessments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Save assessment failed:', error);
        return null;
    }
};

export const updateAssessment = async (assessment: Assessment, imageFiles?: File[]): Promise<Assessment | null> => {
    try {
        const formData = new FormData();
        formData.append('indicator', assessment.indicator);
        formData.append('description', assessment.description);
        formData.append('timestamp', assessment.timestamp);
        if (assessment.date) formData.append('date', assessment.date);
        if (assessment.customTitle) formData.append('customTitle', assessment.customTitle);

        if (imageFiles) {
            imageFiles.forEach(file => {
                formData.append('images', file);
            });
        }

        const response = await api.put(`/skp/assessments/${assessment.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Update assessment failed:', error);
        return null;
    }
};

export const deleteAssessment = async (id: string) => {
    try {
        await api.delete(`/skp/assessments/${id}`);
    } catch (error) {
        console.error('Delete assessment failed:', error);
    }
};
