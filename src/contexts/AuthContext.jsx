import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const { data } = await authAPI.getMe();
                    setUser(data.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await authAPI.login(credentials);
            const { user: userData, token } = data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await authAPI.register(userData);
            const { user: newUser, token } = data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true, user: newUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        authAPI.logout().catch(() => { }); // Fire and forget
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isStaff = () => {
        return user?.role === 'staff' || user?.role === 'admin';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
                isAdmin,
                isStaff
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
