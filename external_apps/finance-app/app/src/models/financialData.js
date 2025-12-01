/**
 * Financial Data Model
 * Stores manual input for the financial realization table.
 */

export const MONTHS = [
    { key: 'jan', label: 'Januari' },
    { key: 'feb', label: 'Februari' },
    { key: 'mar', label: 'Maret' },
    { key: 'apr', label: 'April' },
    { key: 'mei', label: 'Mei' },
    { key: 'jun', label: 'Juni' },
    { key: 'jul', label: 'Juli' },
    { key: 'aug', label: 'Agustus' },
    { key: 'sep', label: 'September' },
    { key: 'okt', label: 'Oktober' },
    { key: 'nov', label: 'November' },
    { key: 'des', label: 'Desember' }
];

export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const createFinancialRecord = ({
    seksi = '',
    program = '',
    kegiatan = '',
    subKegiatan = '',
    kodeRekening = '',
    uraian = '',
    sumberDana = 'PAD MURNI'
}) => {
    const record = {
        id: generateUUID(),
        seksi,
        program,
        kegiatan,
        subKegiatan,
        kodeRekening,
        uraian,
        sumberDana,
        anggaran: {
            sebelum: 0,
            setelah: 0,
            papbd: 0
        },
        realisasi: {}
    };

    // Initialize months
    MONTHS.forEach(m => {
        record.realisasi[m.key] = { dkkb: 0, realisasi: 0 };
    });

    return record;
};

// Storage Key
const STORAGE_KEY = 'financial_system_data';

export const getFinancialData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveFinancialData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('✅ Financial data saved successfully to localStorage');
    console.log('   Total records:', data.length);
};
