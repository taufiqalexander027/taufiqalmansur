import { useState, useEffect, useMemo } from 'react';
import { Save, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { getMasterData, getRekeningBySeksi } from '../../services/masterDataService';
import { getTransactionData, saveBatchTransactions, getTransactionsByRekening, calculateTotalRealisasiUpToMonth, calculateSisaAnggaran } from '../../services/transactionService';
import { createTransaction, getTransactionValue } from '../../models/transactionData';
import { formatCurrency, getAllBulan } from '../../utils/calculations';

const InputRealisasi = () => {
    const [bulan, setBulan] = useState('januari');
    const [seksi, setSeksi] = useState('');
    const [sumberDana, setSumberDana] = useState('PAD MURNI');
    const [rekenings, setRekenings] = useState([]);
    const [transactions, setTransactions] = useState({ dkkb: [], realisasi: [] });
    const [inputValues, setInputValues] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);

    // Load initial data
    useEffect(() => {
        const masterData = getMasterData();
        if (masterData.seksi.length > 0) {
            setSeksi(masterData.seksi[0].id);
        }

        const transData = getTransactionData();
        setTransactions(transData);
    }, []);

    // Load rekenings when filters change
    useEffect(() => {
        if (seksi) {
            const filtered = getRekeningBySeksi(seksi, sumberDana);
            setRekenings(filtered);

            // Initialize input values from existing transactions
            const values = {};
            filtered.forEach(rek => {
                const val = getTransactionValue(transactions.realisasi, rek.id, sumberDana, bulan);
                values[rek.id] = val;
            });
            setInputValues(values);
        }
    }, [seksi, sumberDana, bulan, transactions]);

    const handleInputChange = (rekeningId, value) => {
        setInputValues(prev => ({
            ...prev,
            [rekeningId]: Number(value)
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setSuccessMsg(null);

        try {
            const newTransactions = rekenings.map(rek => {
                return createTransaction({
                    tahun: 2025,
                    bulan,
                    rekeningId: rek.id,
                    rekeningKode: rek.kode,
                    seksiId: seksi,
                    sumberDana,
                    nilai: inputValues[rek.id] || 0,
                    type: 'REALISASI'
                });
            });

            saveBatchTransactions(newTransactions);

            // Refresh local transaction data
            setTransactions(getTransactionData());
            setSuccessMsg('Data Realisasi berhasil disimpan!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    const bulanList = getAllBulan();
    const masterData = getMasterData();

    // Calculate totals for footer
    const totalInput = Object.values(inputValues).reduce((sum, val) => sum + (val || 0), 0);

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calculator size={20} />
                    Input Realisasi (Aktual)
                </h2>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isLoading || rekenings.length === 0}
                >
                    <Save size={16} />
                    {isLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
            </div>

            {successMsg && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                    <CheckCircle size={16} />
                    {successMsg}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem' }}>
                <div>
                    <label className="label">Bulan</label>
                    <select
                        className="input"
                        value={bulan}
                        onChange={(e) => setBulan(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        {bulanList.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Seksi</label>
                    <select
                        className="input"
                        value={seksi}
                        onChange={(e) => setSeksi(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        {masterData.seksi.map(s => (
                            <option key={s.id} value={s.id}>{s.nama}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Sumber Dana</label>
                    <select
                        className="input"
                        value={sumberDana}
                        onChange={(e) => setSumberDana(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="PAD MURNI">PAD MURNI</option>
                        <option value="DBHCHT">DBHCHT</option>
                    </select>
                </div>
            </div>

            {/* Input Table */}
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '150px' }}>Kode Rekening</th>
                            <th>Uraian</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Anggaran PAPBD</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Total Realisasi s/d Lalu</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Input Realisasi Bulan Ini</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Sisa Anggaran</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rekenings.map(rek => {
                            const anggaran = rek.anggaranPAPBD[sumberDana] || 0;

                            // Calculate previous realization (up to previous month)
                            const bulanIndex = bulanList.findIndex(b => b.value === bulan);
                            const prevBulan = bulanIndex > 0 ? bulanList[bulanIndex - 1].value : null;
                            const totalLalu = prevBulan
                                ? calculateTotalRealisasiUpToMonth(transactions.realisasi, rek.id, sumberDana, prevBulan)
                                : 0;

                            const currentInput = inputValues[rek.id] || 0;
                            const totalRealisasi = totalLalu + currentInput;
                            const sisa = calculateSisaAnggaran(anggaran, totalRealisasi);

                            return (
                                <tr key={rek.id}>
                                    <td style={{ fontFamily: 'monospace' }}>{rek.kode}</td>
                                    <td>
                                        <div>{rek.uraian}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                            {rek.kegiatan.nama}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(anggaran)}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{formatCurrency(totalLalu)}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="number"
                                            className="input"
                                            value={inputValues[rek.id] || ''}
                                            onChange={(e) => handleInputChange(rek.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'right',
                                                borderColor: 'var(--color-accent-primary)'
                                            }}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '600', color: sisa < 0 ? 'var(--color-accent-error)' : 'var(--color-accent-success)' }}>
                                        {formatCurrency(sisa)}
                                    </td>
                                </tr>
                            );
                        })}
                        {rekenings.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    Tidak ada data rekening untuk filter ini. Silakan import master data terlebih dahulu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {rekenings.length > 0 && (
                        <tfoot>
                            <tr style={{ background: 'var(--color-bg-secondary)', fontWeight: '700' }}>
                                <td colSpan="4" style={{ textAlign: 'right' }}>Total Input Bulan Ini:</td>
                                <td style={{ textAlign: 'right', color: 'var(--color-accent-primary)' }}>{formatCurrency(totalInput)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default InputRealisasi;
