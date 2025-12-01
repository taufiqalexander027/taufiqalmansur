import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { formatCurrency } from './CurrencyInput';
import FinancialChart from './FinancialChart';
import { MONTHS } from '../../models/financialData';

const RecapModal = ({ isOpen, onClose, data, monthKey, calculationMonthKeys, uniqueSeksi }) => {
    // Internal State for Modal Filters
    const [filterSeksi, setFilterSeksi] = useState(''); // Empty = all sections
    const [filterMonth, setFilterMonth] = useState(''); // '' = Semua Bulan
    const [filterSumberDana, setFilterSumberDana] = useState('SEMUA');
    const [copied, setCopied] = useState(false);

    // Sync with parent props when opening
    useEffect(() => {
        if (isOpen) {
            setCopied(false);
            // Optional: Sync with parent's current view if desired, 
            // but user asked for independent control, so we might keep defaults or sync once.
            // Let's sync once on open to give a good starting point.
            if (monthKey) setFilterMonth(monthKey);
        }
    }, [isOpen, monthKey]);

    if (!isOpen) return null;

    // --- Logic: Month & Period Text ---
    const monthLabel = filterMonth
        ? MONTHS.find(m => m.key === filterMonth)?.label
        : 'Januari s.d. Desember';

    const periodText = filterMonth ? `bulan "${monthLabel}"` : `periode "${monthLabel}"`;

    // --- Logic: Calculation Keys (Internal) ---
    // If filterMonth is selected, calculate Jan -> filterMonth. Else all months.
    const internalCalculationKeys = filterMonth
        ? MONTHS.slice(0, MONTHS.findIndex(m => m.key === filterMonth) + 1).map(m => m.key)
        : MONTHS.map(m => m.key);

    // --- Helper: Filter Data ---
    const filterData = (rows, section = null) => {
        return rows.filter(item => {
            // Section Filter
            if (section && item.seksi !== section) return false;

            // Sumber Dana Filter
            if (filterSumberDana !== 'SEMUA') {
                if (item.sumberDana !== filterSumberDana) return false;
            }

            // Special Case: Tata Usaha is ONLY PAD MURNI
            if (item.seksi === 'SUB BAGIAN TATA USAHA' && filterSumberDana === 'DBHCHT') {
                return false;
            }

            return true;
        });
    };

    // --- Helper: Calculate Totals (YTD) ---
    const calculateTotals = (rows) => {
        return rows.reduce((acc, item) => {
            let totalRealisasi = 0;

            if (internalCalculationKeys && internalCalculationKeys.length > 0) {
                internalCalculationKeys.forEach(key => {
                    totalRealisasi += (item.realisasi[key]?.realisasi || 0);
                });
            }

            acc.anggaran += (item.anggaran?.papbd || 0);
            acc.realisasi += totalRealisasi;
            return acc;
        }, { anggaran: 0, realisasi: 0 });
    };

    // --- Data Processing ---
    let chartData = [];
    let narrativeText = '';

    const formatMoney = (val) => formatCurrency(val);

    if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
        // --- MODE: UPT GABUNGAN (Detailed Breakdown) ---

        // 1. UPT Total
        const uptRows = filterData(data.filter(d =>
            ['SEKSI PELATIHAN', 'SEKSI PENGEMBANGAN', 'SUB BAGIAN TATA USAHA'].includes(d.seksi)
        ));
        const uptTotal = calculateTotals(uptRows);
        const uptPersen = uptTotal.anggaran ? (uptTotal.realisasi / uptTotal.anggaran) * 100 : 0;

        // 2. Sub Sections
        const pengRows = filterData(data, 'SEKSI PENGEMBANGAN');
        const pengTotal = calculateTotals(pengRows);
        const pengPersen = pengTotal.anggaran ? (pengTotal.realisasi / pengTotal.anggaran) * 100 : 0;

        const pelRows = filterData(data, 'SEKSI PELATIHAN');
        const pelTotal = calculateTotals(pelRows);
        const pelPersen = pelTotal.anggaran ? (pelTotal.realisasi / pelTotal.anggaran) * 100 : 0;

        const tuRows = filterData(data, 'SUB BAGIAN TATA USAHA');
        const tuTotal = calculateTotals(tuRows);
        const tuPersen = tuTotal.anggaran ? (tuTotal.realisasi / tuTotal.anggaran) * 100 : 0;

        // Narrative
        narrativeText = `Total realisasi UPT Pelatihan Pertanian ${periodText} adalah "${formatMoney(uptTotal.realisasi)}" atau ${uptPersen.toFixed(2)}% dari total anggaran sebesar ${formatMoney(uptTotal.anggaran)},- (${filterSumberDana === 'SEMUA' ? 'Semua Sumber Anggaran' : filterSumberDana}). dengan rincian sbb :\n\n`;
        narrativeText += `- Seksi Pengembangan ${periodText} adalah "${formatMoney(pengTotal.realisasi)}" atau ${pengPersen.toFixed(2)}% dari total anggaran sebesar "${formatMoney(pengTotal.anggaran)}",-\n`;
        narrativeText += `- Seksi Pelatihan ${periodText} adalah "${formatMoney(pelTotal.realisasi)}" atau ${pelPersen.toFixed(2)}% dari total anggaran sebesar "${formatMoney(pelTotal.anggaran)}",-\n`;
        narrativeText += `- Sub Bagian Tata Usaha ${periodText} adalah "${formatMoney(tuTotal.realisasi)}" atau ${tuPersen.toFixed(2)}% dari total anggaran sebesar "${formatMoney(tuTotal.anggaran)}",-`;

        // Chart Data
        chartData = uptRows;

    } else {
        // --- MODE: SINGLE SEKSI (Simple Summary) ---

        const seksiRows = filterData(data, filterSeksi);
        const seksiTotal = calculateTotals(seksiRows);
        const seksiPersen = seksiTotal.anggaran ? (seksiTotal.realisasi / seksiTotal.anggaran) * 100 : 0;

        // Narrative
        narrativeText = `Total realisasi ${filterSeksi} ${periodText} adalah "${formatMoney(seksiTotal.realisasi)}" atau ${seksiPersen.toFixed(2)}% dari total anggaran sebesar ${formatMoney(seksiTotal.anggaran)},- (${filterSumberDana === 'SEMUA' ? 'Semua Sumber Anggaran' : filterSumberDana}).`;

        // Chart Data
        chartData = seksiRows;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(narrativeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '1rem', width: '90%', maxWidth: '800px',
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Rekapitulasi Realisasi Anggaran</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Laporan Mandiri</p>
                    </div>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>

                    {/* Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

                        {/* Seksi Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.25rem' }}>UNIT KERJA / SEKSI</label>
                            <select
                                className="select select-bordered select-sm w-full"
                                value={filterSeksi}
                                onChange={(e) => setFilterSeksi(e.target.value)}
                            >
                                <option value="UPT_PELATIHAN_PERTANIAN" style={{ fontWeight: 'bold', color: '#2563eb' }}>UPT PELATIHAN PERTANIAN (GABUNGAN)</option>
                                <option disabled>----------------</option>
                                {uniqueSeksi && uniqueSeksi.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.25rem' }}>PERIODE BULAN</label>
                            <select
                                className="select select-bordered select-sm w-full"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            >
                                <option value="">Semua Bulan (Jan - Des)</option>
                                {MONTHS.map(m => (
                                    <option key={m.key} value={m.key}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sumber Dana Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.25rem' }}>SUMBER DANA</label>
                            <select
                                className="select select-bordered select-sm w-full"
                                value={filterSumberDana}
                                onChange={(e) => setFilterSumberDana(e.target.value)}
                            >
                                <option value="SEMUA">Semua Sumber Anggaran</option>
                                <option value="PAD MURNI">PAD MURNI</option>
                                <option value="DBHCHT">DBHCHT</option>
                            </select>
                        </div>
                    </div>

                    {/* Chart */}
                    <FinancialChart
                        data={chartData}
                        title={`Grafik Realisasi - ${filterSeksi === 'UPT_PELATIHAN_PERTANIAN' ? 'UPT GABUNGAN' : filterSeksi}`}
                        months={internalCalculationKeys}
                    />

                    {/* Narrative Box */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 'bold', color: '#334155' }}>Laporan Narasi</h3>
                            <button
                                onClick={handleCopy}
                                className="btn btn-sm"
                                style={{
                                    backgroundColor: copied ? '#22c55e' : 'white',
                                    color: copied ? 'white' : '#475569',
                                    borderColor: '#cbd5e1'
                                }}
                            >
                                {copied ? <Check size={16} style={{ marginRight: '0.25rem' }} /> : <Copy size={16} style={{ marginRight: '0.25rem' }} />}
                                {copied ? 'Tersalin!' : 'Salin Teks'}
                            </button>
                        </div>
                        <pre style={{
                            whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6',
                            backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0'
                        }}>
                            {narrativeText}
                        </pre>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecapModal;
