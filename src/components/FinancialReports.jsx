import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './FinancialDashboard.css';

const FinancialDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('summary');
    const [financialData, setFinancialData] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        loadPrograms();
        if (activeTab === 'summary') {
            loadFinancialSummary();
        }
    }, [activeTab]);

    const loadPrograms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/internal/financial/programs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrograms(response.data.data || []);
        } catch (error) {
            console.error('Error loading programs:', error);
        }
    };

    const loadFinancialSummary = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/internal/financial/summary`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { fiscal_year: new Date().getFullYear() }
            });
            setFinancialData(response.data.data || []);
        } catch (error) {
            console.error('Error loading summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const calculatePercentage = (realization, budget) => {
        if (!budget) return 0;
        return ((realization / budget) * 100).toFixed(2);
    };

    // Group data by program
    const groupedData = financialData.reduce((acc, item) => {
        const progCode = item.program_code;
        if (!acc[progCode]) {
            acc[progCode] = {
                program: item.program_name,
                code: progCode,
                activities: []
            };
        }

        const actCode = item.activity_code;
        let activity = acc[progCode].activities.find(a => a.code === actCode);

        if (!activity) {
            activity = {
                code: actCode,
                name: item.activity_name,
                accounts: []
            };
            acc[progCode].activities.push(activity);
        }

        activity.accounts.push(item);
        return acc;
    }, {});

    const getTotalBudget = () => {
        return financialData.reduce((sum, item) => sum + (parseFloat(item.budget_amount) || 0), 0);
    };

    const getTotalRealization = () => {
        return financialData.reduce((sum, item) => sum + (parseFloat(item.total_realization) || 0), 0);
    };

    return (
        <div className="financial-dashboard">
            <div className="dashboard-header glass-dark">
                <div className="header-content">
                    <h1 className="dashboard-title gradient-text">Laporan Keuangan</h1>
                    <p className="dashboard-subtitle">Monitoring Anggaran dan Realisasi Tahun {new Date().getFullYear()}</p>
                </div>
            </div>

            <div className="dashboard-container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card glass">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <div className="stat-label">Total Anggaran</div>
                            <div className="stat-value">{formatCurrency(getTotalBudget())}</div>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-label">Total Realisasi</div>
                            <div className="stat-value success">{formatCurrency(getTotalRealization())}</div>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <div className="stat-label">Persentase</div>
                            <div className="stat-value primary">
                                {calculatePercentage(getTotalRealization(), getTotalBudget())}%
                            </div>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-icon">💵</div>
                        <div className="stat-info">
                            <div className="stat-label">Sisa Anggaran</div>
                            <div className="stat-value">{formatCurrency(getTotalBudget() - getTotalRealization())}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs glass">
                    <button
                        className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        📊 Ringkasan
                    </button>
                    <button
                        className={`tab ${activeTab === 'input' ? 'active' : ''}`}
                        onClick={() => setActiveTab('input')}
                    >
                        ✏️ Input Data
                    </button>
                </div>

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                    <div className="tab-content glass">
                        <h2 className="content-title">Ringkasan Keuangan per Program</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : Object.keys(groupedData).length === 0 ? (
                            <p className="no-data">Belum ada data keuangan</p>
                        ) : (
                            <div className="financial-tree">
                                {Object.values(groupedData).map(program => (
                                    <div key={program.code} className="program-section">
                                        <div className="program-header glass-dark">
                                            <h3 className="program-title">
                                                {program.code} - {program.program}
                                            </h3>
                                        </div>

                                        {program.activities.map(activity => (
                                            <div key={activity.code} className="activity-section">
                                                <div className="activity-header">
                                                    <strong>{activity.code}</strong> - {activity.name}
                                                </div>

                                                <div className="accounts-table">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Kode Rekening</th>
                                                                <th>Nama Rekening</th>
                                                                <th>Anggaran</th>
                                                                <th>Realisasi</th>
                                                                <th>%</th>
                                                                <th>Sisa</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {activity.accounts.map((account, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="account-code">{account.account_code}</td>
                                                                    <td>{account.account_name}</td>
                                                                    <td className="amount">{formatCurrency(account.budget_amount)}</td>
                                                                    <td className="amount success">{formatCurrency(account.total_realization)}</td>
                                                                    <td className="percentage">
                                                                        <span className={`badge ${parseFloat(calculatePercentage(account.total_realization, account.budget_amount)) > 100 ? 'danger' : 'success'}`}>
                                                                            {calculatePercentage(account.total_realization, account.budget_amount)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="amount">{formatCurrency(account.remaining_budget)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Input Tab */}
                {activeTab === 'input' && (
                    <div className="tab-content glass">
                        <h2 className="content-title">Input Data Keuangan</h2>
                        <div className="input-info glass-dark">
                            <p>
                                <strong>Catatan:</strong> Untuk input anggaran dan realisasi, gunakan API endpoints berikut via Postman atau aplikasi sejenis:
                            </p>
                            <div className="api-examples">
                                <div className="api-example">
                                    <strong>Input Anggaran:</strong>
                                    <code>POST {API_URL}/internal/financial/budgets</code>
                                    <pre>{`{
  "account_id": 1,
  "fiscal_year": 2025,
  "budget_amount": 150000000,
  "source_of_funds": "APBD"
}`}</pre>
                                </div>
                                <div className="api-example">
                                    <strong>Input Realisasi:</strong>
                                    <code>POST {API_URL}/internal/financial/realizations</code>
                                    <pre>{`{
  "budget_id": 1,
  "month": 1,
  "realization_amount": 12500000,
  "notes": "Realisasi Januari"
}`}</pre>
                                </div>
                            </div>
                            <p>
                                💡 <strong>Coming Soon:</strong> Form input visual akan ditambahkan di versi berikutnya.
                            </p>
                        </div>

                        <div className="programs-list">
                            <h3>Daftar Program</h3>
                            {programs.map(prog => (
                                <div key={prog.id} className="program-item glass-dark">
                                    <div className="program-code">{prog.code}</div>
                                    <div className="program-name">{prog.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialDashboard;
