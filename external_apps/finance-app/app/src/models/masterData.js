/**
 * Master Data Model
 * Struktur data untuk Seksi, Program, Kegiatan, Sub Kegiatan, dan Rekening
 */

export const SEKSI = {
    PENGEMBANGAN_PELATIHAN: {
        id: 'SEKSI_PENGEMBANGAN',
        nama: 'SEKSI PENGEMBANGAN',
        kode: 'BANGLAT'
    },
    PELATIHAN: {
        id: 'SEKSI_PELATIHAN',
        nama: 'SEKSI PELATIHAN',
        kode: 'LATIHAN'
    },
    TATA_USAHA: {
        id: 'SUB_BAGIAN_TATA_USAHA',
        nama: 'SUB BAGIAN TATA USAHA',
        kode: 'SUBAG_TU'
    }
};

export const SUMBER_DANA = {
    PAD: 'PAD MURNI',
    DBHCHT: 'DBHCHT'
};

export const BULAN = [
    'januari', 'februari', 'maret', 'april', 'mei', 'juni',
    'juli', 'agustus', 'september', 'oktober', 'november'
];

/**
 * Create master data structure
 */
export const createMasterData = () => ({
    tahun: 2025,
    seksi: [],
    programs: [],
    kegiatans: [],
    subKegiatans: [],
    rekenings: []
});

/**
 * Create rekening entry
 */
export const createRekening = ({
    kode,
    uraian,
    seksiId,
    sumberDana = [],
    programId,
    programNama,
    kegiatanId,
    kegiatanNama,
    subKegiatanId,
    subKegiatanNama,
    anggaranPAPBD = {},
    sheetName = '' // Add sheetName parameter
}) => ({
    id: `${seksiId}_REK_${kode.replace(/\./g, '_')}`, // Include seksiId for uniqueness
    kode,
    uraian,
    seksiId,
    sumberDana, // ['PAD', 'DBHCHT']
    program: {
        id: programId,
        nama: programNama
    },
    kegiatan: {
        id: kegiatanId,
        nama: kegiatanNama
    },
    subKegiatan: {
        id: subKegiatanId,
        nama: subKegiatanNama
    },
    anggaranPAPBD, // { PAD: 1000000, DBHCHT: 2000000 }
    sheetName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

/**
 * Get total anggaran for rekening across all sumber dana
 */
export const getTotalAnggaranRekening = (rekening) => {
    if (!rekening.anggaranPAPBD) return 0;

    return Object.values(rekening.anggaranPAPBD).reduce((sum, val) => sum + (val || 0), 0);
};

/**
 * Get anggaran for specific sumber dana
 */
export const getAnggaranBySumber = (rekening, sumberDana) => {
    if (!rekening.anggaranPAPBD) return 0;
    return rekening.anggaranPAPBD[sumberDana] || 0;
};
