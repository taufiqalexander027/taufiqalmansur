# 🎯 Quick Start: Deploy ke Hostinger Sekarang!

Panduan singkat dan mudah untuk upload Premium News App ke Hostinger.

---

## ✅ Yang Sudah Selesai:

- ✅ Frontend sudah di-build (`dist/` folder ready)
- ✅ Environment files siap
- ✅ GitHub repository sudah online

---

## 🚀 Langkah Cepat (15 Menit):

### 1️⃣ BACKUP WORDPRESS (2 menit)

**Login Hostinger → Website → uptpelatihanpertanian.id → Dashboard**

Cari **"Backups"**, klik **"Create"** atau **"Download"**

> **Simpan file backup ke komputer!**

---

### 2️⃣ DEPLOY BACKEND KE RAILWAY (5 menit)

#### A. Create Account
- Buka: https://railway.app
- Klik **"Start a New Project"** 
- **Login with GitHub**

#### B. Deploy Repository
1. Klik **"New Project"** → **"Deploy from GitHub repo"**
2. Pilih: **taufiqalexander027/taufiqalmansur**
3. Klik repository → Railway mulai deploy

#### C. Add MySQL Database
1. Di project page, klik **"New"** → **"Database"** → **"Add MySQL"**
2. MySQL akan auto-create

#### D. Configure Variables
1. Klik service **backend** → **"Variables"** tab
2. Add variable:

```
NODE_ENV=production
PORT=5173
JWT_SECRET=mysupersecretkey12345
```

3. Railway akan auto-connect MySQL (DB_HOST, DB_USER, DB_PASSWORD sudah ada)

#### E. Get Backend URL
1. Klik **"Settings"** → Scroll ke **"Domains"**
2. Klik **"Generate Domain"**
3. **COPY URL INI** (contoh: `https://premium-news-production.up.railway.app`)

---

### 3️⃣ UPDATE FRONTEND CONFIG (1 menit)

**Edit file `.env.production`:**

```bash
VITE_API_URL=https://[YOUR-RAILWAY-URL]/api
```

Ganti `[YOUR-RAILWAY-URL]` dengan URL dari Railway (tanpa kurung siku)!

**Build ulang:**

```bash
npm run build
```

---

### 4️⃣ HAPUS WORDPRESS FILES (2 menit)

**Hostinger → File Manager**

1. Buka folder **public_html**
2. **Select ALL** files (wp-admin, wp-content, etc)
3. Klik **Delete** / icon sampah
4. Confirm delete

---

### 5️⃣ UPLOAD PREMIUM NEWS APP (3 menit)

Masih di **File Manager**, folder **public_html**:

1. Klik **"Upload"**
2. Upload **SEMUA file dari folder `dist/`**:
   - `index.html`
   - Folder `assets/`
   - File `vite.svg` (jika ada)

3. Tunggu upload selesai

**PENTING:** Pastikan `index.html` ada langsung di `public_html`, BUKAN di subfolder!

---

### 6️⃣ CREATE .HTACCESS (1 menit)

Di **File Manager**, create file baru **`.htaccess`** di `public_html`:

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

Save file.

---

### 7️⃣ UPDATE BACKEND CORS (1 menit)

Di Railway, tambahkan variable:

```
CORS_ORIGIN=https://uptpelatihanpertanian.id,http://uptpelatihanpertanian.id
```

Railway akan auto-redeploy.

---

### 8️⃣ TEST! 🎉

Buka browser: **https://uptpelatihanpertanian.id**

Should see Premium News App! 🚀

**Test checklist:**
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] Can create account
- [ ] Can login
- [ ] Can create article

---

## 🆘 Jika Ada Masalah:

### Blank page / 404
- Check `.htaccess` created
- Clear browser cache (Ctrl+Shift+R)
- Check `index.html` in root `public_html`

### API errors / CORS
- Check Railway backend URL correct in `.env.production`
- Rebuild: `npm run build`
- Re-upload `dist/` files
- Check CORS_ORIGIN in Railway variables

### Database errors
- Check Railway MySQL running (green status)
- Check environment variables in Railway

---

## 📸 Screenshot Saat Deploy

Kirim screenshot ke saya jika:
- Ada error message
- Page tidak load
- API call gagal

Saya siap bantu debugging! 💪
