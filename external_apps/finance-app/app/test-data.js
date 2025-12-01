// Test script to load sample data for testing without file upload
// Open browser console and run this script

const testData = [
    {
        id: "DBHCHT_SEKSI_PENGEMBANGAN_PELATIHAN",
        nama: "DBHCHT SEKSI PENGEMBANGAN PELATIHAN",
        seksi: "SEKSI PENGEMBANGAN PELATIHAN",
        program: "( 3.27.07 ) Program Penyuluhan Pertanian",
        items: [
            {
                no: 1,
                kodeRekening: "5.1.02.01.01.0008",
                uraian: "Belanja Bahan-Bahan/Bibit Tanaman",
                kegiatan: "3.27.07.1.02 Pengembangan Penerapan Penyuluhan Pertanian",
                subKegiatan: "3.27.07.1.02.02 Pelaksanaan Penyuluhan dan Pemberdayaan Petani",
                anggaranSebelumEfisiensi: 99493946,
                anggaranSetelahEfisiensi: 172199326,
                anggaranPAPBD: 165718526,
                dkkb: {
                    januari: 0,
                    februari: 17800000,
                    maret: 0,
                    april: 0,
                    mei: 0,
                    juni: 68792500,
                    juli: 36030000,
                    agustus: 12800000,
                    september: 9000000,
                    oktober: 6000000,
                    november: 52131041
                },
                realisasi: {
                    januari: 0,
                    februari: 17779980,
                    maret: 0,
                    april: 0,
                    mei: 0,
                    juni: 38493330,
                    juli: 35610000,
                    agustus: 9704175,
                    september: 9000000,
                    oktober: 3000000,
                    november: 41205000
                }
            },
            {
                no: 4,
                kodeRekening: "5.1.02.01.01.0024",
                uraian: "Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor",
                kegiatan: "3.27.07.1.02 Pengembangan Penerapan Penyuluhan Pertanian",
                subKegiatan: "3.27.07.1.02.02 Pelaksanaan Penyuluhan dan Pemberdayaan Petani",
                anggaranSebelumEfisiensi: 13714300,
                anggaranSetelahEfisiensi: 44965200,
                anggaranPAPBD: 43000200,
                dkkb: {
                    januari: 0,
                    februari: 3842800,
                    maret: 0,
                    april: 2505000,
                    mei: 2400000,
                    juni: 9623400,
                    juli: 9511200,
                    agustus: 976000,
                    september: 5134400,
                    oktober: 7072800,
                    november: 15500000
                },
                realisasi: {
                    januari: 0,
                    februari: 0,
                    maret: 0,
                    april: 1995000,
                    mei: 2400000,
                    juni: 1912500,
                    juli: 9238000,
                    agustus: 966000,
                    september: 5248000,
                    oktober: 5534000,
                    november: 4500000
                }
            }
        ]
    },
    {
        id: "DBHCHT_SEKSI_PELATIHAN",
        nama: "DBHCHT SEKSI PELATIHAN",
        seksi: "SEKSI PELATIHAN",
        program: "( 3.27.07 ) Program Penyuluhan Pertanian",
        items: [
            {
                no: 1,
                kodeRekening: "5.1.02.02.01.0003",
                uraian: "Honorarium Narasumber atau Pembahas, Moderator, Pembawa Acara, dan Panitia",
                kegiatan: "3.27.07.1.02 Pengembangan Penerapan Penyuluhan Pertanian",
                subKegiatan: "3.27.07.1.02.03 Pelatihan Pertanian",
                anggaranSebelumEfisiensi: 91600000,
                anggaranSetelahEfisiensi: 60500000,
                anggaranPAPBD: 63200000,
                dkkb: {
                    januari: 0,
                    februari: 30000000,
                    maret: 12150000,
                    april: 0,
                    mei: 0,
                    juni: 14600000,
                    juli: 12600000,
                    agustus: 0,
                    september: 3600000,
                    oktober: 5400000,
                    november: 8550000
                },
                realisasi: {
                    januari: 0,
                    februari: 15400000,
                    maret: 0,
                    april: 27200000,
                    mei: 4500000,
                    juni: 0,
                    juli: 19100000,
                    agustus: 15300000,
                    september: 15175000,
                    oktober: 1800000,
                    november: 3600000
                }
            }
        ]
    },
    {
        id: "PAD_MURNI_SEKSI_BANGLAT",
        nama: "PAD MURNI SEKSI BANGLAT",
        seksi: "SEKSI BANGLAT",
        program: "( 3.27.07 ) Program Penyuluhan Pertanian",
        items: [
            {
                no: 1,
                kodeRekening: "5.1.02.01.01.0035",
                uraian: "Belanja Alat/Bahan untuk Kegiatan Kantor- Suvenir/Cendera Mata",
                kegiatan: "3.27.07.1.02 Pengembangan Penerapan Penyuluhan Pertanian",
                subKegiatan: "3.27.07.1.02.04 Bangunan Latihan",
                anggaranSebelumEfisiensi: 89887180,
                anggaranSetelahEfisiensi: 289954200,
                anggaranPAPBD: 263698200,
                dkkb: {
                    januari: 0,
                    februari: 19027500,
                    maret: 33457200,
                    april: 0,
                    mei: 0,
                    juni: 88214700,
                    juli: 35616000,
                    agustus: 17808000,
                    september: 35616000,
                    oktober: 35616000,
                    november: 32928975
                },
                realisasi: {
                    januari: 0,
                    februari: 19022625,
                    maret: 33916200,
                    april: 0,
                    mei: 0,
                    juni: 87737400,
                    juli: 35431200,
                    agustus: 17715600,
                    september: 35431200,
                    oktober: 35431200,
                    november: 31635000
                }
            }
        ]
    }
];

// Save to localStorage
localStorage.setItem('realisasi_keuangan_data', JSON.stringify(testData));
console.log('Test data loaded successfully!');
console.log('Total sumber anggaran:', testData.length);
console.log('Reload the page to see the data.');
