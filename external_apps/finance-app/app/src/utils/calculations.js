/**
 * Calculation and filtering utilities
 */

const BULAN_ORDER = [
    'januari', 'februari', 'maret', 'april', 'mei', 'juni',
    'juli', 'agustus', 'september', 'oktober', 'november'
];

/**
 * Filter data by seksi, sumber dana, and periode
 */
export const filterData = (data, filters) => {
    const { seksi, sumberDana, periode } = filters;

    let filtered = [...data];

    // Filter by seksi
    if (seksi && seksi !== 'all') {
        filtered = filtered.filter(sumber => sumber.seksi === seksi);
    }

    // Filter by sumber dana
    if (sumberDana && sumberDana !== 'all') {
        filtered = filtered.filter(sumber => sumber.id === sumberDana);
    }

    return filtered;
};

/**
 * Calculate total REALISASI sampai periode tertentu
 */
export const calculateTotalRealisasi = (data, periode) => {
    if (!data || data.length === 0) return 0;

    const bulanIndex = BULAN_ORDER.indexOf(periode.toLowerCase());
    if (bulanIndex === -1) return 0;

    const bulanList = BULAN_ORDER.slice(0, bulanIndex + 1);

    let total = 0;

    data.forEach(sumber => {
        sumber.items.forEach(item => {
            bulanList.forEach(bulan => {
                total += item.realisasi[bulan] || 0;
            });
        });
    });

    return total;
};

/**
 * Calculate total DKKB sampai periode tertentu
 */
export const calculateTotalDKKB = (data, periode) => {
    if (!data || data.length === 0) return 0;

    const bulanIndex = BULAN_ORDER.indexOf(periode.toLowerCase());
    if (bulanIndex === -1) return 0;

    const bulanList = BULAN_ORDER.slice(0, bulanIndex + 1);

    let total = 0;

    data.forEach(sumber => {
        sumber.items.forEach(item => {
            bulanList.forEach(bulan => {
                total += item.dkkb[bulan] || 0;
            });
        });
    });

    return total;
};

/**
 * Calculate total PAPBD anggaran
 */
export const calculateTotalAnggaran = (data) => {
    if (!data || data.length === 0) return 0;

    let total = 0;

    data.forEach(sumber => {
        sumber.items.forEach(item => {
            total += item.anggaranPAPBD || 0;
        });
    });

    return total;
};

/**
 * Calculate variance percentage
 */
export const calculateVariance = (dkkb, realisasi) => {
    if (dkkb === 0) return 0;
    return ((realisasi - dkkb) / dkkb) * 100;
};

/**
 * Format number to IDR currency
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Get bulan name in Indonesian
 */
export const getBulanName = (bulan) => {
    const names = {
        januari: 'Januari',
        februari: 'Februari',
        maret: 'Maret',
        april: 'April',
        mei: 'Mei',
        juni: 'Juni',
        juli: 'Juli',
        agustus: 'Agustus',
        september: 'September',
        oktober: 'Oktober',
        november: 'November'
    };
    return names[bulan.toLowerCase()] || bulan;
};

/**
 * Get all bulan names
 */
export const getAllBulan = () => {
    return BULAN_ORDER.map(bulan => ({
        value: bulan,
        label: getBulanName(bulan)
    }));
};

/**
 * Get detailed breakdown by item for report
 */
export const getDetailedBreakdown = (data, periode) => {
    const bulanIndex = BULAN_ORDER.indexOf(periode.toLowerCase());
    if (bulanIndex === -1) return [];

    const bulanList = BULAN_ORDER.slice(0, bulanIndex + 1);
    const breakdown = [];

    data.forEach(sumber => {
        sumber.items.forEach(item => {
            let totalDKKB = 0;
            let totalRealisasi = 0;

            bulanList.forEach(bulan => {
                totalDKKB += item.dkkb[bulan] || 0;
                totalRealisasi += item.realisasi[bulan] || 0;
            });

            if (totalRealisasi > 0 || totalDKKB > 0) {
                breakdown.push({
                    sumberAnggaran: sumber.nama,
                    seksi: sumber.seksi,
                    kodeRekening: item.kodeRekening,
                    uraian: item.uraian,
                    kegiatan: item.kegiatan,
                    subKegiatan: item.subKegiatan,
                    anggaran: item.anggaranPAPBD,
                    totalDKKB,
                    totalRealisasi,
                    variance: totalRealisasi - totalDKKB,
                    variancePercent: calculateVariance(totalDKKB, totalRealisasi)
                });
            }
        });
    });

    return breakdown;
};
