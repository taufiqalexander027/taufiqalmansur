# Panduan Penggunaan Aplikasi Realisasi Keuangan

## 1. Persiapan Awal (Hanya sekali)
Sebelum menjalankan aplikasi, pastikan komputer Anda sudah terinstall **Node.js**.
Jika belum, download dan install dari: https://nodejs.org/

## 2. Cara Menjalankan Aplikasi
1.  Buka folder aplikasi ini di Terminal / Command Prompt.
2.  Ketik perintah berikut untuk menginstall pendukung aplikasi (hanya perlu dilakukan jika baru pertama kali atau folder `node_modules` tidak ada):
    ```bash
    npm install
    ```
3.  Jalankan aplikasi dengan perintah:
    ```bash
    npm run dev
    ```
4.  Akan muncul link (biasanya `http://localhost:5173`). Buka link tersebut di browser (Chrome/Edge).

## 3. Fitur Utama

### A. Import Data Excel
- Klik tombol **"Import Excel"** (warna putih).
- Pilih file Excel standar Anda.
- Aplikasi akan otomatis membaca data, termasuk membetulkan nama seksi (misal "SUB BAGIN" menjadi "SUB BAGIAN").

### B. Input Manual
- Anda bisa mengedit angka **Anggaran** dan **Realisasi** langsung di tabel.
- Angka akan otomatis diformat dengan pemisah ribuan.
- Data otomatis tersimpan di browser (Local Storage), jadi tidak hilang saat di-refresh.
- Klik tombol **"Simpan"** (warna biru) untuk memastikan penyimpanan.

### C. Filter & Tampilan
- **Unit Kerja / Seksi**: Pilih "UPT PELATIHAN PERTANIAN (GABUNGAN)" untuk melihat total gabungan, atau pilih seksi spesifik.
- **Program**: Filter berdasarkan program kegiatan.
- **Sumber Dana**: Filter berdasarkan sumber dana (PAD Murni, DBHCHT, dll).
- **Periode Bulan**: Pilih bulan tertentu untuk melihat data sampai dengan bulan tersebut (Kumulatif).

### D. Rekapitulasi (Laporan)
- Klik tombol **"Rekapitulasi"** (warna ungu).
- Di layar ini Anda bisa membuat laporan narasi otomatis.
- Sesuaikan filter **Seksi**, **Bulan**, dan **Sumber Dana** di dalam layar ini.
- Klik **"Salin Teks"** untuk meng-copy laporan narasi ke dokumen lain.
- Grafik visualisasi juga tersedia untuk di-screenshot atau dilihat.

## 4. Tips
- Jika aplikasi terasa berat atau error, coba refresh halaman browser.
- Pastikan file Excel yang diimport sesuai format standar.
