import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, ChevronDown, ChevronUp, Save, Edit2 } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../services/apiService';

interface UserProfileFormProps {
  onProfileUpdate: (profile: UserProfile) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onProfileUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    nama: '',
    nip: '',
    pangkat: '',
    golongan: '',
    jabatan: '',
    unitKerja: '',
    kota: 'Malang' // Default changed to Malang
  });

  useEffect(() => {
    const loadProfile = async () => {
      const saved = await getUserProfile();
      // If saved data doesn't have kota, default to Malang
      if (!saved.kota) saved.kota = 'Malang';

      setProfile(saved);
      onProfileUpdate(saved);
      // Auto open if empty
      if (!saved.nama) setIsOpen(true);
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await saveUserProfile(profile);
    onProfileUpdate(profile);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 mb-6 overflow-hidden no-print">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-900"
      >
        <div className="flex items-center gap-2 font-bold">
          <User size={20} />
          Identitas Pegawai (Untuk Header Laporan)
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={profile.nama}
                onChange={handleChange}
                placeholder="Nama Lengkap beserta gelar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">NIP</label>
              <input
                type="text"
                name="nip"
                value={profile.nip || ''}
                onChange={handleChange}
                placeholder="Nomor Induk Pegawai"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pangkat / Golongan</label>
              <input
                type="text"
                name="pangkat"
                value={profile.pangkat || ''}
                onChange={handleChange}
                placeholder="Contoh: IV/a - Pembina"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan</label>
              <input
                type="text"
                name="jabatan"
                value={profile.jabatan}
                onChange={handleChange}
                placeholder="Contoh: Kepala Seksi Pengembangan Pertanian"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Kerja / Instansi</label>
              <input
                type="text"
                name="unitKerja"
                value={profile.unitKerja}
                onChange={handleChange}
                placeholder="Contoh: UPT PELATIHAN PERTANIAN PROVINSI JAWA TIMUR"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>

            {/* Added City Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kota (Tempat Tanda Tangan)</label>
              <input
                type="text"
                name="kota"
                value={profile.kota || ''}
                onChange={handleChange}
                placeholder="Contoh: Malang"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
            >
              <Save size={18} /> Simpan Identitas
            </button>
          </div>
        </div>
      )}

      {!isOpen && profile.nama && (
        <div className="px-4 py-3 text-xs text-gray-600 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:gap-4 md:items-center gap-1">
            <span className="flex items-center gap-1">
              <User size={12} className="text-gray-400" />
              <strong>{profile.nama}</strong>
            </span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="truncate max-w-[200px] md:max-w-md uppercase opacity-80">
              {profile.unitKerja}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold bg-white px-3 py-1 rounded border border-blue-200 hover:border-blue-400 transition-all shadow-sm"
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
      )}
    </div>
  );
};