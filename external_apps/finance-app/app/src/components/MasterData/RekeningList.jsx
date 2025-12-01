import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

const RekeningList = ({ rekenings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeksi, setFilterSeksi] = useState('ALL');

    const filteredRekening = useMemo(() => {
        return rekenings.filter(rek => {
            const matchSearch =
                rek.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rek.uraian.toLowerCase().includes(searchTerm.toLowerCase());

            const matchSeksi = filterSeksi === 'ALL' || rek.seksiId === filterSeksi;

            return matchSearch && matchSeksi;
        });
    }, [rekenings, searchTerm, filterSeksi]);

    // Get unique seksi for filter
    const seksiList = useMemo(() => {
        const unique = new Set(rekenings.map(r => r.seksiId));
        return Array.from(unique);
    }, [rekenings]);

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Cari kode rekening atau uraian..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                    />
                </div>

                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <select
                        value={filterSeksi}
                        onChange={(e) => setFilterSeksi(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                    >
                        <option value="ALL">Semua Seksi</option>
                        {seksiList.map(seksi => (
                            <option key={seksi} value={seksi}>{seksi.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Kode Rekening</th>
                            <th>Uraian</th>
                            <th>Seksi</th>
                            <th>Sumber Dana</th>
                            <th style={{ textAlign: 'right' }}>Anggaran PAPBD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRekening.map(rek => (
                            <tr key={rek.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{rek.kode}</td>
                                <td>
                                    <div>{rek.uraian}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                        {rek.kegiatan.nama}
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                        {rek.seksiId.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                        {rek.sumberDana.map(sd => (
                                            <span key={sd} className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                                {sd}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                    {Object.entries(rek.anggaranPAPBD).map(([sd, val]) => (
                                        <div key={sd}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>{sd}:</span>
                                            {formatCurrency(val)}
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        {filteredRekening.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    Tidak ada data rekening ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Menampilkan {filteredRekening.length} dari {rekenings.length} rekening
            </div>
        </div>
    );
};

export default RekeningList;
