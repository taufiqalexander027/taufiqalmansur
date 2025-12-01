import { Filter } from 'lucide-react';
import { getAllBulan, getBulanName } from '../utils/calculations';

const FilterPanel = ({ filters, onFilterChange, seksiList, sumberDanaList }) => {
    const bulanOptions = getAllBulan();

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Filter size={20} color="var(--color-accent-primary)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Filter Data</h2>
            </div>

            <div className="grid grid-cols-3">
                <div>
                    <label className="label" htmlFor="seksi">Seksi</label>
                    <select
                        id="seksi"
                        className="select"
                        value={filters.seksi}
                        onChange={(e) => onFilterChange({ ...filters, seksi: e.target.value })}
                    >
                        <option value="all">Semua Seksi</option>
                        {seksiList.map(seksi => (
                            <option key={seksi} value={seksi}>{seksi}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label" htmlFor="sumberDana">Sumber Dana</label>
                    <select
                        id="sumberDana"
                        className="select"
                        value={filters.sumberDana}
                        onChange={(e) => onFilterChange({ ...filters, sumberDana: e.target.value })}
                    >
                        <option value="all">Semua Sumber Dana</option>
                        {sumberDanaList.map(sumber => (
                            <option key={sumber.id} value={sumber.id}>{sumber.nama}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label" htmlFor="periode">Periode (Sampai dengan)</label>
                    <select
                        id="periode"
                        className="select"
                        value={filters.periode}
                        onChange={(e) => onFilterChange({ ...filters, periode: e.target.value })}
                    >
                        {bulanOptions.map(bulan => (
                            <option key={bulan.value} value={bulan.label}>{bulan.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
