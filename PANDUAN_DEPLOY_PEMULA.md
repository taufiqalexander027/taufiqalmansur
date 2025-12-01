# 🚀 Panduan Deploy ke Hostinger (Versi Pemula)

Halo! Jangan khawatir, kita akan lakukan ini pelan-pelan. Anggap saja kita sedang memindahkan file tugas dari laptop kamu ke komputer sekolah (internet) biar bisa dilihat semua orang.

Kita butuh 3 hal utama:
1.  **GitHub**: Tempat menyimpan file codingan kita di internet (seperti Google Drive khusus coding).
2.  **Hostinger**: "Rumah" untuk website kita biar bisa diakses 24 jam.
3.  **Database**: "Buku catatan" untuk menyimpan data user, berita, dll.

Yuk mulai!

---

## BAGIAN 1: Upload ke GitHub (Gudang File)

Kita harus taruh file codinganmu ke GitHub dulu.

1.  **Buka Website GitHub**
    *   Buka [github.com](https://github.com/).
    *   Daftar akun (Sign Up) kalau belum punya. Gratis kok!

2.  **Buat "Repository" Baru**
    *   Cari tombol **+** di pojok kanan atas, pilih **New repository**.
    *   **Repository name**: Isi dengan `taufiqalmansur`.
    *   Pilih **Public** (biar gampang) atau **Private**.
    *   **JANGAN** centang "Add a README file".
    *   Klik tombol hijau **Create repository**.

3.  **Upload Codingan Kamu**
    *   Setelah klik create, kamu akan lihat halaman penuh kode. Jangan bingung!
    *   Lihat bagian **"…or push an existing repository from the command line"**.
    *   Copy baris kode yang mirip ini (tapi pakai username kamu):
        ```bash
        git remote add origin https://github.com/USERNAME-KAMU/taufiqalmansur.git
        git branch -M main
        git push -u origin main
        ```
    *   **Kembali ke VS Code** (aplikasi tempat kita coding ini).
    *   Buka **Terminal** (biasanya di bawah).
    *   Paste kode tadi di sana dan tekan **Enter**.
    *   Kalau diminta login, ikuti saja petunjuknya di browser.

✅ **Selesai!** File kamu sekarang aman di GitHub.

---

## BAGIAN 2: Siapkan "Rumah" di Hostinger

Sekarang kita login ke Hostinger.

1.  **Login ke Hostinger**
2.  Klik tombol **Manage** di hosting kamu.

### Langkah A: Buat Database (Buku Catatan)

1.  Cari menu **Databases** (biasanya icon tabung). Pilih **Management**.
2.  Di bagian "Create New MySQL Database":
    *   **Database Name**: Ketik `portal`. (Nanti jadinya `u12345_portal`).
    *   **Username**: Ketik `admin`. (Nanti jadinya `u12345_admin`).
    *   **Password**: Buat password yang susah, misal `PortalHebat2025!`. **CATAT PASSWORD INI!**
3.  Klik **Create**.

**PENTING:** Setelah jadi, lihat di bawah. Ada tulisan **Enter phpMyAdmin**. Klik itu!
*   Pilih tab **Import**.
*   Klik **Choose File**.
*   Cari file di laptopmu: folder `backend/database/master_setup.sql` (atau import satu-satu file .sql yang ada di folder database).
*   Klik **Go** (atau Kirim).
*   *Nah, database sudah siap!*

### Langkah B: Siapkan Node.js (Mesin Website)

1.  Kembali ke menu utama Hostinger. Cari menu **Advanced**, pilih **Node.js**.
2.  Klik **Create Application** (atau Add New).
3.  Isi formulirnya:
    *   **Node.js Version**: Pilih **v18** atau **v20** (yang terbaru).
    *   **Application Mode**: Pilih **Production**.
    *   **Application Root**: Ketik `taufiqalmansur`.
    *   **Application URL**: Biarkan default (domain kamu).
    *   **Application Startup File**: Ketik `backend/server.js`.
4.  Klik **Create**.

---

## BAGIAN 3: Masukkan File ke Hostinger

Sekarang kita ambil file dari GitHub ke Hostinger.

1.  Di halaman Node.js tadi, lihat bagian atas ada tombol **Terminal** (atau cari menu "Terminal" di Advanced). Klik itu.
2.  Kamu akan melihat layar hitam (seperti hacker!). Ketik perintah ini satu per satu:

    **Masuk ke folder website:**
    ```bash
    cd domains/NAMADOMAIN.COM/public_html
    ```
    *(Ganti NAMADOMAIN.COM dengan nama web kamu)*

    **Ambil file dari GitHub:**
    ```bash
    git clone https://github.com/USERNAME-KAMU/taufiqalmansur.git
    ```
    *(Ganti USERNAME-KAMU dengan username GitHub kamu)*

    **Masuk ke folder project:**
    ```bash
    cd taufiqalmansur
    ```

    **Install "bahan-bahan" (Backend):**
    ```bash
    cd backend
    npm install
    ```

    **Install "bahan-bahan" (Frontend):**
    ```bash
    cd ..
    npm install
    npm run build
    ```

---

## BAGIAN 4: Mengatur Kunci Rahasia (.env)

Ini langkah terakhir yang paling penting! Kita harus kasih tahu website kamu password database tadi.

1.  Buka **File Manager** di Hostinger (Menu Files > File Manager).
2.  Masuk ke folder: `domains` > `namadomain` > `public_html` > `taufiqalmansur` > `backend`.
3.  Klik kanan di area kosong, pilih **New File**.
4.  Beri nama `.env` (jangan lupa titik di depan!).
5.  Klik kanan file `.env` itu, pilih **Edit**.
6.  Paste tulisan ini (GANTI YANG SAYA TULIS HURUF BESAR):

    ```env
    PORT=3000
    NODE_ENV=production
    
    # Ini data dari Langkah A tadi
    DB_HOST=localhost
    DB_USER=u12345_admin      <-- Cek nama user database di Hostinger
    DB_PASSWORD=PortalHebat2025!  <-- Password yang kamu buat tadi
    DB_NAME=u12345_portal     <-- Cek nama database di Hostinger
    DB_PORT=3306
    
    JWT_SECRET=rahasia_banget_jangan_bilang_siapa_siapa
    
    # Ganti dengan nama domain kamu
    FRONTEND_URL=https://NAMADOMAIN.COM
    ```
7.  Klik **Save**.

---

## BAGIAN 5: Nyalakan Mesin! 🚀

1.  Kembali ke menu **Node.js** di Hostinger.
2.  Klik tombol **Restart** (atau Start).
3.  Tunggu sebentar...

**Satu langkah kecil lagi untuk Frontend:**
1.  Buka **File Manager** lagi.
2.  Masuk ke `taufiqalmansur` > `dist`.
3.  Select semua file di sana (Ctrl+A), klik kanan **Move**.
4.  Pindahkan ke folder `public_html` (folder utama website kamu).
5.  Klik **Move**.

**SELESAI!** 🎉
Coba buka website kamu di browser. Harusnya sudah muncul!

---

### Kalau Bingung / Error:
*   **Website putih doang?** Cek apakah file dari folder `dist` sudah dipindah ke `public_html`.
*   **Gak bisa login?** Cek file `.env` tadi, pastikan password database benar.

Semangat! Kamu pasti bisa! 💪
