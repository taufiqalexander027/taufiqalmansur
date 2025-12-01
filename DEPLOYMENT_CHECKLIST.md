# 🎯 Deployment Checklist - Hostinger

## ✅ Pre-Deployment (DONE)
- [x] Git repository initialized
- [x] .gitignore configured
- [x] Initial commit created

## 📋 Next Steps

### 1. Push ke GitHub (5 menit)

**Create repo di GitHub:**
- Buka: https://github.com/new
- Nama: `portal-terintegrasi`
- Private/Public: Pilih
- **JANGAN** check "Add README"

**Push code:**
```bash
cd /Users/taura/.gemini/antigravity/scratch/premium-news-app

git remote add origin https://github.com/YOUR_USERNAME/portal-terintegrasi.git
git branch -M main
git push -u origin main
```

✅ Code di cloud! Update jadi mudah!

---

### 2. Setup Hostinger (10 menit)

**A. Create Database:**
- Hostinger panel → Databases
- Create `portal_terintegrasi`
- Save credentials!

**B. Import Schema:**
- phpMyAdmin → Import
- Upload: `backend/database/schema.sql`
- Import semua fase (fase2, fase3, fase4)

**C. Setup Node.js:**
- Panel → Node.js → Create Application
- Startup: `backend/server.js`
- Node v16+

---

### 3. Deploy Code (15 menit)

**SSH ke server:**
```bash
ssh your_username@yourdomain.com
```

**Clone repo:**
```bash
cd domains/yourdomain.com/public_html
git clone https://github.com/YOUR_USERNAME/portal-terintegrasi.git
cd portal-terintegrasi
```

**Install:**
```bash
# Backend
cd backend
npm install --production

# Frontend
cd ..
npm install
npm run build
```

**Config .env:**
```bash
cd backend
nano .env
# Paste config dari HOSTINGER_DEPLOY.md
```

**Start:**
```bash
cd backend
pm2 start server.js --name portal-backend
```

**Deploy frontend:**
```bash
cd ..
cp -r dist/* ../../
```

---

### 4. Enable SSL (5 menit)

- Hostinger panel → SSL
- Enable Free SSL
- Wait 5-10 min

---

### 5. Test! (2 menit)

- Visit: https://yourdomain.com
- Login: admin / admin123
- Test features!

---

## 🔄 Future Updates

**Super mudah dengan Git!**

```bash
# Local
git add .
git commit -m "Update"
git push

# Server (one command!)
ssh server 'cd portal && git pull && npm run build && pm2 restart portal-backend'
```

---

## 📞 Need Help?

**Documentation:**
- Full Guide: HOSTINGER_DEPLOY.md
- Quick Ref: UPDATE_COMMANDS.md
- API Tests: API_TESTING_GUIDE.md

**Hostinger:**
- Live Chat 24/7
- support.hostinger.com

---

**Total Time: ~30 minutes**
**Update Time: ~1 minute** 🚀
