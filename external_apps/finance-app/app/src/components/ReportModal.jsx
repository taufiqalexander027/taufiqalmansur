import { X, FileText, Download } from 'lucide-react';
import { formatCurrency, getDetailedBreakdown } from '../utils/calculations';

const ReportModal = ({ isOpen, onClose, data, filters, totals }) => {
    if (!isOpen) return null;

    const breakdown = getDetailedBreakdown(data, filters.periode);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={24} color="var(--color-accent-primary)" />
                        <h2 className="modal-title">Laporan Realisasi Keuangan</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: 'var(--border-radius-sm)',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--color-bg-tertiary)';
                            e.target.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--color-text-secondary)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Report Header */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-sm)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                            Filter yang Diterapkan
                        </h3>
                        <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                            <div>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Seksi:</span>
                                <p style={{ fontWeight: '500', marginTop: '0.25rem' }}>
                                    {filters.seksi === 'all' ? 'Semua Seksi' : filters.seksi}
                                </p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Sumber Dana:</span>
                                <p style={{ fontWeight: '500', marginTop: '0.25rem' }}>
                                    {filters.sumberDana === 'all' ? 'Semua Sumber' : data.find(s => s.id === filters.sumberDana)?.nama}
                                </p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Periode:</span>
                                <p style={{ fontWeight: '500', marginTop: '0.25rem' }}>
                                    Sampai dengan {filters.periode}
                                </p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Total Item:</span>
                                <p style={{ fontWeight: '500', marginTop: '0.25rem' }}>
                                    {breakdown.length} item
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Ringkasan
                        </h3>
                        <div className="grid grid-cols-2">
                            <div style={{ padding: '1rem', background: 'hsla(263, 70%, 60%, 0.1)', borderRadius: 'var(--border-radius-sm)' }}>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Total Anggaran (PAPBD)
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(263, 70%, 60%)' }}>
                                    {formatCurrency(totals.anggaran)}
                                </p>
                            </div>
                            <div style={{ padding: '1rem', background: 'hsla(200, 90%, 55%, 0.1)', borderRadius: 'var(--border-radius-sm)' }}>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Total DKKB (Rencana)
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(200, 90%, 55%)' }}>
                                    {formatCurrency(totals.dkkb)}
                                </p>
                            </div>
                            <div style={{ padding: '1rem', background: 'hsla(142, 71%, 45%, 0.1)', borderRadius: 'var(--border-radius-sm)' }}>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Total Realisasi
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(142, 71%, 45%)' }}>
                                    {formatCurrency(totals.realisasi)}
                                </p>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-sm)' }}>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Variance
                                </p>
                                <p style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: (totals.realisasi - totals.dkkb) >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'
                                }}>
                                    {formatCurrency(totals.realisasi - totals.dkkb)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Detail Per Item
                        </h3>
                        <div className="table-container" style={{ maxHeight: '400px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>Kode Rekening</th>
                                        <th>Uraian</th>
                                        <th style={{ textAlign: 'right' }}>DKKB</th>
                                        <th style={{ textAlign: 'right' }}>Realisasi</th>
                                        <th style={{ textAlign: 'right' }}>Variance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdown.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                                {item.kodeRekening}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{item.uraian}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                    {item.sumberAnggaran}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                                {formatCurrency(item.totalDKKB)}
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {formatCurrency(item.totalRealisasi)}
                                            </td>
                                            <td style={{
                                                textAlign: 'right',
                                                fontSize: '0.85rem',
                                                color: item.variance >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)',
                                                fontWeight: '500'
                                            }}>
                                                {formatCurrency(item.variance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Tutup
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <Download size={18} />
                        Print / Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
