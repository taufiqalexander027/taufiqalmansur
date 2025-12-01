# 🚀 Hostinger Deployment Guide - Step by Step

## Deployment Strategy: Git-based (Easy Updates!)

Dengan Git, update jadi sangat mudah - tinggal push code baru! ✅

---

## PERSIAPAN (Di Komputer Lokal)

### 1. Initialize Git Repository

```bash
cd /Users/taura/.gemini/antigravity/scratch/premium-news-app

# Init git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
dist/
uploads/*
!uploads/.gitkeep
EOF

# Initial commit
git add .
git commit -m "Initial commit - Portal Terintegrasi"
```

### 2. Push ke GitHub/GitLab (PENTING untuk update mudah!)

**Buat repo baru di GitHub:**
- Buka https://github.com/new
- Nama: `portal-terintegrasi`
- Private atau Public (terserah)
- Jangan create README (sudah ada)

**Push ke GitHub:**
```bash
git remote add origin https://github.com/USERNAME/portal-terintegrasi.git
git branch -M main
git push -u origin main
```

✅ **Sekarang code Anda di cloud!**

---

## DEPLOYMENT KE HOSTINGER

### Step 1: Setup Hosting

1. **Login ke Hostinger Control Panel**
   - https://hpanel.hostinger.com

2. **Pilih Hosting** Yang Support:
   - Node.js ✅
   - MySQL ✅
   - SSH Access ✅
   
   (Cloud Hosting atau VPS recommended)

### Step 2: Setup MySQL Database

1. Di Hostinger panel → **Databases**
2. Click **MySQL Databases**
3. Create database:
   - Name: `portal_terintegrasi`
   - Username: (auto atau custom)
   - Password: (strong password)
   - **SAVE credentials!**

4. Akses phpMyAdmin:
   - Click "Manage" pada database
   - Buka phpMyAdmin
   - Import file: `backend/database/schema.sql`
   - Lalu import: `backend/database/fase2_bookings_schema.sql`
   - Import: `backend/database/fase3_lms_schema.sql`
   - Import: `backend/database/fase4_internal_systems_schema.sql`
   
   ✅ **Database ready!**

### Step 3: Setup Node.js Application

1. Di Hostinger panel → **Advanced** → **Node.js**
2. Click **Create Application**

**Settings:**
- Application Mode: **Production**
- Application Root: `portal-terintegrasi`
- Application URL: `yourdomain.com` atau subdomain
- Application Startup File: `backend/server.js`
- Node.js Version: **16 atau lebih tinggi**

3. Click **Create**

### Step 4: SSH ke Server & Clone Repo

1. Di Hostinger panel → **Advanced** → **SSH Access**
2. Enable SSH
3. Copy SSH credentials

**Di terminal lokal:**
```bash
# Connect via SSH
ssh u123456789@yourdomain.com
# (ganti dengan kredensial Anda)

# Navigate ke folder
cd domains/yourdomain.com/portal-terintegrasi

# Clone repository
git clone https://github.com/USERNAME/portal-terintegrasi.git .

# Install dependencies
cd backend
npm install --production

# Back to root untuk frontend
cd ..
npm install
npm run build
```

### Step 5: Setup Environment Variables

**Di server (via SSH):**
```bash
cd backend
nano .env
```

