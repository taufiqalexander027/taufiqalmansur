import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const DataTable = ({ data, filters, onShowReport }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    // Build hierarchical structure: Sumber > Program > Kegiatan > Sub Kegiatan > Items
    const buildHierarchy = () => {
        const hierarchy = {};

        data.forEach(sumber => {
            const sumberKey = sumber.nama;

            if (!hierarchy[sumberKey]) {
                hierarchy[sumberKey] = {
                    nama: sumber.nama,
                    seksi: sumber.seksi,
                    programs: {}
                };
            }

            const programKey = sumber.program || 'Program Tidak Diketahui';
            if (!hierarchy[sumberKey].programs[programKey]) {
                hierarchy[sumberKey].programs[programKey] = {
                    nama: programKey,
                    kegiatans: {}
                };
            }

            sumber.items.forEach(item => {
                const kegiatanKey = item.kegiatan || 'Kegiatan Tidak Diketahui';
                const subKegiatanKey = item.subKegiatan || 'Sub Kegiatan Tidak Diketahui';

                const prog = hierarchy[sumberKey].programs[programKey];

                if (!prog.kegiatans[kegiatanKey]) {
                    prog.kegiatans[kegiatanKey] = {
                        nama: kegiatanKey,
                        subKegiatans: {}
                    };
                }

                if (!prog.kegiatans[kegiatanKey].subKegiatans[subKegiatanKey]) {
                    prog.kegiatans[kegiatanKey].subKegiatans[subKegiatanKey] = {
                        nama: subKegiatanKey,
                        items: []
                    };
                }

                // Calculate totals for this item
                const bulanList = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november'];
                const periodeIndex = bulanList.indexOf(filters.periode.toLowerCase());
                const bulanSampai = bulanList.slice(0, periodeIndex + 1);

                const totalDKKB = bulanSampai.reduce((sum, bulan) => sum + (item.dkkb[bulan] || 0), 0);
                const totalRealisasi = bulanSampai.reduce((sum, bulan) => sum + (item.realisasi[bulan] || 0), 0);

                prog.kegiatans[kegiatanKey].subKegiatans[subKegiatanKey].items.push({
                    ...item,
                    totalDKKB,
                    totalRealisasi,
                    variance: totalRealisasi - totalDKKB
                });
            });
        });

        return hierarchy;
    };

    const hierarchy = buildHierarchy();

    // Calculate totals for a group of items
    const calculateGroupTotals = (items) => {
        return items.reduce((acc, item) => ({
            anggaran: acc.anggaran + (item.anggaranPAPBD || 0),
            dkkb: acc.dkkb + (item.totalDKKB || 0),
            realisasi: acc.realisasi + (item.totalRealisasi || 0)
        }), { anggaran: 0, dkkb: 0, realisasi: 0 });
    };

    if (Object.keys(hierarchy).length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Tidak ada data untuk filter yang dipilih
                </p>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid hsla(220, 20%, 30%, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Detail Realisasi (Struktur Hierarkis)
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        s/d {filters.periode}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={onShowReport}>
                    <Eye size={18} />
                    Lihat Laporan Lengkap
                </button>
            </div>

            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Struktur Anggaran</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Anggaran</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>DKKB</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Realisasi</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Variance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(hierarchy).map(([sumberKey, sumberData]) => {
                            const sumberId = `sumber-${sumberKey}`;
                            const isSumberExpanded = expandedNodes.has(sumberId);

                            // Calculate sumber totals
                            const allSumberItems = Object.values(sumberData.programs).flatMap(p =>
                                Object.values(p.kegiatans).flatMap(k =>
                                    Object.values(k.subKegiatans).flatMap(sk => sk.items)
                                )
                            );
                            const sumberTotals = calculateGroupTotals(allSumberItems);

                            return (
                                <>
                                    {/* Sumber Anggaran Row */}
                                    <tr
                                        key={sumberId}
                                        onClick={() => toggleNode(sumberId)}
                                        style={{
                                            cursor: 'pointer',
                                            background: 'var(--color-bg-secondary)',
                                            fontWeight: '700'
                                        }}
                                    >
                                        <td>
                                            {isSumberExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>{sumberData.nama}</span>
                                                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                                    {sumberData.seksi}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(sumberTotals.anggaran)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(sumberTotals.dkkb)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(sumberTotals.realisasi)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ color: (sumberTotals.realisasi - sumberTotals.dkkb) >= 0 ? 'var(--color-accent-success)' : 'var(--color-accent-error)' }}>
                                                {formatCurrency(sumberTotals.realisasi - sumberTotals.dkkb)}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Programs */}
                                    {isSumberExpanded && Object.entries(sumberData.programs).map(([progKey, progData]) => {
                                        const progId = `${sumberId}-prog-${progKey}`;
                                        const isProgExpanded = expandedNodes.has(progId);

                                        const allProgItems = Object.values(progData.kegiatans).flatMap(k =>
                                            Object.values(k.subKegiatans).flatMap(sk => sk.items)
                                        );
                                        const progTotals = calculateGroupTotals(allProgItems);

                                        return (
                                            <>
                                                <tr
                                                    key={progId}
                                                    onClick={() => toggleNode(progId)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        background: 'hsla(220, 20%, 18%, 0.8)',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    <td></td>
                                                    <td style={{ paddingLeft: '2rem' }}>
                                                        {isProgExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        {' '}Program: {progData.nama}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>{formatCurrency(progTotals.anggaran)}</td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>{formatCurrency(progTotals.dkkb)}</td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>{formatCurrency(progTotals.realisasi)}</td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                                                        <span style={{ color: (progTotals.realisasi - progTotals.dkkb) >= 0 ? 'var(--color-accent-success)' : 'var(--color-accent-error)' }}>
                                                            {formatCurrency(progTotals.realisasi - progTotals.dkkb)}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Kegiatans */}
                                                {isProgExpanded && Object.entries(progData.kegiatans).map(([kegKey, kegData]) => {
                                                    const kegId = `${progId}-keg-${kegKey}`;
                                                    const isKegExpanded = expandedNodes.has(kegId);

                                                    const allKegItems = Object.values(kegData.subKegiatans).flatMap(sk => sk.items);
                                                    const kegTotals = calculateGroupTotals(allKegItems);

                                                    return (
                                                        <>
                                                            <tr
                                                                key={kegId}
                                                                onClick={() => toggleNode(kegId)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    background: 'hsla(220, 20%, 16%, 0.6)',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <td></td>
                                                                <td style={{ paddingLeft: '3.5rem', fontSize: '0.9rem' }}>
                                                                    {isKegExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                    {' '}Kegiatan: {kegData.nama}
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(kegTotals.anggaran)}</td>
                                                                <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(kegTotals.dkkb)}</td>
                                                                <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(kegTotals.realisasi)}</td>
                                                                <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                                                    {formatCurrency(kegTotals.realisasi - kegTotals.dkkb)}
                                                                </td>
                                                            </tr>

                                                            {/* Sub Kegiatans */}
                                                            {isKegExpanded && Object.entries(kegData.subKegiatans).map(([subKegKey, subKegData]) => {
                                                                const subKegId = `${kegId}-subkeg-${subKegKey}`;
                                                                const isSubKegExpanded = expandedNodes.has(subKegId);

                                                                const subKegTotals = calculateGroupTotals(subKegData.items);

                                                                return (
                                                                    <>
                                                                        <tr
                                                                            key={subKegId}
                                                                            onClick={() => toggleNode(subKegId)}
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                                background: 'hsla(220, 20%, 14%, 0.4)'
                                                                            }}
                                                                        >
                                                                            <td></td>
                                                                            <td style={{ paddingLeft: '5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                                                {isSubKegExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                                                                {' '}Sub Kegiatan: {subKegData.nama}
                                                                            </td>
                                                                            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(subKegTotals.anggaran)}</td>
                                                                            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(subKegTotals.dkkb)}</td>
                                                                            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(subKegTotals.realisasi)}</td>
                                                                            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                                                                {formatCurrency(subKegTotals.realisasi - subKegTotals.dkkb)}
                                                                            </td>
                                                                        </tr>

                                                                        {/* Items (Kode Rekening) */}
                                                                        {isSubKegExpanded && subKegData.items.map((item, idx) => (
                                                                            <tr key={`${subKegId}-item-${idx}`} style={{ background: 'var(--color-bg-primary)' }}>
                                                                                <td></td>
                                                                                <td style={{ paddingLeft: '7rem', fontSize: '0.8rem' }}>
                                                                                    <div>
                                                                                        <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-primary)' }}>
                                                                                            {item.kodeRekening}
                                                                                        </span>
                                                                                        <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                                                                            {item.uraian}
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                                                                    {formatCurrency(item.anggaranPAPBD)}
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                                                                    {formatCurrency(item.totalDKKB)}
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                                                                    {formatCurrency(item.totalRealisasi)}
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                                                                    <span style={{
                                                                                        color: item.variance >= 0 ? 'var(--color-accent-success)' : 'var(--color-accent-error)',
                                                                                        fontWeight: '500'
                                                                                    }}>
                                                                                        {formatCurrency(item.variance)}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })}
                                                        </>
                                                    );
                                                })}
                                            </>
                                        );
                                    })}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
