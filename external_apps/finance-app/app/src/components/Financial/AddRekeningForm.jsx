import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createFinancialRecord, getFinancialData, saveFinancialData } from '../../models/financialData';

const AddRekeningForm = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        seksi: 'SEKSI PENGEMBANGAN',
        program: 'PROGRAM PENYULUHAN PERTANIAN',
        kegiatan: '',
        subKegiatan: '',
        kodeRekening: '',
        uraian: '',
        sumberDana: 'PAD MURNI'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newRecord = createFinancialRecord(formData);
        const currentData = getFinancialData();
        const updatedData = [...currentData, newRecord];
        saveFinancialData(updatedData);
        onSaveSuccess();
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', border: '1px solid #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>Tambah Rekening Baru</h3>
                <button onClick={onCancel} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label className="label">Seksi</label>
                    <select name="seksi" value={formData.seksi} onChange={handleChange} className="input input-bordered w-full">
                        <option value="SEKSI PENGEMBANGAN">SEKSI PENGEMBANGAN</option>
                        <option value="SEKSI PELATIHAN">SEKSI PELATIHAN</option>
                        <option value="SUB BAGIAN TATA USAHA">SUB BAGIAN TATA USAHA</option>
                    </select>
                </div>

                <div>
                    <label className="label">Program</label>
                    <input name="program" value={formData.program} onChange={handleChange} className="input input-bordered w-full" placeholder="Nama Program" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label">Kode Rekening</label>
                        <input name="kodeRekening" value={formData.kodeRekening} onChange={handleChange} className="input input-bordered w-full" placeholder="5.1.02..." required />
                    </div>
                    <div>
                        <label className="label">Sumber Dana</label>
                        <select name="sumberDana" value={formData.sumberDana} onChange={handleChange} className="input input-bordered w-full">
                            <option value="PAD MURNI">PAD MURNI</option>
                            <option value="DBHCHT">DBHCHT</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="label">Uraian</label>
                    <input name="uraian" value={formData.uraian} onChange={handleChange} className="input input-bordered w-full" placeholder="Uraian Belanja..." required />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Tambah Data
                </button>
            </form>
        </div>
    );
};

export default AddRekeningForm;
