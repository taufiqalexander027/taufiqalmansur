import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { getMasterData } from '../../services/masterDataService';
import { getTransactionData, calculateTotalRealisasiUpToMonth } from '../../services/transactionService';
import { formatCurrency, getAllBulan } from '../../utils/calculations';

const HierarchicalReport = () => {
    const [periode, setPeriode] = useState('november');
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [hierarchy, setHierarchy] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        buildReportData();
    }, [periode]);

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const buildReportData = () => {
        setIsLoading(true);
        const masterData = getMasterData();
        const transactionData = getTransactionData();

        // Build hierarchy: Seksi > Program > Kegiatan > Sub Kegiatan > Items
        const tree = {};

        masterData.rekenings.forEach(rek => {
            // Process for each Sumber Dana (PAD & DBHCHT)
            ['PAD MURNI', 'DBHCHT'].forEach(sumberDana => {
                // Skip if no budget for this sumber dana
                const anggaran = rek.anggaranPAPBD[sumberDana] || 0;
                if (anggaran === 0) return;

                const seksiKey = rek.seksiId;
                const programKey = rek.program.id;
                const kegiatanKey = rek.kegiatan.id;
                const subKegiatanKey = rek.subKegiatan.id;

                // 1. Seksi Level
                if (!tree[seksiKey]) {
                    tree[seksiKey] = {
                        id: seksiKey,
                        nama: seksiKey.replace(/_/g, ' '),
                        type: 'seksi',
                        programs: {},
                        totals: { anggaran: 0, realisasi: 0, sisa: 0 }
                    };
                }

                // 2. Program Level
                if (!tree[seksiKey].programs[programKey]) {
                    tree[seksiKey].programs[programKey] = {
                        id: programKey,
                        nama: rek.program.nama,
                        type: 'program',
                        kegiatans: {},
                        totals: { anggaran: 0, realisasi: 0, sisa: 0 }
                    };
                }

                // 3. Kegiatan Level
                if (!tree[seksiKey].programs[programKey].kegiatans[kegiatanKey]) {
                    tree[seksiKey].programs[programKey].kegiatans[kegiatanKey] = {
                        id: kegiatanKey,
                        nama: rek.kegiatan.nama,
                        type: 'kegiatan',
                        subKegiatans: {},
                        totals: { anggaran: 0, realisasi: 0, sisa: 0 }
                    };
                }

                // 4. Sub Kegiatan Level
                if (!tree[seksiKey].programs[programKey].kegiatans[kegiatanKey].subKegiatans[subKegiatanKey]) {
                    tree[seksiKey].programs[programKey].kegiatans[kegiatanKey].subKegiatans[subKegiatanKey] = {
                        id: subKegiatanKey,
                        nama: rek.subKegiatan.nama,
                        type: 'sub_kegiatan',
                        items: [],
                        totals: { anggaran: 0, realisasi: 0, sisa: 0 }
                    };
                }

                // 5. Item Level (Rekening)
                const realisasi = calculateTotalRealisasiUpToMonth(
                    transactionData.realisasi,
                    rek.id,
                    sumberDana,
                    periode
                );
                const sisa = anggaran - realisasi;

                const itemData = {
                    id: `${rek.id}_${sumberDana}`,
                    kode: rek.kode,
                    uraian: rek.uraian,
                    sumberDana,
                    anggaran,
                    realisasi,
                    sisa
                };

                // Add to leaf
                tree[seksiKey].programs[programKey].kegiatans[kegiatanKey].subKegiatans[subKegiatanKey].items.push(itemData);

                // Aggregate Totals Upwards
                const levels = [
                    tree[seksiKey],
                    tree[seksiKey].programs[programKey],
                    tree[seksiKey].programs[programKey].kegiatans[kegiatanKey],
                    tree[seksiKey].programs[programKey].kegiatans[kegiatanKey].subKegiatans[subKegiatanKey]
                ];

                levels.forEach(level => {
                    level.totals.anggaran += anggaran;
                    level.totals.realisasi += realisasi;
                    level.totals.sisa += sisa;
                });
            });
        });

        setHierarchy(tree);
        setIsLoading(false);
    };

    const bulanList = getAllBulan();

    if (isLoading) return <div>Loading report...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Laporan Realisasi Hierarkis</h2>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        className="input"
                        value={periode}
                        onChange={(e) => setPeriode(e.target.value)}
                    >
                        {bulanList.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                    <button className="btn btn-ghost">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Uraian</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Anggaran</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Realisasi</th>
                            <th style={{ textAlign: 'right', width: '150px' }}>Sisa Anggaran</th>
                            <th style={{ textAlign: 'right', width: '80px' }}>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(hierarchy).map(seksi => (
                            <NodeRow
                                key={seksi.id}
                                node={seksi}
                                level={0}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NodeRow = ({ node, level, expandedNodes, toggleNode }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.programs || node.kegiatans || node.subKegiatans || (node.items && node.items.length > 0);

    // Determine children to render
    let children = [];
    if (node.programs) children = Object.values(node.programs);
    else if (node.kegiatans) children = Object.values(node.kegiatans);
    else if (node.subKegiatans) children = Object.values(node.subKegiatans);

    // Background colors for levels
    const bgColors = [
        'var(--color-bg-secondary)', // Seksi
        'hsla(220, 20%, 18%, 0.5)',  // Program
        'hsla(220, 20%, 16%, 0.3)',  // Kegiatan
        'hsla(220, 20%, 14%, 0.2)'   // Sub Kegiatan
    ];

    const paddingLeft = `${level * 1.5 + 0.5}rem`;
    const absorpsi = node.totals.anggaran > 0 ? (node.totals.realisasi / node.totals.anggaran) * 100 : 0;

    return (
        <>
            <tr
                onClick={() => hasChildren ? toggleNode(node.id) : null}
                style={{
                    background: bgColors[level] || 'transparent',
                    cursor: hasChildren ? 'pointer' : 'default',
                    fontWeight: level < 2 ? '600' : '500'
                }}
            >
                <td style={{ textAlign: 'center' }}>
                    {hasChildren && (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                </td>
                <td style={{ paddingLeft }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{node.nama}</span>
                        {level === 0 && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>SEKSI</span>}
                    </div>
                </td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(node.totals.anggaran)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(node.totals.realisasi)}</td>
                <td style={{ textAlign: 'right', color: node.totals.sisa < 0 ? 'var(--color-accent-error)' : 'var(--color-accent-success)' }}>
                    {formatCurrency(node.totals.sisa)}
                </td>
                <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    {absorpsi.toFixed(1)}%
                </td>
            </tr>

            {isExpanded && (
                <>
                    {children.map(child => (
                        <NodeRow
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                    {node.items && node.items.map(item => (
                        <ItemRow key={item.id} item={item} level={level + 1} />
                    ))}
                </>
            )}
        </>
    );
};

const ItemRow = ({ item, level }) => {
    const paddingLeft = `${level * 1.5 + 2.5}rem`; // Extra indent for items
    const absorpsi = item.anggaran > 0 ? (item.realisasi / item.anggaran) * 100 : 0;

    return (
        <tr style={{ background: 'var(--color-bg-primary)' }}>
            <td></td>
            <td style={{ paddingLeft, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-primary)' }}>{item.kode}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.uraian}</span>
                    <span className="badge badge-success" style={{ width: 'fit-content', fontSize: '0.6rem', marginTop: '0.2rem' }}>
                        {item.sumberDana}
                    </span>
                </div>
            </td>
            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(item.anggaran)}</td>
            <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{formatCurrency(item.realisasi)}</td>
            <td style={{ textAlign: 'right', fontSize: '0.85rem', color: item.sisa < 0 ? 'var(--color-accent-error)' : 'var(--color-accent-success)' }}>
                {formatCurrency(item.sisa)}
            </td>
            <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                {absorpsi.toFixed(1)}%
            </td>
        </tr>
    );
};

export default HierarchicalReport;
