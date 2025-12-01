# 🚀 Panduan Mengganti WordPress dengan Premium News App

Panduan lengkap untuk menghapus WordPress dan mengupload Premium News App ke Hostinger dengan deployment hybrid (Frontend di Hostinger + Backend di Railway).

---

## ⚠️ LANGKAH 0: BACKUP DULU! (WAJIB!)

> [!CAUTION]
> **Jangan skip langkah ini!** Backup adalah insurance Anda jika ada yang salah.

### Cara Backup WordPress di Hostinger:

1. **Login ke Hostinger** → Klik **"Website"** → Pilih **uptpelatihanpertanian.id**
2. Klik **"Dashboard"** 
3. Cari menu **"Backups"** atau **"WordPress Backups"**
4. Klik **"Create Backup"** atau **"Download Backup"**
5. Tunggu sampai backup selesai, lalu **download** ke komputer Anda
6. Simpan file backup dengan nama seperti: `wordpress-backup-2024-12-01.zip`

**Alternative jika tidak ada menu Backups:**
1. Buka **File Manager** di cPanel Hostinger
2. Buka folder **public_html**
3. Select semua file, klik **"Compress"** → Create ZIP
4. Download file ZIP tersebut

---

## 📦 LANGKAH 1: Build Frontend React

Kita akan build aplikasi React menjadi file HTML/CSS/JS static yang siap upload.

```bash
# Di terminal, pastikan Anda di folder premium-news-app
cd /Users/taura/.gemini/antigravity/scratch/premium-news-app

# Install dependencies jika belum
npm install

# Build untuk production
npm run build
```

Setelah selesai, akan muncul folder **`dist/`** yang berisi:
- `index.html`
- `assets/` (CSS, JS, images)

Ini adalah file yang akan kita upload ke Hostinger!

---

## 🚂 LANGKAH 2: Deploy Backend ke Railway (GRATIS!)

> [!TIP]
> Railway.app menyediakan hosting Node.js gratis dengan MySQL database included!

### 2.1 Create Railway Account

1. Buka https://railway.app
2. Klik **"Start a New Project"** atau **"Login with GitHub"**
3. Authorize Railway to access your GitHub

### 2.2 Deploy Backend dari GitHub

1. Di Railway dashboard, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: **taufiqalexander027/taufiqalmansur**
4. Railway akan auto-detect Node.js project

### 2.3 Configure Environment Variables

1. Klik project yang baru dibuat
2. Klik tab **"Variables"**
3. Add environment variables:

```bash
NODE_ENV=production
PORT=3001
DB_HOST=<Railway MySQL Host>
DB_USER=<Railway MySQL User>
DB_PASSWORD=<Railway MySQL Password>
DB_NAME=premium_news
JWT_SECRET=your-super-secret-jwt-key-here-12345
```

### 2.4 Setup MySQL Database

1. Di Railway project, klik **"New"** → **"Database"** → **"Add MySQL"**
2. Railway akan create database otomatis
3. Copy credentials (Host, User, Password) ke Environment Variables
4. Database akan auto-connect ke backend Anda

### 2.5 Get Backend URL

1. Klik **"Settings"** tab
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. Copy URL (contoh: `https://premium-news-production.up.railway.app`)
5. **SIMPAN URL INI** - kita butuh untuk frontend!

---

## 🗑️ LANGKAH 3: Hapus WordPress dari Hostinger

> [!WARNING]
> Pastikan backup sudah tersimpan sebelum lanjut!

### Via File Manager Hostinger:

1. **Login Hostinger** → **Website** → **uptpelatihanpertanian.id** → **Dashboard**
2. Klik **"File Manager"** (atau **"Advanced"** → **"File Manager"**)
3. Buka folder **`public_html`**
4. **Select ALL files** di dalam public_html:
   - Folder `wp-admin`
   - Folder `wp-content`
   - Folder `wp-includes`
   - File `index.php`
   - File `wp-config.php`
   - Dan semua file/folder lainnya
