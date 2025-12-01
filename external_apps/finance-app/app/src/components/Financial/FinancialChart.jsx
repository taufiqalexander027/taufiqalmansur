
import React from 'react';
import { formatCurrency } from './CurrencyInput';

const FinancialChart = ({ data, title, months }) => {
    // Calculate Totals
    const summary = data.reduce((acc, item) => {
        let totalRealisasiRow = 0;
        if (item.realisasi) {
            // If months provided, sum only those. Otherwise sum all values.
            if (months && months.length > 0) {
                months.forEach(key => {
                    totalRealisasiRow += (item.realisasi[key]?.realisasi || 0);
                });
            } else {
                Object.values(item.realisasi).forEach(m => {
                    totalRealisasiRow += (m.realisasi || 0);
                });
            }
        }

        acc.anggaran += (item.anggaran?.papbd || 0);
        acc.realisasi += totalRealisasiRow;
        return acc;
    }, { anggaran: 0, realisasi: 0 });

    const percentage = summary.anggaran ? ((summary.realisasi / summary.anggaran) * 100) : 0;
    const percentageFormatted = percentage.toFixed(2);

    // Calculate widths relative to the larger value (usually Anggaran, but Realisasi could be higher)
    const maxValue = Math.max(summary.anggaran, summary.realisasi) || 1;
    const anggaranWidth = (summary.anggaran / maxValue) * 100;
    const realisasiWidth = (summary.realisasi / maxValue) * 100;

    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>{title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Ringkasan Realisasi Anggaran</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: percentage > 100 ? '#ef4444' : '#3b82f6' }}>{percentageFormatted}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>TEREALISASI</div>
                </div>
            </div>

            {/* Custom Bar Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Anggaran Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                        <span>Total Anggaran (PAPBD)</span>
                        <span>{formatCurrency(summary.anggaran)}</span>
                    </div>
                    <div style={{ width: '100%', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${anggaranWidth}% `,
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                borderRadius: '12px',
                                transition: 'width 1s ease-in-out'
                            }}
                        />
                    </div>
                </div>

                {/* Realisasi Bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                        <span>Total Realisasi</span>
                        <span style={{ color: percentage > 100 ? '#ef4444' : '#22c55e' }}>{formatCurrency(summary.realisasi)}</span>
                    </div>
                    <div style={{ width: '100%', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${realisasiWidth}% `,
                                height: '100%',
                                backgroundColor: percentage > 100 ? '#ef4444' : '#22c55e',
                                borderRadius: '12px',
                                transition: 'width 1s ease-in-out'
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* Legend / Info */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Anggaran</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Realisasi</span>
                </div>
            </div>
        </div>
    );
};

export default FinancialChart;
