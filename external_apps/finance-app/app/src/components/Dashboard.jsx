import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertCircle, PieChart } from 'lucide-react';
import { getMasterData } from '../services/masterDataService';
import { getTransactionData, calculateTotalRealisasiUpToMonth } from '../services/transactionService';
import { formatCurrency, getAllBulan } from '../utils/calculations';

const Dashboard = () => {
    const [stats, setStats] = useState({
        anggaran: 0,
        realisasi: 0,
        sisa: 0,
        absorpsi: 0
    });
    const [periode, setPeriode] = useState('november'); // Default to current month/end of year

    useEffect(() => {
        calculateStats();
    }, [periode]);

    const calculateStats = () => {
        const masterData = getMasterData();
        const transactionData = getTransactionData();

        // 1. Calculate Total Anggaran PAPBD
        let totalAnggaran = 0;
        masterData.rekenings.forEach(rek => {
            Object.values(rek.anggaranPAPBD).forEach(val => {
                totalAnggaran += (val || 0);
            });
        });

        // 2. Calculate Total Realisasi up to selected period
        let totalRealisasi = 0;
        masterData.rekenings.forEach(rek => {
            ['PAD MURNI', 'DBHCHT'].forEach(sumber => {
                totalRealisasi += calculateTotalRealisasiUpToMonth(
                    transactionData.realisasi,
                    rek.id,
                    sumber,
                    periode
                );
            });
        });

        // 3. Calculate Sisa & Absorpsi
        const sisa = totalAnggaran - totalRealisasi;
        const absorpsi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

        setStats({
            anggaran: totalAnggaran,
            realisasi: totalRealisasi,
            sisa: sisa,
            absorpsi: absorpsi
        });
    };

    const bulanList = getAllBulan();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Dashboard Realisasi</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Sampai dengan:</span>
                    <select
                        className="input"
                        value={periode}
                        onChange={(e) => setPeriode(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        {bulanList.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <DashboardCard
                    title="Total Anggaran PAPBD"
                    value={formatCurrency(stats.anggaran)}
                    icon={Wallet}
                    color="primary"
                />
                <DashboardCard
                    title="Total Realisasi"
                    value={formatCurrency(stats.realisasi)}
                    icon={TrendingUp}
                    color="warning"
                    subtext={`${stats.absorpsi.toFixed(2)}% Terserap`}
                />
                <DashboardCard
                    title="Sisa Anggaran"
                    value={formatCurrency(stats.sisa)}
                    icon={AlertCircle}
                    color={stats.sisa >= 0 ? "success" : "error"}
                />
            </div>

            {/* Progress Bar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>Progress Penyerapan Anggaran</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent-primary)' }}>{stats.absorpsi.toFixed(2)}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--color-bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(stats.absorpsi, 100)}%`,
                        height: '100%',
                        background: stats.absorpsi > 90 ? 'var(--color-accent-error)' : 'var(--color-accent-primary)',
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>
            </div>

            {/* Placeholder for Charts/Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-secondary)' }}>
                    <PieChart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Grafik Realisasi per Seksi</p>
                    <small>(Segera Hadir)</small>
                </div>
                <div className="card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-secondary)' }}>
                    <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Tren Realisasi Bulanan</p>
                    <small>(Segera Hadir)</small>
                </div>
            </div>
        </div>
    );
};

const DashboardCard = ({ title, value, icon: Icon, color, subtext }) => {
    const colors = {
        primary: 'var(--color-accent-primary)',
        success: 'var(--color-accent-success)',
        warning: '#f59e0b',
        error: 'var(--color-accent-error)'
    };

    return (
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        background: `${colors[color]}20`,
                        color: colors[color]
                    }}>
                        <Icon size={24} />
                    </div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{title}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    {value}
                </div>
                {subtext && (
                    <div style={{ fontSize: '0.75rem', color: colors[color], fontWeight: '500' }}>
                        {subtext}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