5. Klik **"Delete"** atau icon **trash**
6. Confirm deletion

Sekarang folder `public_html` Anda **KOSONG** dan siap untuk Premium News App! ✅

---

## 📤 LANGKAH 4: Upload Premium News App ke Hostinger

### 4.1 Update Frontend Config

Sebelum upload, kita perlu set backend URL di frontend.

**Edit file:** `src/config/api.js` (atau sejenisnya)

```javascript
// Ganti localhost dengan Railway URL
const API_BASE_URL = 'https://premium-news-production.up.railway.app';

export default API_BASE_URL;
```

**Atau jika menggunakan .env:**

Edit file `.env.production`:

```bash
VITE_API_URL=https://premium-news-production.up.railway.app
```

**Build ulang setelah edit:**

```bash
npm run build
```

### 4.2 Upload ke Hostinger via File Manager

1. Buka **File Manager** Hostinger
2. Masuk ke folder **`public_html`** (yang sudah kosong)
3. Klik **"Upload"** button
4. Upload **SEMUA file dan folder** dari folder **`dist/`**:
   - `index.html`
   - Folder `assets/`
   - File lainnya yang ada di `dist/`

5. Tunggu sampai upload selesai
6. **PENTING:** Pastikan `index.html` ada di root `public_html`, BUKAN di subfolder `dist`!

Struktur akhir di `public_html`:
```
public_html/
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-xyz789.css
│   └── ...
└── vite.svg (or other static files)
```

---

## 🎉 LANGKAH 5: Test Website

1. Buka browser
2. Akses **https://uptpelatihanpertanian.id**
3. Should see Premium News App homepage!
4. Test features:
   - Login
   - Create article
   - Upload images
   - Manage categories

### Jika Ada Error 404 atau Blank Page:

**Fix A: Check .htaccess for React Router**

Create file `.htaccess` di `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Fix B: Check CORS di Backend**

Pastikan backend Railway allow requests dari domain Hostinger.

Edit `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://uptpelatihanpertanian.id',
    'http://uptpelatihanpertanian.id',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

Commit dan push ke GitHub, Railway akan auto-redeploy.

---

## 🔐 LANGKAH 6: Setup HTTPS/SSL (Jika Belum Aktif)

1. Hostinger dashboard → **Website** → **uptpelatihanpertanian.id**
2. Cari **"SSL"** atau **"Security"**
3. Enable **Free SSL Certificate** (Let's Encrypt)
4. Toggle **"Force HTTPS"**
5. Tunggu 5-15 menit untuk SSL activation

---

## ✅ Checklist Final

- [ ] Backup WordPress tersimpan aman
- [ ] Frontend build berhasil (folder `dist/` ada)
- [ ] Backend deployed ke Railway
- [ ] Railway MySQL database configured
- [ ] Environment variables set di Railway
- [ ] WordPress files deleted dari Hostinger
- [ ] Frontend uploaded ke `public_html`
- [ ] `.htaccess` created untuk React Router
- [ ] CORS configured di backend
- [ ] Website accessible via https://uptpelatihanpertanian.id
- [ ] Login works
- [ ] CRUD operations work
- [ ] SSL certificate active

---

## 🆘 Troubleshooting

### Frontend tidak muncul, 404 error
- Check `index.html` ada di root `public_html`
- Check `.htaccess` file
- Clear browser cache (Ctrl+Shift+R)

### API calls gagal, CORS error
- Check Railway backend URL correct di frontend config
- Check CORS settings di backend
- Check Railway deployment status (green = running)

### Database connection error
- Check Railway MySQL credentials correct
- Check environment variables di Railway
- Check database initialized (tables created)

### Gambar tidak muncul
- Check `assets/` folder uploaded
- Check file paths di build (should be relative)

---

## 📞 Need Help?

Jika ada masalah, screenshot error message dan kirim ke saya untuk debugging! 🚀
