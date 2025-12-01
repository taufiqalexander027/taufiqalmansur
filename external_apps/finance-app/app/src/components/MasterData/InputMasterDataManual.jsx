import React, { useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { getMasterData, saveMasterData } from '../../services/masterDataService';
import { SEKSI, createRekening } from '../../models/masterData';

const InputMasterDataManual = ({ onCancel, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        seksi: SEKSI.PENGEMBANGAN_PELATIHAN.id, // Default
        programKode: '',
        programNama: '',
        kegiatanKode: '',
        kegiatanNama: '',
        subKegiatanKode: '',
        subKegiatanNama: '',
        rekeningKode: '',
        rekeningUraian: '',
        anggaranPAD: '',
        anggaranDBHCHT: ''
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Validate required fields
            if (!formData.rekeningKode || !formData.rekeningUraian) {
                throw new Error('Kode Rekening dan Uraian wajib diisi');
            }

            const masterData = getMasterData();

            // Find selected seksi object
            const selectedSeksi = Object.values(SEKSI).find(s => s.id === formData.seksi);
            if (!selectedSeksi) throw new Error('Seksi tidak valid');

            // Construct IDs
            const programId = `PROG_${formData.programKode.replace(/[^a-zA-Z0-9]/g, '')}`;
            const kegiatanId = `KEG_${formData.kegiatanKode.replace(/[^a-zA-Z0-9]/g, '')}`;
            const subKegiatanId = `SUBKEG_${formData.subKegiatanKode.replace(/[^a-zA-Z0-9]/g, '')}`;

            // Create new rekening
            const newRek = createRekening({
                kode: formData.rekeningKode,
                uraian: formData.rekeningUraian,
                seksiId: selectedSeksi.id,
                sumberDana: [], // Will be populated based on anggaran
                programId: programId,
                programNama: formData.programNama || 'DEFAULT PROGRAM',
                kegiatanId: kegiatanId,
                kegiatanNama: formData.kegiatanNama || 'DEFAULT KEGIATAN',
                subKegiatanId: subKegiatanId,
                subKegiatanNama: formData.subKegiatanNama || 'DEFAULT SUB KEGIATAN',
                anggaranPAPBD: {}
            });

            // Add anggaran
            const pad = Number(formData.anggaranPAD.replace(/[^0-9]/g, ''));
            const dbhcht = Number(formData.anggaranDBHCHT.replace(/[^0-9]/g, ''));

            if (pad > 0) {
                newRek.sumberDana.push('PAD MURNI');
                newRek.anggaranPAPBD['PAD MURNI'] = pad;
            }
            if (dbhcht > 0) {
                newRek.sumberDana.push('DBHCHT');
                newRek.anggaranPAPBD['DBHCHT'] = dbhcht;
            }

            // Add to master data
            masterData.rekenings.push(newRek);

            // Ensure Seksi exists in masterData.seksi
            if (!masterData.seksi.find(s => s.id === selectedSeksi.id)) {
                masterData.seksi.push(selectedSeksi);
            }

            // Save
            saveMasterData(masterData);
            onSaveSuccess();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card" style={{ marginTop: '1rem', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Input Manual Master Data</h3>
                <button onClick={onCancel} className="p-1 hover:bg-gray-700 rounded">
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                {/* Seksi Selection */}
                <div>
                    <label className="block text-sm font-medium mb-1">Seksi</label>
                    <select
                        name="seksi"
                        value={formData.seksi}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    >
                        {Object.values(SEKSI).map(s => (
                            <option key={s.id} value={s.id}>{s.nama}</option>
                        ))}
                    </select>
                </div>

                {/* Program */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kode Program</label>
                        <input
                            type="text"
                            name="programKode"
                            value={formData.programKode}
                            onChange={handleChange}
                            placeholder="Contoh: 1.01"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Program</label>
                        <input
                            type="text"
                            name="programNama"
                            value={formData.programNama}
                            onChange={handleChange}
                            placeholder="Nama Program"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                </div>

                {/* Kegiatan */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kode Kegiatan</label>
                        <input
                            type="text"
                            name="kegiatanKode"
                            value={formData.kegiatanKode}
                            onChange={handleChange}
                            placeholder="Contoh: 1.01.01"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Kegiatan</label>
                        <input
                            type="text"
                            name="kegiatanNama"
                            value={formData.kegiatanNama}
                            onChange={handleChange}
                            placeholder="Nama Kegiatan"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                </div>

                {/* Sub Kegiatan */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kode Sub Kegiatan</label>
                        <input
                            type="text"
                            name="subKegiatanKode"
                            value={formData.subKegiatanKode}
                            onChange={handleChange}
                            placeholder="Contoh: 1.01.01.01"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Sub Kegiatan</label>
                        <input
                            type="text"
                            name="subKegiatanNama"
                            value={formData.subKegiatanNama}
                            onChange={handleChange}
                            placeholder="Nama Sub Kegiatan"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                </div>

                {/* Rekening */}
                <div className="grid grid-cols-1 gap-4 border-t border-gray-600 pt-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kode Rekening <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="rekeningKode"
                            value={formData.rekeningKode}
                            onChange={handleChange}
                            placeholder="Contoh: 5.1.02.01.01.0001"
                            required
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Uraian Rekening <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="rekeningUraian"
                            value={formData.rekeningUraian}
                            onChange={handleChange}
                            placeholder="Contoh: Belanja Alat Tulis Kantor"
                            required
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                </div>

                {/* Anggaran */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Anggaran PAD Murni</label>
                        <input
                            type="number"
                            name="anggaranPAD"
                            value={formData.anggaranPAD}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Anggaran DBHCHT</label>
                        <input
                            type="number"
                            name="anggaranDBHCHT"
                            value={formData.anggaranDBHCHT}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                    >
                        <Save size={18} />
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputMasterDataManual;
