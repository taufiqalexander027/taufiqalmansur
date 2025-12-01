# 🚨 LOGIN ISSUE FIX - Quick Solution

## Problem: Login Gagal

**Root Cause:** MySQL belum terinstall di sistem Anda.

Backend tidak bisa running tanpa MySQL database!

---

## ✅ SOLUSI TERCEPAT: Install MAMP

### Step 1: Download MAMP
https://www.mamp.info/en/downloads/

**Kenapa MAMP?**
- ✅ One-click install
- ✅ Visual interface
- ✅ No terminal commands
- ✅ Works immediately

### Step 2: Install & Start
1. Install MAMP (drag & drop)
2. Buka MAMP application
3. Click "Start Servers"
4. MySQL akan running di port 8889

### Step 3: Update Config

Edit file: `backend/.env`

Change:
```
DB_PORT=3306
```

To:
```
DB_PORT=8889
DB_PASSWORD=root
```

### Step 4: Setup Database
```bash
cd /Users/taura/.gemini/antigravity/scratch/premium-news-app/backend
npm run db:setup
```

### Step 5: Restart Backend
Backend akan auto-restart (nodemon sudah running)

Atau manual:
```bash
cd backend
npm run dev
```

### Step 6: Login!
- Buka: http://localhost:5173/login
- Username: `admin`
- Password: `admin123`

**DONE!** ✅

---

## Alternative: Install MySQL via Homebrew

Jika prefer command line:

```bash
brew install mysql
brew services start mysql
cd backend
npm run db:setup
```

---

## Atau: Skip Local Setup

Deploy langsung ke Hostinger:
- Baca: `DEPLOYMENT_GUIDE.md`
- Setup MySQL di hosting
- Upload & go live

---

**Pilih MAMP = Paling Mudah!** 🎯