**Paste config ini (sesuaikan!):**
```env
NODE_ENV=production
PORT=3000

# Database (dari Step 2)
DB_HOST=localhost
DB_USER=u123456789_portal
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=u123456789_portal_terintegrasi
DB_PORT=3306

# JWT
JWT_SECRET=GENERATE_RANDOM_32_CHAR_SECRET_HERE
JWT_EXPIRE=7d

# Email (optional - setup nanti)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_email_password
SMTP_FROM="Portal Terintegrasi <noreply@yourdomain.com>"

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 6: Deploy Frontend

**Build frontend:**
```bash
# Di server
cd /path/to/portal-terintegrasi
npm run build
```

**Copy ke public_html:**
```bash
cp -r dist/* ../public_html/
```

**Create .htaccess for SPA routing:**
```bash
cd ../public_html
nano .htaccess
```

Paste:
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

### Step 7: Start Backend

**Via Hostinger Node.js Panel:**
1. Go to Node.js section
2. Your application should be listed
3. Click **Start**
4. Backend akan running!

**Atau via PM2 (SSH):**
```bash
cd backend
npm install -g pm2
pm2 start server.js --name portal-backend
pm2 save
pm2 startup
```

### Step 8: Setup SSL (HTTPS)

1. Di Hostinger panel → **SSL**
2. Enable **Free SSL** (Let's Encrypt)
3. Wait 5-10 minutes
4. ✅ https://yourdomain.com ready!

### Step 9: Update Frontend API URL

**Edit `.env` production di frontend (rebuild):**

Di server:
```bash
cd /path/to/portal-terintegrasi
nano .env
```

Update:
```
VITE_API_URL=https://yourdomain.com/api
```

Rebuild:
```bash
npm run build
cp -r dist/* ../public_html/
```

### Step 10: Test!

1. **Open**: https://yourdomain.com
2. **Login**: admin / admin123
3. **Test all features!**

✅ **DEPLOYED!**

---

## 🔄 CARA UPDATE SUPER MUDAH!

### Update Code (Local)

```bash
# Edit files di local
# test perubahan

# Commit changes
git add .
git commit -m "Update: feature XYZ"
git push origin main
```

### Deploy Update ke Hostinger

**SSH ke server:**
```bash
ssh u123456789@yourdomain.com
cd domains/yourdomain.com/portal-terintegrasi

# Pull latest code
git pull origin main

# Update dependencies jika ada
cd backend
npm install --production

# Restart backend
pm2 restart portal-backend

# Update frontend
cd ..
npm run build
cp -r dist/* ../public_html/
```

**DONE!** Update selesai dalam 1 menit! 🚀

---

## 🎯 Quick Update Workflow

### Update Backend:
```bash
# Local: edit → commit → push
# Server: pull → restart
```

### Update Frontend:
```bash
# Local: edit → commit → push  
# Server: pull → build → copy
```

### Update Database:
```bash
# phpMyAdmin → import SQL
# atau via migration script
```

---

## 📝 Maintenance Commands

### Check Backend Status:
```bash
pm2 status
pm2 logs portal-backend
```

### Restart Backend:
```bash
pm2 restart portal-backend
```

### Database Backup:
```bash
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql
```

### View Logs:
```bash
pm2 logs --lines 100
```

---

## 🆘 Troubleshooting

**Backend tidak start:**
- Check PM2 logs: `pm2 logs`
- Verify .env credentials
- Test database: `mysql -u user -p`

**Frontend blank:**
- Check .htaccess
- Verify build files di public_html
- Check browser console

**Can't login:**
- Backend running? `pm2 status`
- Database setup? Check phpMyAdmin
- Check admin user exists

**502 Bad Gateway:**
- Backend crashed - check logs
- Restart: `pm2 restart portal-backend`

---

## 🎊 Post-Deployment

### Security Checklist:
- [ ] Change admin password
- [ ] Enable firewall di Hostinger
- [ ] Setup backup automation
- [ ] Monitor server resources

### Performance:
- [ ] Enable Cloudflare CDN (optional)
- [ ] Setup caching headers
- [ ] Compress static assets
- [ ] Monitor response times

---

## 📞 Support

**Hostinger Support:**
- Live chat 24/7
- Help center: https://support.hostinger.com

**Your Portal:**
- Docs: PROJECT_COMPLETE.md
- API: API_TESTING_GUIDE.md
- Deploy: This file!

---

**Deployment completed! Updates mudah dengan Git workflow!** 🚀

**Next time:** Just push code → pull di server → done!
