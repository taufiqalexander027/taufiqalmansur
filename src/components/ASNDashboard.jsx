import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './ASNDashboard.css';

const ASNDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('daily');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Daily Report Form
    const [dailyForm, setDailyForm] = useState({
        report_date: new Date().toISOString().split('T')[0],
        activity_description: '',
        work_hours: '',
        location: '',
        notes: ''
    });

    // Berakhlak Assessment Form
    const [berakhlakForm, setBerakhlakForm] = useState({
        assessment_period: '',
        berorientasi_pelayanan: 3,
        akuntabel: 3,
        kompeten: 3,
        harmonis: 3,
        loyal: 3,
        adaptif: 3,
        kolaboratif: 3,
        notes: ''
    });

    useEffect(() => {
        if (activeTab === 'daily') {
            loadDailyReports();
        }
    }, [activeTab]);

    const loadDailyReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/internal/asn/daily-reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data.data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDailySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/internal/asn/daily-reports`, dailyForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Laporan harian berhasil disimpan!');
            setDailyForm({
                report_date: new Date().toISOString().split('T')[0],
                activity_description: '',
                work_hours: '',
                location: '',
                notes: ''
            });
            loadDailyReports();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Gagal menyimpan laporan'));
        }
    };

    const handleBerakhlakSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/internal/asn/berakhlak-assessment`, berakhlakForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Assessment Berakhlak berhasil disimpan!');
            const total = Object.keys(berakhlakForm)
                .filter(k => k !== 'assessment_period' && k !== 'notes')
                .reduce((sum, k) => sum + berakhlakForm[k], 0);
            alert(`Total Score: ${total}/35`);
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Gagal menyimpan assessment'));
        }
    };

    const berakhlakValues = [
        { key: 'berorientasi_pelayanan', label: 'Berorientasi Pelayanan' },
        { key: 'akuntabel', label: 'Akuntabel' },
        { key: 'kompeten', label: 'Kompeten' },
        { key: 'harmonis', label: 'Harmonis' },
        { key: 'loyal', label: 'Loyal' },
        { key: 'adaptif', label: 'Adaptif' },
        { key: 'kolaboratif', label: 'Kolaboratif' }
    ];

    return (
        <div className="asn-dashboard">
            <div className="dashboard-header glass-dark">
                <div className="header-content">
                    <h1 className="dashboard-title gradient-text">E-Laporan ASN</h1>
                    <p className="dashboard-subtitle">Dokumentasi Kinerja dan Self Assessment</p>
                </div>
            </div>

            <div className="dashboard-container">
                {/* Tabs */}
                <div className="tabs glass">
                    <button
                        className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        📝 Laporan Harian
                    </button>
                    <button
                        className={`tab ${activeTab === 'berakhlak' ? 'active' : ''}`}
                        onClick={() => setActiveTab('berakhlak')}
                    >
                        ⭐ Self Assessment Berakhlak
                    </button>
                    <button
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📊 Riwayat Laporan
                    </button>
                </div>

                {/* Daily Report Tab */}
                {activeTab === 'daily' && (
                    <div className="tab-content glass">
                        <h2 className="content-title">Laporan Kinerja Harian</h2>
                        <form onSubmit={handleDailySubmit} className="asn-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal *</label>
                                    <input
                                        type="date"
                                        value={dailyForm.report_date}
                                        onChange={(e) => setDailyForm({ ...dailyForm, report_date: e.target.value })}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Jam Kerja</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={dailyForm.work_hours}
                                        onChange={(e) => setDailyForm({ ...dailyForm, work_hours: e.target.value })}
                                        placeholder="8"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Lokasi</label>
                                <input
                                    type="text"
                                    value={dailyForm.location}
                                    onChange={(e) => setDailyForm({ ...dailyForm, location: e.target.value })}
                                    placeholder="Kantor / WFH / Lapangan"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Deskripsi Aktivitas *</label>
                                <textarea
                                    value={dailyForm.activity_description}
                                    onChange={(e) => setDailyForm({ ...dailyForm, activity_description: e.target.value })}
                                    required
                                    rows="5"
                                    placeholder="Jelaskan aktivitas dan pencapaian hari ini..."
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label>Catatan Tambahan</label>
                                <textarea
                                    value={dailyForm.notes}
                                    onChange={(e) => setDailyForm({ ...dailyForm, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Kendala, hambatan, atau informasi penting lainnya"
                                    className="form-textarea"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                💾 Simpan Laporan
                            </button>
                        </form>
                    </div>
                )}

                {/* Berakhlak Assessment Tab */}
                {activeTab === 'berakhlak' && (
                    <div className="tab-content glass">
                        <h2 className="content-title">Self Assessment Berakhlak</h2>
                        <p className="assessment-desc">
                            Nilai diri Anda pada 7 nilai dasar Berakhlak (skala 1-5)
                        </p>

                        <form onSubmit={handleBerakhlakSubmit} className="asn-form">
                            <div className="form-group">
                                <label>Periode Assessment *</label>
                                <input
                                    type="month"
                                    value={berakhlakForm.assessment_period}
                                    onChange={(e) => setBerakhlakForm({ ...berakhlakForm, assessment_period: e.target.value })}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="berakhlak-values">
                                {berakhlakValues.map(({ key, label }) => (
                                    <div key={key} className="value-item">
                                        <label className="value-label">{label}</label>
                                        <div className="value-slider">
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                value={berakhlakForm[key]}
                                                onChange={(e) => setBerakhlakForm({ ...berakhlakForm, [key]: parseInt(e.target.value) })}
                                                className="slider"
                                            />
                                            <span className="value-display">{berakhlakForm[key]}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="total-score glass-dark">
                                <strong>Total Score:</strong> {
                                    berakhlakValues.reduce((sum, { key }) => sum + berakhlakForm[key], 0)
                                } / 35
                            </div>

                            <div className="form-group">
                                <label>Catatan</label>
                                <textarea
                                    value={berakhlakForm.notes}
                                    onChange={(e) => setBerakhlakForm({ ...berakhlakForm, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Refleksi atau komitmen perbaikan..."
                                    className="form-textarea"
                                />
                            </div>

                            <button type="submit" className="btn btn-success">
                                ⭐ Submit Assessment
                            </button>
                        </form>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="tab-content glass">
                        <h2 className="content-title">Riwayat Laporan Harian</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : reports.length === 0 ? (
                            <p className="no-data">Belum ada laporan</p>
                        ) : (
                            <div className="reports-list">
                                {reports.map(report => (
                                    <div key={report.id} className="report-card glass-dark">
                                        <div className="report-header">
                                            <span className="report-date">📅 {new Date(report.report_date).toLocaleDateString('id-ID')}</span>
                                            <span className="report-hours">⏰ {report.work_hours || '-'} jam</span>
                                        </div>
                                        <div className="report-location">📍 {report.location || 'Tidak disebutkan'}</div>
                                        <div className="report-activity">{report.activity_description}</div>
                                        {report.notes && (
                                            <div className="report-notes">💡 {report.notes}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ASNDashboard;
