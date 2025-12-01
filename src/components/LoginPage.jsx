import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(formData);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else if (result.user.role === 'staff') {
                navigate('/financial-reports');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-gradient"></div>
            </div>

            <div className="login-container">
                <div className="login-card glass">
                    <div className="login-header">
                        <div className="login-icon">🔒</div>
                        <h1 className="login-title">Login ke Portal</h1>
                        <p className="login-subtitle">
                            Masuk untuk mengakses dashboard dan fitur internal
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username atau Email
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Masukkan username atau email"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Masukkan password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </button>

                        <div className="login-footer">
                            <p className="demo-credentials">
                                <strong>Demo Admin:</strong> username: <code>admin</code> | password: <code>admin123</code>
                            </p>
                            <a href="/" className="back-link">
                                ← Kembali ke Beranda
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
