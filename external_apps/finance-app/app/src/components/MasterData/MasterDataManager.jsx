import { useState, useEffect } from 'react';
import { Upload, Database, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { parseExcelFile } from '../../services/excelParser';
import { initializeFromImport, getMasterData } from '../../services/masterDataService';
import RekeningList from './RekeningList';
import InputMasterDataManual from './InputMasterDataManual';

const MasterDataManager = () => {
    const [masterData, setMasterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [activeTab, setActiveTab] = useState('rekening'); // 'overview', 'rekening'
    const [showManualInput, setShowManualInput] = useState(false);

    // Sheet Selection State
    const [rawParsedData, setRawParsedData] = useState([]);
    const [availableSheets, setAvailableSheets] = useState([]);
    const [selectedSheets, setSelectedSheets] = useState(new Set());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = getMasterData();
        setMasterData(data);

        // Restore sheet selection state if possible (optional, for now just reset)
        if (data && data.rekenings.length > 0) {
            const sheets = [...new Set(data.rekenings.map(r => r.sheetName).filter(Boolean))];
            setAvailableSheets(sheets);
            setSelectedSheets(new Set(sheets));
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('File selected:', file.name);
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            console.log('Parsing Excel file...');
            const parsedData = await parseExcelFile(file);
            console.log('Parsed data:', parsedData.length, 'items');

            // Store raw data
            setRawParsedData(parsedData);

            // Extract sheets
            const sheets = [...new Set(parsedData.map(item => item.sheetName).filter(Boolean))];
            setAvailableSheets(sheets);

            // Default: Select ALL sheets
            const initialSelection = new Set(sheets);
            setSelectedSheets(initialSelection);

            // Process data with selection
            processData(parsedData, initialSelection);

            // Switch to overview tab to show sheet selection
            setActiveTab('overview');

        } catch (err) {
            console.error('Import error:', err);
            setError('Gagal import file: ' + err.message);
            setIsLoading(false);
        }
    };

    const processData = (data, selection) => {
        try {
            setIsLoading(true);
            const filteredData = data.filter(item => selection.has(item.sheetName));

            console.log('Processing filtered data:', filteredData.length, 'items');
            const initializedData = initializeFromImport(filteredData);

            setMasterData(initializedData);
            setSuccessMsg(`✅ Data Excel berhasil disimpan! Total ${initializedData.rekenings.length} rekening dari ${selection.size} sheet.`);

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err) {
            console.error('Processing error:', err);
            setError('Gagal memproses data: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSheet = (sheet) => {
        const newSelection = new Set(selectedSheets);
        if (newSelection.has(sheet)) {
            newSelection.delete(sheet);
        } else {
            newSelection.add(sheet);
        }
        setSelectedSheets(newSelection);

        // Re-process data if we have raw data
        if (rawParsedData.length > 0) {
            processData(rawParsedData, newSelection);
        }
    };

    const handleManualSaveSuccess = () => {
        loadData();
        setShowManualInput(false);
        setSuccessMsg('✅ Data berhasil disimpan ke database!');
        setTimeout(() => setSuccessMsg(null), 5000);
    };

    const handleResetData = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('realisasi_keuangan_master_data');
            setRawParsedData([]);
            setAvailableSheets([]);
            setSelectedSheets(new Set());
            loadData();
            setSuccessMsg('✅ Database berhasil dibersihkan.');
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    if (!masterData) return <div>Loading...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={20} />
                    Master Data Management
                </h2>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={handleResetData}
                        style={{ color: '#ef4444', border: '1px solid #ef4444' }}
                    >
                        Reset Data
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowManualInput(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={16} />
                        Input Manual
                    </button>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        <button className="btn btn-ghost" disabled={isLoading} style={{ border: '1px solid var(--color-border)' }}>
                            <Upload size={16} />
                            {isLoading ? 'Importing...' : 'Import Excel'}
                        </button>
                    </div>
                </div>
            </div>

            {showManualInput && (
                <InputMasterDataManual
                    onCancel={() => setShowManualInput(false)}
                    onSaveSuccess={handleManualSaveSuccess}
                />
            )}

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {successMsg && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '1rem 1.25rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    animation: 'slideDown 0.3s ease-out',
                    color: 'white',
                    fontWeight: '500'
                }}>
                    <CheckCircle size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem' }}>{successMsg}</span>
                    <style>{`
                        @keyframes slideDown {
                            from {
                                transform: translateY(-20px);
                                opacity: 0;
                            }
                            to {
                                transform: translateY(0);
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <button
                    className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`btn ${activeTab === 'rekening' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('rekening')}
                >
                    Daftar Rekening
                </button>
            </div>

            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* General Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <StatCard title="Total Seksi" value={masterData.seksi.length} />
                        <StatCard title="Total Program" value={masterData.programs.length} />
                        <StatCard title="Total Kegiatan" value={masterData.kegiatans.length} />
                        <StatCard title="Total Rekening" value={masterData.rekenings.length} />
                    </div>

                    {/* Data Source / Sheet Selection */}
                    <div className="card" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                            Pilih Sheet untuk Diimport (Hapus centang pada sheet summary/duplikat)
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {availableSheets.length === 0 && <span className="text-sm text-gray-500">Belum ada data import.</span>}

                            {availableSheets.map(sheet => (
                                <label key={sheet} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSheets.has(sheet)}
                                        onChange={() => toggleSheet(sheet)}
                                        className="checkbox checkbox-primary checkbox-sm"
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>{sheet}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Aggregation Summary */}
                    <AggregationSummary rekenings={masterData.rekenings} seksiList={masterData.seksi} />
                </div>
            )}

            {activeTab === 'rekening' && (
                <RekeningList rekenings={masterData.rekenings} />
            )}
        </div>
    );
};

const StatCard = ({ title, value, subValue }) => (
    <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{value}</div>
        {subValue && <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{subValue}</div>}
    </div>
);

const AggregationSummary = ({ rekenings, seksiList }) => {
    // Helper to format currency
    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    // Calculate Totals
    const totals = rekenings.reduce((acc, rek) => {
        const seksi = seksiList.find(s => s.id === rek.seksiId);
        const seksiName = seksi ? seksi.nama : '';

        // Determine Group: UPT PELATIHAN vs TATA USAHA
        let group = 'OTHER';
        if (seksiName.includes('PENGEMBANGAN') || seksiName.includes('PELATIHAN')) {
            group = 'UPT_PELATIHAN';
        } else if (seksiName.includes('TATA USAHA')) {
            group = 'TATA_USAHA';
        }

        // Sum Anggaran
        const anggaranPAD = rek.anggaranPAPBD['PAD MURNI'] || 0;
        const anggaranDBHCHT = rek.anggaranPAPBD['DBHCHT'] || 0;
        const total = anggaranPAD + anggaranDBHCHT;

        // Update Group Totals
        if (!acc[group]) acc[group] = { total: 0, pad: 0, dbhcht: 0 };
        acc[group].total += total;
        acc[group].pad += anggaranPAD;
        acc[group].dbhcht += anggaranDBHCHT;

        // Update Seksi Totals (for detail)
        if (!acc.seksi[seksiName]) acc.seksi[seksiName] = { total: 0, pad: 0, dbhcht: 0 };
        acc.seksi[seksiName].total += total;
        acc.seksi[seksiName].pad += anggaranPAD;
        acc.seksi[seksiName].dbhcht += anggaranDBHCHT;

        return acc;
    }, { seksi: {} });

    const upt = totals['UPT_PELATIHAN'] || { total: 0, pad: 0, dbhcht: 0 };
    const tu = totals['TATA_USAHA'] || { total: 0, pad: 0, dbhcht: 0 };
    const grandTotal = upt.total + tu.total;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                Ringkasan Anggaran (Berdasarkan Seksi)
            </h3>

            {/* UPT PELATIHAN (Seksi Pengembangan + Seksi Pelatihan) */}
            <div className="card" style={{ border: '1px solid #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>
                    UPT PELATIHAN (Pengembangan + Pelatihan)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <StatCard title="Total Anggaran" value={formatRp(upt.total)} />
                    <StatCard title="PAD Murni" value={formatRp(upt.pad)} />
                    <StatCard title="DBHCHT" value={formatRp(upt.dbhcht)} />
                </div>
            </div>

            {/* SUB BAGIAN TATA USAHA */}
            <div className="card" style={{ border: '1px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
                    SUB BAGIAN TATA USAHA
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <StatCard title="Total Anggaran" value={formatRp(tu.total)} />
                    <StatCard title="PAD Murni" value={formatRp(tu.pad)} />
                    <StatCard title="DBHCHT" value={formatRp(tu.dbhcht)} />
                </div>
            </div>

            {/* GRAND TOTAL */}
            <div className="card" style={{ border: '1px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
                    TOTAL KESELURUHAN (UPT + TU)
                </h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {formatRp(grandTotal)}
                </div>
            </div>
        </div>
    );
};

export default MasterDataManager;
