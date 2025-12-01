import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, ChevronDown, ChevronRight, Upload, AlertCircle } from 'lucide-react';
import { getFinancialData, saveFinancialData, MONTHS } from '../../models/financialData';
import { parseStandardizedExcel } from '../../services/excelParser';
import CurrencyInput, { formatCurrency } from './CurrencyInput';
import FinancialChart from './FinancialChart';
import RecapModal from './RecapModal';
import DKKBReport from './DKKBReport';
import ReceiptReport from './ReceiptReport';
import SuratPengantar from './SuratPengantar';

const FinancialTable = ({ onTitleChange }) => {
    const [data, setData] = useState([]);
    const [filterSeksi, setFilterSeksi] = useState('UPT_PELATIHAN_PERTANIAN'); // Default to UPT View
    const [filterProgram, setFilterProgram] = useState('');
    const [filterSumberDana, setFilterSumberDana] = useState('');
    const [filterSumberDanaPenyuluhan, setFilterSumberDanaPenyuluhan] = useState('SEMUA'); // For UPT View
    const [viewMonth, setViewMonth] = useState([]); // [] = All, ['jan'] = Jan only, ['jan','feb','mar'] = Jan-Mar
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [isRecapOpen, setIsRecapOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
    const [receiptMonth, setReceiptMonth] = useState('nov');
    const [isSuratPengantarOpen, setIsSuratPengantarOpen] = useState(false);
    const [isPrintingSuratPengantar, setIsPrintingSuratPengantar] = useState(false);
    const [suratPengantarMonth, setSuratPengantarMonth] = useState('nov');
    const [successMessage, setSuccessMessage] = useState(null);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadedData = getFinancialData();
        setData(loadedData);
    }, []);

    // Update Title based on Filter
    useEffect(() => {
        if (onTitleChange) {
            if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
                onTitleChange('Laporan UPT Pelatihan Pertanian');
            } else if (filterSeksi) {
                onTitleChange(`Laporan Keuangan - ${filterSeksi}`);
            } else {
                onTitleChange('Sistem Realisasi Keuangan');
            }
        }
    }, [filterSeksi, onTitleChange]);

    // Close month dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMonthDropdownOpen && !e.target.closest('[data-month-dropdown]')) {
                setIsMonthDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMonthDropdownOpen]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm('Import akan menimpa data yang ada. Lanjutkan?')) {
            try {
                const parsedData = await parseStandardizedExcel(file);
                setData(parsedData);
                saveFinancialData(parsedData);
                setSuccessMessage(`✅ Data Excel berhasil disimpan! Total ${parsedData.length} rekening.`);
                setTimeout(() => setSuccessMessage(null), 5000);
                console.log('✅ Data imported and saved successfully');
            } catch (err) {
                console.error(err);
                alert('Gagal import file: ' + err.message);
            }
        }
    };

    const handleSave = () => {
        saveFinancialData(data);
        setSuccessMessage('✅ Data berhasil disimpan!');
        setTimeout(() => setSuccessMessage(null), 5000);
        console.log('✅ Data saved successfully');
    };

    const updateRecord = (id, field, value, monthKey = null, type = null) => {
        // Prevent editing in Aggregated Mode
        if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
            alert('Mode Gabungan UPT hanya untuk melihat data (Read Only). Silakan edit di masing-masing Seksi.');
            return;
        }

        const newData = data.map(item => {
            if (item.id === id) {
                if (monthKey) {
                    // Update Realisasi
                    return {
                        ...item,
                        realisasi: {
                            ...item.realisasi,
                            [monthKey]: {
                                ...item.realisasi[monthKey],
                                [type]: Number(value)
                            }
                        }
                    };
                } else if (field.includes('.')) {
                    // Update Nested (e.g. anggaran.papbd)
                    const [parent, child] = field.split('.');
                    return {
                        ...item,
                        [parent]: {
                            ...item[parent],
                            [child]: Number(value)
                        }
                    };
                } else {
                    // Update Direct
                    return { ...item, [field]: value };
                }
            }
            return item;
        });
        setData(newData);
    };

    // --- Keyboard Navigation Helper ---
    const handleKeyDown = (e, currentIndex, column, months) => {
        // Assuming `tableData` is available in the scope where this function is called,
        // or passed as an argument. For now, let's assume it's `data` or a filtered version.
        const currentTableData = filterSeksi === 'UPT_PELATIHAN_PERTANIAN' ? [...dataPenyuluhan, ...dataPenunjang] : dataNormal;

        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = Math.min(currentIndex + 1, currentTableData.length - 1);
            const nextInput = document.querySelector(`input[data-row="${nextIndex}"][data-col="${column}"]`);
            if (nextInput) nextInput.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = Math.max(currentIndex - 1, 0);
            const prevInput = document.querySelector(`input[data-row="${prevIndex}"][data-col="${column}"]`);
            if (prevInput) prevInput.focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const colIndex = months.findIndex(m => m.key === column);
            if (colIndex >= 0 && colIndex < months.length - 1) {
                const nextCol = months[colIndex + 1].key;
                const nextInput = document.querySelector(`input[data-row="${currentIndex}"][data-col="${nextCol}"]`);
                if (nextInput) nextInput.focus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const colIndex = months.findIndex(m => m.key === column);
            if (colIndex > 0) {
                const prevCol = months[colIndex - 1].key;
                const prevInput = document.querySelector(`input[data-row="${currentIndex}"][data-col="${prevCol}"]`);
                if (prevInput) prevInput.focus();
            } else if (column === months[0].key) {
                const anggaranInput = document.querySelector(`input[data-row="${currentIndex}"][data-col="anggaran"]`);
                if (anggaranInput) anggaranInput.focus();
            }
        }
    };

    // Handle multi-row paste from clipboard
    const handleMultiPaste = (startIndex, column, values) => {
        if (!values || values.length === 0) return;

        // Get current table data based on view mode
        let currentTableData;
        if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
            currentTableData = [...dataPenyuluhan, ...dataPenunjang];
        } else {
            currentTableData = dataNormal;
        }

        // Update multiple rows
        const updatedData = [...data];
        values.forEach((value, offset) => {
            const targetItemInFilteredView = currentTableData[startIndex + offset];
            if (targetItemInFilteredView) {
                const targetIndexInFullData = updatedData.findIndex(item => item.id === targetItemInFilteredView.id);
                if (targetIndexInFullData !== -1) {
                    const targetItem = updatedData[targetIndexInFullData];
                    const numericValue = Number(value);

                    if (column === 'anggaran') {
                        targetItem.anggaran.papbd = numericValue;
                    } else if (MONTHS.some(m => m.key === column)) {
                        if (!targetItem.realisasi[column]) {
                            targetItem.realisasi[column] = { realisasi: 0, dkkb: 0 };
                        }
                        targetItem.realisasi[column].realisasi = numericValue;
                    }
                }
            }
        });

        setData(updatedData);
        saveFinancialData(updatedData);

        // Show success message
        setSuccessMessage(`✓ ${values.length} cell berhasil di-paste`);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // --- Aggregation Helper ---
    const aggregateData = (rows) => {
        const map = new Map();

        rows.forEach((item, index) => {
            // Aggressive normalization: remove ALL whitespace/invisible chars
            const norm = (str) => str ? String(str).replace(/\s+/g, '').trim() : '';

            // Key now includes Kegiatan and SubKegiatan to prevent incorrect merging across hierarchies
            const key = `${norm(item.kegiatan)}_${norm(item.subKegiatan)}_${norm(item.kodeRekening)}`;

            if (!item.kodeRekening) return;

            if (!map.has(key)) {
                // Clone the first item as base
                map.set(key, {
                    ...item,
                    id: `agg-${key}`, // Use normalized key for ID
                    anggaran: { ...item.anggaran }, // Clone
                    realisasi: JSON.parse(JSON.stringify(item.realisasi)) // Deep clone
                });
            } else {
                const existing = map.get(key);
                // Sum Anggaran
                existing.anggaran.sebelum += (item.anggaran.sebelum || 0);
                existing.anggaran.setelah += (item.anggaran.setelah || 0);
                existing.anggaran.papbd += (item.anggaran.papbd || 0);

                // Sum Realisasi
                Object.keys(existing.realisasi).forEach(mKey => {
                    existing.realisasi[mKey].dkkb += (item.realisasi[mKey]?.dkkb || 0);
                    existing.realisasi[mKey].realisasi += (item.realisasi[mKey]?.realisasi || 0);
                });
            }
        });

        return Array.from(map.values());
    };

    // --- Filtering Logic ---
    const uniqueSeksi = [...new Set(data.map(d => d.seksi).filter(Boolean))].sort();
    const uniqueSumberDana = [...new Set(data.map(d => d.sumberDana).filter(Boolean))].sort();

    // Dynamic Program Options based on UPT selection (Only for Normal View)
    let availablePrograms = [];
    if (filterSeksi !== 'UPT_PELATIHAN_PERTANIAN') {
        availablePrograms = [...new Set(data.filter(d => !filterSeksi || d.seksi === filterSeksi).map(d => d.program).filter(Boolean))].sort();
    }

    // --- Data Preparation ---
    let dataPenyuluhan = [];
    let dataPenunjang = [];
    let dataNormal = [];
    let rawPenyuluhan = [];
    let rawPenunjang = [];

    if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
        // 1. Penyuluhan (Pelatihan + Pengembangan)
        rawPenyuluhan = data.filter(item =>
            ['SEKSI PELATIHAN', 'SEKSI PENGEMBANGAN'].includes(item.seksi) &&
            item.program.includes('PENYULUHAN') &&
            (filterSumberDanaPenyuluhan === 'SEMUA' || (item.sumberDana && item.sumberDana.trim() === filterSumberDanaPenyuluhan))
        );

        dataPenyuluhan = aggregateData(rawPenyuluhan).filter(item => item.anggaran.papbd > 0);

        // 2. Penunjang (Tata Usaha) - ONLY PAD MURNI
        rawPenunjang = data.filter(item =>
            ['SUB BAGIAN TATA USAHA'].includes(item.seksi) &&
            item.program.includes('PENUNJANG') &&
            (item.sumberDana && item.sumberDana.trim() === 'PAD MURNI')
        );
        dataPenunjang = aggregateData(rawPenunjang).filter(item => item.anggaran.papbd > 0);

    } else {
        // Normal View
        dataNormal = data.filter(item => {
            const matchesFilters = (
                (!filterSeksi || item.seksi === filterSeksi) &&
                (!filterProgram || item.program === filterProgram) &&
                (!filterSumberDana || (item.sumberDana && item.sumberDana.trim() === filterSumberDana))
            );

            if (filterSeksi && matchesFilters) {
                return item.anggaran.papbd > 0;
            }
            return matchesFilters;
        });
    }

    const visibleMonths = viewMonth.length > 0 ? MONTHS.filter(m => viewMonth.includes(m.key)) : MONTHS;

    // YTD Calculation Logic
    // If a month is selected, we calculate totals from Jan up to that month.
    // If no month selected, we calculate all months.
    const calculationMonths = viewMonth.length > 0
        ? MONTHS.slice(0, Math.max(...viewMonth.map(mk => MONTHS.findIndex(m => m.key === mk) + 1)))
        : MONTHS;

    const calculationMonthKeys = calculationMonths.map(m => m.key);

    // --- Chart Data Preparation ---
    let chartData = [];
    let chartTitle = '';

    if (filterSeksi === 'UPT_PELATIHAN_PERTANIAN') {
        chartData = [...dataPenyuluhan, ...dataPenunjang];
        chartTitle = 'Total Realisasi Anggaran - UPT PELATIHAN PERTANIAN';
    } else {
        chartData = dataNormal;
        chartTitle = filterSeksi ? `Total Realisasi Anggaran - ${filterSeksi}` : 'Total Realisasi Anggaran - Semua Seksi';
    }

    // --- Print Data Preparation ---

    const [printConfig, setPrintConfig] = useState({
        triwulan: 'IV',
        sumberDana: '',
        program: '',
        tanggal: 'MALANG, DESEMBER 2025'
    });

    const handlePrintClick = () => {
        setIsPrintModalOpen(true);
    };

    const handleConfirmPrint = () => {
        setIsPrintModalOpen(false);
        setIsPrinting(true);
    };

    // Filter data for print based on config
    const getPrintData = () => {
        let filtered = data;

        // 1. Filter by Program
        if (printConfig.program) {
            filtered = filtered.filter(item => item.program === printConfig.program);

            // SPECIAL RULE: If Program is "PENUNJANG", ONLY show "PAD MURNI"
            if (printConfig.program.includes('PENUNJANG')) {
                filtered = filtered.filter(item => item.sumberDana && item.sumberDana.trim() === 'PAD MURNI');
            }
        }

        // 2. Filter by Sumber Dana (Only if not already filtered by Special Rule)
        if (printConfig.sumberDana && !printConfig.program.includes('PENUNJANG')) {
            filtered = filtered.filter(item => item.sumberDana && item.sumberDana.trim() === printConfig.sumberDana);
        }

        // 3. Filter by Seksi (if in UPT view, we might want to keep that logic or override it)
        // The user said "pilih jenis program... apakah semua sumber anggaran...". 
        // If we are in "UPT_PELATIHAN_PERTANIAN" view, we usually show specific things.
        // But for the report, maybe we should respect the global data but filtered?
        // Let's stick to the current view's data as a base, then apply print filters.

        // Actually, the user wants to filter *specifically* for the report. 
        // So let's use the 'data' (all data) as base, or the current view's data?
        // "Pilih jenis program dan sumber anggaranya". This implies we might want to print something different than what's on screen.
        // Let's use 'data' (all loaded data) as the base to be safe, so they can print anything regardless of current view.

        // Apply Aggregation (Sum duplicates)
        return aggregateData(filtered);
    };

    const printData = getPrintData();

    // --- Calculation Helper ---
    const calculateRow = (item) => {
        let totalRealisasi = 0;

        // Sum only calculationMonths
        calculationMonthKeys.forEach(key => {
            totalRealisasi += (item.realisasi[key]?.realisasi || 0);
        });

        const sisaAnggaran = (item.anggaran.papbd || 0) - totalRealisasi;
        const persen = item.anggaran.papbd ? (totalRealisasi / item.anggaran.papbd) * 100 : 0;

        return { totalRealisasi, sisaAnggaran, persen };
    };

    const calculateSummary = (rows) => {
        return rows.reduce((acc, item) => {
            const { totalRealisasi, sisaAnggaran } = calculateRow(item);
            acc.anggaranPapbd += (item.anggaran.papbd || 0);
            acc.totalRealisasi += totalRealisasi;
            acc.sisaAnggaran += sisaAnggaran;

            MONTHS.forEach(m => {
                acc.months[m.key].dkkb += (item.realisasi[m.key]?.dkkb || 0);
                acc.months[m.key].realisasi += (item.realisasi[m.key]?.realisasi || 0);
            });

            return acc;
        }, {
            anggaranPapbd: 0,
            totalRealisasi: 0,
            sisaAnggaran: 0,
            months: MONTHS.reduce((mAcc, m) => ({ ...mAcc, [m.key]: { dkkb: 0, realisasi: 0 } }), {})
        });
    };

    // --- Render Helper ---
    const renderTable = (tableData, title, customHeader = null) => {
        const summary = calculateSummary(tableData);
        const summaryPersen = summary.anggaranPapbd ? (summary.totalRealisasi / summary.anggaranPapbd) * 100 : 0;

        return (
            <div style={{ marginBottom: '2rem', overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', WebkitOverflowScrolling: 'touch' }}>
                {title && (
                    <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#334155', margin: 0 }}>{title}</h3>
                        {customHeader}
                    </div>
                )}
                <table className="table table-xs" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '12px', backgroundColor: 'white' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', fontWeight: '700', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                        <tr>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', width: '50px', textAlign: 'center', color: 'white' }}>No.</th>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', minWidth: '120px', textAlign: 'left', color: 'white' }}>KODE REKENING</th>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', minWidth: '300px', textAlign: 'left', color: 'white' }}>URAIAN</th>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', width: '130px', textAlign: 'right', color: 'white' }}>ANGGARAN PAPBD</th>
                            {visibleMonths.map(m => (
                                <th key={m.key} style={{ borderBottom: '2px solid #1e3a8a', padding: '8px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>{m.label.toUpperCase()}</th>
                            ))}
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', minWidth: '120px', textAlign: 'right', borderLeft: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>SISA ANGGARAN</th>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', minWidth: '120px', textAlign: 'right', color: 'white' }}>TOTAL REALISASI</th>
                            <th style={{ borderBottom: '2px solid #1e3a8a', padding: '12px', textAlign: 'right', color: 'white' }}>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={10 + visibleMonths.length} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada data.</td>
                            </tr>
                        ) : (
                            tableData.map((item, index) => {
                                const { totalRealisasi, sisaAnggaran, persen } = calculateRow(item);
                                const isEven = index % 2 === 0;
                                return (
                                    <tr key={item.id} style={{ backgroundColor: isEven ? '#ffffff' : '#f8fafc', transition: 'background-color 0.2s' }} className="hover:bg-blue-50">
                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', fontFamily: 'monospace', color: '#475569' }}>{item.kodeRekening}</td>
                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', fontWeight: '500', color: '#1e293b' }}>{item.uraian}</td>

                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '0', backgroundColor: isEven ? '#f1f5f9' : '#e2e8f0' }}>
                                            <CurrencyInput
                                                value={item.anggaran.papbd}
                                                onChange={(val) => updateRecord(item.id, 'anggaran.papbd', val)}
                                                style={{ width: '100%', border: 'none', padding: '8px 12px', fontWeight: 'bold', backgroundColor: 'transparent', color: '#0f172a' }}
                                                data-row={index}
                                                data-col="anggaran"
                                                onKeyDown={(e) => handleKeyDown(e, index, 'anggaran', visibleMonths)}
                                                onMultiPaste={(values) => handleMultiPaste(index, 'anggaran', values)}
                                            />
                                        </td>

                                        {visibleMonths.map(m => (
                                            <React.Fragment key={m.key}>
                                                <td style={{ borderBottom: '1px solid #e2e8f0', padding: '0', borderLeft: '1px solid #f1f5f9' }}>
                                                    <CurrencyInput
                                                        value={item.realisasi[m.key]?.realisasi || 0}
                                                        onChange={(val) => updateRecord(item.id, null, val, m.key, 'realisasi')}
                                                        style={{ width: '100%', minWidth: '80px', border: 'none', padding: '8px', fontSize: '11px', backgroundColor: 'transparent', color: '#334155' }}
                                                        data-row={index}
                                                        data-col={m.key}
                                                        onKeyDown={(e) => handleKeyDown(e, index, m.key, visibleMonths)}
                                                        onMultiPaste={(values) => handleMultiPaste(index, m.key, values)}
                                                    />
                                                </td>
                                            </React.Fragment>
                                        ))}

                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', textAlign: 'right', borderLeft: '2px solid #f1f5f9', color: sisaAnggaran < 0 ? '#ef4444' : '#1e293b' }}>
                                            {formatCurrency(sisaAnggaran)}
                                        </td>
                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                                            {formatCurrency(totalRealisasi)}
                                        </td>
                                        <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                                            {persen.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot style={{ backgroundColor: '#1e293b', color: 'white', fontWeight: 'bold' }}>
                        <tr>
                            <td colSpan="3" style={{ padding: '12px', textAlign: 'center', borderTop: '2px solid #0f172a' }}>TOTAL</td>
                            <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #0f172a', backgroundColor: '#334155' }}>{formatCurrency(summary.anggaranPapbd)}</td>

                            {visibleMonths.map(m => (
                                <React.Fragment key={m.key}>
                                    <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #0f172a', borderLeft: '1px solid #475569' }}>{formatCurrency(summary.months[m.key].realisasi)}</td>
                                </React.Fragment>
                            ))}

                            <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #0f172a', borderLeft: '2px solid #475569' }}>{formatCurrency(summary.sisaAnggaran)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #0f172a' }}>{formatCurrency(summary.totalRealisasi)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #0f172a' }}>{summaryPersen.toFixed(2)}%</td>
                        </tr>
                    </tfoot>
                </table >
            </div >
        );
    };


    return (
        <div className="financial-table-container" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

            {/* Success Message */}
            {successMessage && (
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
                    fontWeight: '500',
                    fontSize: '0.95rem'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>{successMessage}</span>
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

            {/* Visualization Chart */}
            <FinancialChart data={chartData} title={chartTitle} months={calculationMonthKeys} />



            {/* Controls Bar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Recap Button */}
                        <button
                            className="btn btn-sm"
                            onClick={() => setIsRecapOpen(true)}
                            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' }}
                        >
                            <AlertCircle size={16} style={{ marginRight: '0.5rem' }} /> Rekapitulasi
                        </button>

                        {/* Receipt Button */}
                        <button
                            className="btn btn-sm"
                            onClick={() => setIsReceiptOpen(true)}
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Cetak Kwitansi
                        </button>

                        {/* Surat Pengantar Button */}
                        <button
                            className="btn btn-sm"
                            onClick={() => setIsSuratPengantarOpen(true)}
                            style={{ backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', color: 'white' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Surat Pengantar
                        </button>

                        <button
                            className="btn btn-sm"
                            onClick={handlePrintClick}
                            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Cetak DKKB
                        </button>

                        {/* Receipt Modal */}
                        {isReceiptOpen && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.5rem', width: '350px', maxWidth: '90%' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cetak Kwitansi</h3>
                                    <p className="mb-2 text-xs text-gray-600">
                                        Pilih bulan untuk dicetak (Gabungan Program Penunjang & Penyuluhan).
                                    </p>

                                    <div className="form-control w-full mb-2">
                                        <label className="label py-0 mb-1"><span className="label-text text-xs font-semibold">Bulan</span></label>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={receiptMonth}
                                            onChange={(e) => setReceiptMonth(e.target.value)}
                                        >
                                            <option value="jan">Januari</option>
                                            <option value="feb">Februari</option>
                                            <option value="mar">Maret</option>
                                            <option value="apr">April</option>
                                            <option value="mei">Mei</option>
                                            <option value="jun">Juni</option>
                                            <option value="jul">Juli</option>
                                            <option value="aug">Agustus</option>
                                            <option value="sep">September</option>
                                            <option value="okt">Oktober</option>
                                            <option value="nov">November</option>
                                            <option value="des">Desember</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button className="btn btn-sm btn-ghost h-8 min-h-0" onClick={() => setIsReceiptOpen(false)}>Batal</button>
                                        <button className="btn btn-primary btn-sm h-8 min-h-0" onClick={() => {
                                            setIsReceiptOpen(false);
                                            setIsPrintingReceipt(true);
                                        }}>Cetak</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isPrintingReceipt && (
                            <ReceiptReport
                                data={data}
                                config={{
                                    monthKey: receiptMonth,
                                    monthLabel: {
                                        jan: 'Januari', feb: 'Februari', mar: 'Maret', apr: 'April', mei: 'Mei', jun: 'Juni',
                                        jul: 'Juli', aug: 'Agustus', sep: 'September', okt: 'Oktober', nov: 'November', des: 'Desember'
                                    }[receiptMonth],
                                    year: '2025'
                                }}
                            />
                        )}

                        {/* Surat Pengantar Modal */}
                        {isSuratPengantarOpen && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.5rem', width: '350px', maxWidth: '90%' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cetak Surat Pengantar</h3>
                                    <p className="mb-2 text-xs text-gray-600">
                                        Pilih bulan untuk dicetak.
                                    </p>

                                    <div className="form-control w-full mb-2">
                                        <label className="label py-0 mb-1"><span className="label-text text-xs font-semibold">Bulan</span></label>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={suratPengantarMonth}
                                            onChange={(e) => setSuratPengantarMonth(e.target.value)}
                                        >
                                            <option value="jan">Januari</option>
                                            <option value="feb">Februari</option>
                                            <option value="mar">Maret</option>
                                            <option value="apr">April</option>
                                            <option value="mei">Mei</option>
                                            <option value="jun">Juni</option>
                                            <option value="jul">Juli</option>
                                            <option value="aug">Agustus</option>
                                            <option value="sep">September</option>
                                            <option value="okt">Oktober</option>
                                            <option value="nov">November</option>
                                            <option value="des">Desember</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button className="btn btn-sm btn-ghost h-8 min-h-0" onClick={() => setIsSuratPengantarOpen(false)}>Batal</button>
                                        <button className="btn btn-primary btn-sm h-8 min-h-0" onClick={() => {
                                            setIsSuratPengantarOpen(false);
                                            setIsPrintingSuratPengantar(true);
                                        }}>Cetak</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isPrintingSuratPengantar && (
                            <SuratPengantar
                                data={data}
                                config={{
                                    monthKey: suratPengantarMonth,
                                    monthLabel: {
                                        jan: 'Januari', feb: 'Februari', mar: 'Maret', apr: 'April', mei: 'Mei', jun: 'Juni',
                                        jul: 'Juli', aug: 'Agustus', sep: 'September', okt: 'Oktober', nov: 'November', des: 'Desember'
                                    }[suratPengantarMonth],
                                    year: '2025'
                                }}
                                onClose={() => setIsPrintingSuratPengantar(false)}
                            />
                        )}

                        <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: 'white' }}>
                            <Save size={16} style={{ marginRight: '0.5rem' }} /> Simpan
                        </button>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => fileInputRef.current.click()}
                                style={{ backgroundColor: '#fff', borderColor: '#cbd5e1', color: '#475569' }}
                            >
                                <Upload size={16} style={{ marginRight: '0.5rem' }} /> Import Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recap Modal */}
                <RecapModal
                    isOpen={isRecapOpen}
                    onClose={() => setIsRecapOpen(false)}
                    data={data}
                    monthKey={viewMonth}
                    calculationMonthKeys={calculationMonthKeys}
                    uniqueSeksi={uniqueSeksi}
                />

                {/* Print Settings Modal */}
                {isPrintModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '400px', maxWidth: '90%' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Pengaturan Cetak DKKB</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Pilih Triwulan</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={printConfig.triwulan}
                                        onChange={e => setPrintConfig({ ...printConfig, triwulan: e.target.value })}
                                    >
                                        <option value="I">Triwulan I (Jan - Mar)</option>
                                        <option value="II">Triwulan II (Apr - Jun)</option>
                                        <option value="III">Triwulan III (Jul - Sep)</option>
                                        <option value="IV">Triwulan IV (Okt - Des)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sumber Dana</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={printConfig.sumberDana}
                                        onChange={e => setPrintConfig({ ...printConfig, sumberDana: e.target.value })}
                                    >
                                        <option value="">Semua Sumber Dana</option>
                                        {uniqueSumberDana.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Program</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={printConfig.program}
                                        onChange={e => setPrintConfig({ ...printConfig, program: e.target.value })}
                                    >
                                        <option value="">Semua Program</option>
                                        {/* Use all available programs from data */}
                                        {[...new Set(data.map(d => d.program).filter(Boolean))].sort().map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tanggal & Tempat (Tanda Tangan)</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={printConfig.tanggal}
                                    onChange={e => setPrintConfig({ ...printConfig, tanggal: e.target.value })}
                                    placeholder="Contoh: MALANG, DESEMBER 2025"
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn" onClick={() => setIsPrintModalOpen(false)}>Batal</button>
                                <button className="btn btn-primary" onClick={handleConfirmPrint}>Cetak Sekarang</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '2 1 350px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>UNIT KERJA / SEKSI</label>
                        <select className="select select-bordered select-sm w-full" value={filterSeksi} onChange={e => setFilterSeksi(e.target.value)}>
                            <option value="UPT_PELATIHAN_PERTANIAN" style={{ fontWeight: 'bold', backgroundColor: '#1e293b', color: 'white' }}>UPT PELATIHAN PERTANIAN (GABUNGAN)</option>
                            <option disabled>----------------</option>
                            {uniqueSeksi.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Normal View Filters */}
                    {filterSeksi !== 'UPT_PELATIHAN_PERTANIAN' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 200px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>PROGRAM</label>
                                <select className="select select-bordered select-sm w-full" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
                                    <option value="">Semua Program</option>
                                    {availablePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 180px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>SUMBER DANA</label>
                                <select className="select select-bordered select-sm w-full" value={filterSumberDana} onChange={e => setFilterSumberDana(e.target.value)}>
                                    <option value="">Semua Sumber Dana</option>
                                    {uniqueSumberDana.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 150px', position: 'relative' }} data-month-dropdown>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>PERIODE</label>
                        <button
                            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                            className="select select-bordered select-sm w-full"
                            style={{
                                backgroundColor: '#1e293b',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontWeight: '500',
                                border: '1px solid #1e293b'
                            }}
                        >
                            <span>
                                {viewMonth.length === 0
                                    ? 'Semua Bulan'
                                    : viewMonth.length === 1
                                        ? MONTHS.find(m => m.key === viewMonth[0])?.label
                                        : `${viewMonth.length} Bulan`}
                            </span>
                            <ChevronDown size={16} style={{ transform: isMonthDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {isMonthDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '0.25rem',
                                backgroundColor: 'white',
                                border: '1px solid #cbd5e1',
                                borderRadius: '0.25rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <div
                                    onClick={() => {
                                        setViewMonth([]);
                                        setIsMonthDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        borderBottom: '1px solid #e2e8f0',
                                        fontWeight: 'bold',
                                        backgroundColor: viewMonth.length === 0 ? '#e0f2fe' : 'white',
                                        color: '#1e293b'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = viewMonth.length === 0 ? '#e0f2fe' : 'white'}
                                >
                                    ✓ Semua Bulan
                                </div>
                                {MONTHS.map(m => {
                                    const isSelected = viewMonth.includes(m.key);
                                    const isDisabled = !isSelected && viewMonth.length >= 3;

                                    return (
                                        <div
                                            key={m.key}
                                            onClick={() => {
                                                if (isDisabled) return;

                                                setViewMonth(prev => {
                                                    if (prev.includes(m.key)) {
                                                        return prev.filter(k => k !== m.key);
                                                    } else {
                                                        return [...prev, m.key];
                                                    }
                                                });
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                backgroundColor: isSelected ? '#e0f2fe' : 'white',
                                                opacity: isDisabled ? 0.4 : 1,
                                                color: '#1e293b'
                                            }}
                                            onMouseEnter={e => {
                                                if (!isDisabled) e.currentTarget.style.backgroundColor = '#f1f5f9';
                                            }}
                                            onMouseLeave={e => {
                                                if (!isDisabled) e.currentTarget.style.backgroundColor = isSelected ? '#e0f2fe' : 'white';
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                readOnly
                                                style={{ accentColor: '#0ea5e9', width: '16px', height: '16px' }}
                                            />
                                            <span style={{ color: '#1e293b', fontWeight: '500' }}>{m.label}</span>
                                            {isDisabled && !isSelected && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>(Max 3)</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Render */}
            {filterSeksi === 'UPT_PELATIHAN_PERTANIAN' ? (
                <>
                    {renderTable(dataPenyuluhan, 'PROGRAM PENYULUHAN PERTANIAN', (
                        <div className="flex items-center gap-4">
                            <select
                                className="select select-bordered select-xs"
                                value={filterSumberDanaPenyuluhan}
                                onChange={e => setFilterSumberDanaPenyuluhan(e.target.value)}
                                style={{ fontWeight: 'bold' }}
                            >
                                <option value="SEMUA">SEMUA SUMBER DANA</option>
                                <option value="PAD MURNI">PAD MURNI</option>
                                <option value="DBHCHT">DBHCHT</option>
                            </select>
                        </div>
                    ))}

                    {renderTable(dataPenunjang, 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', (
                        <span className="badge badge-neutral">PAD MURNI</span>
                    ))}
                </>
            ) : (
                renderTable(dataNormal, '')
            )}

            {/* Hidden Print Report */}
            {isPrinting && (
                <DKKBReport
                    data={printData}
                    config={printConfig}
                    onClose={() => setIsPrinting(false)}
                />
            )}

            {isPrintingReceipt && (
                <ReceiptReport
                    data={data}
                    config={{
                        monthKey: receiptMonth,
                        monthLabel: {
                            jan: 'Januari', feb: 'Februari', mar: 'Maret', apr: 'April', mei: 'Mei', jun: 'Juni',
                            jul: 'Juli', aug: 'Agustus', sep: 'September', okt: 'Oktober', nov: 'November', des: 'Desember'
                        }[receiptMonth],
                        year: '2025'
                    }}
                    onAfterPrint={() => setIsPrintingReceipt(false)}
                />
            )}
        </div>
    );
};

export default FinancialTable;
