# 📊 Aplikasi Realisasi Keuangan

Sistem manajemen dan pelaporan keuangan untuk UPT Pelatihan Pertanian dengan fitur lengkap termasuk laporan DKKB, Kwitansi, dan Surat Pengantar.

## 🚀 Cara Menjalankan Aplikasi

### 1. Buka Terminal/Command Prompt
```bash
cd "/Users/taura/Documents/ANTIGRAVITY/antigravity/aplikasi realisasi keuangan/app"
```

### 2. Jalankan Aplikasi
```bash
npm run dev -- --host
```

### 3. Akses Aplikasi
- **Di Laptop/Komputer**: Buka browser → `http://localhost:3001`
- **Di HP (jaringan sama)**: Lihat URL di terminal → contoh: `http://192.168.1.9:3001`

## 📱 Akses dari HP/Perangkat Lain

1. Pastikan HP dan laptop **terhubung ke WiFi yang sama**
2. Lihat **Network URL** di terminal setelah menjalankan `npm run dev -- --host`
3. Buka URL tersebut di browser HP

**Catatan:** Data di HP dan laptop **terpisah** (localStorage). Untuk sinkronisasi, gunakan fitur **Import Excel** di kedua perangkat.

## ✨ Fitur Utama

### 1. **Manajemen Data Keuangan**
- Input Anggaran PAPBD per kode rekening
- Input Realisasi bulanan (Jan-Des)
- Perhitungan otomatis: Sisa Anggaran, Total Realisasi, Persentase

### 2. **Multi-View**
- **View Gabungan UPT**: Lihat semua data Penyuluhan + Penunjang
- **View Per Seksi**: Filter berdasarkan seksi tertentu
- **Filter Program & Sumber Dana**
- **Multi-Select Bulan** (maksimal 3 bulan)

### 3. **Laporan PDF**
#### 📄 Kwitansi (Portrait A4)
- Generate kwitansi per bulan
- Terbilang otomatis
- Download PDF langsung

#### 📄 Surat Pengantar (Portrait A4)
- Surat pengantar laporan bulanan
- Header resmi dengan logo
- Format profesional

#### 📄 DKKB (Landscape A4)
- Laporan DKKB per Triwulan
- Pilih Program: Penyuluhan/Penunjang
- Pilih Sumber Dana
- Header berulang di setiap halaman
- Pagination otomatis

### 4. **Copy-Paste dari Excel**
- Paste single cell dengan format ribuan (32.800.000)
- Paste multi-row vertikal (copy 5-10 cell dari Excel → paste langsung)
- Support formula (=1000+500)

### 5. **Visualisasi**
- Chart interaktif Anggaran vs Realisasi
- Progress bar per bulan
- Summary statistik

### 6. **Import/Export**
- Import data dari Excel
- Auto-save ke localStorage
- Data persisten

## 📂 Struktur Folder

```
app/
├── src/
│   ├── components/
│   │   ├── Financial/
│   │   │   ├── FinancialTable.jsx    # Tabel utama + kontrol
│   │   │   ├── FinancialChart.jsx    # Grafik visualisasi
│   │   │   ├── CurrencyInput.jsx     # Input angka + paste
│   │   │   ├── DKKBReport.jsx        # Laporan DKKB
│   │   │   ├── ReceiptReport.jsx     # Kwitansi
│   │   │   └── SuratPengantar.jsx    # Surat Pengantar
│   ├── models/
│   │   └── financialData.js          # Data & localStorage management
│   ├── services/
│   │   └── excelParser.js            # Excel import logic
│   └── App.jsx                       # Main app component
├── public/
│   └── kop_surat.png                 # Logo/header surat
├── package.json                       # Dependencies
└── README.md                          # Dokumentasi ini
```

## 🔧 Troubleshooting

### Aplikasi tidak jalan?
```bash
# Install dependencies dulu
npm install

# Lalu jalankan
npm run dev -- --host
```

### HP tidak bisa akses?
1. Cek laptop dan HP di WiFi yang **sama**
2. Cek firewall laptop tidak memblokir port 5173
3. Gunakan Network URL dari terminal (bukan localhost)

### Data hilang?
- Data disimpan di **localStorage browser**
- Kalau clear cache/data browser, data akan hilang
- **Backup**: Export ke Excel atau screenshot tabel

### Error saat import Excel?
- Pastikan format Excel sesuai template
- Kolom harus: Kode Rekening, Uraian, Program, Sumber Dana, Sub Kegiatan, dll
- Lihat contoh file Excel yang sudah berhasil di-import

## 💡 Tips Penggunaan

1. **Backup Rutin**: Screenshot tabel atau export ke Excel secara berkala
2. **Multi-Device**: Import Excel yang sama di semua perangkat untuk data konsisten
3. **Keyboard Navigation**: Gunakan arrow keys untuk navigasi antar cell
4. **Copy-Paste**: Copy langsung dari Excel untuk input cepat
5. **Print Preview**: Selalu preview sebelum download PDF

## 🎨 Keyboard Shortcuts

- `Enter` / `↓` : Pindah ke baris bawah
- `↑` : Pindah ke baris atas
- `→` : Pindah ke kolom kanan
- `←` : Pindah ke kolom kiri
- `Ctrl+V` : Paste (support multi-row)
- `Ctrl+C` : Copy

## 📞 Catatan Teknis

- **Framework**: React + Vite
- **Styling**: TailwindCSS + DaisyUI
- **PDF Generation**: jsPDF + html2canvas
- **Storage**: localStorage (per-device)
- **Port**: 3001 (configured in vite.config.js)

---

**Dibuat oleh:** Taufiq Al Mansur  
**Last Updated:** November 2025  
**Version:** 1.0.0
