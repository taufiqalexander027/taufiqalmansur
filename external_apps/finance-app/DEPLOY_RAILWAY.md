# 🚀 Panduan Deploy ke Railway

## 📋 Persiapan

### 1. File yang Sudah Ditambahkan:
- ✅ `railway.json` - Konfigurasi Railway
- ✅ `package.json` - Script `start` untuk production

### 2. Cara Deploy (dari Laptop):

#### A. **Push ke Git Repository** (GitHub/GitLab)

```bash
# Di folder: aplikasi realisasi keuangan/app/

# 1. Init git (jika belum)
git init

# 2. Add semua file
git add .

# 3. Commit
git commit -m "Add Railway deployment config"

# 4. Connect ke GitHub (ganti USERNAME dan REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# 5. Push
git push -u origin main
```

#### B. **Connect Railway ke GitHub**

1. Buka https://railway.app
2. Login/Sign up
3. Click **"New Project"**
4. Pilih **"Deploy from GitHub repo"**
5. Pilih repository Anda
6. Railway akan auto-detect dan deploy!

#### C. **Custom Domain** (Opsional)

1. Di Railway Dashboard → Settings
2. Masuk ke "Domains"
3. Click "Generate Domain" atau "Add Custom Domain"

---

## 🔧 Railway Configuration

Railway akan:
1. **Build**: `npm install && npm run build`
2. **Start**: `npm start` (menjalankan `vite preview`)
3. **Port**: Auto-detect dari `$PORT` environment variable

---

## ⚠️ PENTING: Data di Railway

**Data localStorage TIDAK AKAN ADA di Railway!**

Karena:
- localStorage adalah **client-side storage** (browser user)
- Setiap user yang buka Railway URL punya localStorage SENDIRI
- Data tidak tersinkronisasi antar devices

**Solusi:**
- User harus **Import Excel** di Railway URL
- Atau pakai backend/database untuk shared data

---

## 🐛 Troubleshooting

### Error: "Application failed to respond"

**Penyebab:**
- Build gagal
- Port tidak match
- Dependencies tidak terinstall

**Solusi:**
1. Check Railway logs: Dashboard → Deployments → Click build → View logs
2. Pastikan `package.json` punya script `start`
3. Pastikan `railway.json` exists

### Error: "Build failed"

**Penyebab:**
- Dependencies ada yang incompatible
- Node version salah

**Solusi:**
1. Di Railway → Settings → Environment
2. Add variable: `NODE_VERSION = 18` (atau 20)
3. Redeploy

### Data Tidak Muncul

**Ini Normal!**
- Railway adalah aplikasi baru (data kosong)
- User harus import Excel manual
- localStorage per-browser, tidak shared

---

## 📊 Monitoring

### Check Deployment Status:
1. Railway Dashboard → Deployments
2. Lihat status: Building → Deploying → Success/Failed
3. Klik deployment untuk lihat logs

### Check Live URL:
```
https://taufiqalmansur-production.up.railway.app
```

---

## 🔄 Update Aplikasi

Setiap kali ada perubahan code:

```bash
# 1. Commit changes
git add .
git commit -m "Update features"

# 2. Push ke GitHub
git push

# 3. Railway auto-redeploy!
```

---

## 💰 Railway Pricing

- **Free Tier**: 500 jam/bulan ($5 credit)
- **Hobby**: $5/bulan (unlimited hours)

**Tips:** Free tier cukup untuk prototyping/testing!

---

**Created:** 1 Desember 2025  
**Author:** Taufiq Al Mansur
