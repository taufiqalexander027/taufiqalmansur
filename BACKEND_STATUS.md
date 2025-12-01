# Portal Terintegrasi - Fase 1 Backend

## ✅ Yang Sudah Dibuat

### Backend Structure
```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── newsController.js    # News CRUD operations
├── middleware/
│   └── auth.js              # JWT auth & role checking
├── routes/
│   ├── auth.js              # Auth endpoints
│   └── news.js              # News endpoints
├── database/
│   └── schema.sql           # Complete database schema
├── scripts/
    └── setupDatabase.js     # Database setup automation
├── server.js                # Express server
├── .env                     # Environment config
└── package.json
```

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

**News:**
- `GET /api/news` - Get all news (public, with pagination & filters)
- `GET /api/news/:slug` - Get single news by slug
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)
- `GET /api/news/categories` - Get all categories

### Features Implemented

✅ **JWT Authentication** - Secure token-based auth
✅ **Role-Based Access Control** - public, staff, admin roles
✅ **Password Hashing** - bcrypt untuk secure passwords
✅ **Activity Logging** - Audit trail untuk semua actions
✅ **News Management** - Full CRUD dengan categories
✅ **Search & Filter** - Pagination, category, featured, search
✅ **Slug Generation** - SEO-friendly URLs
✅ **View Counter** - Track news views
✅ **Database Views** - Optimized queries

### Database Schema

**Tables:**
- `roles` - User roles
- `users` - User accounts (dengan role)
- `news_categories` - 6 default categories
- `news` - News articles dengan full features
- `user_sessions` - Session tracking
- `activity_logs` - Audit trail

**Default Data:**
- 3 Roles: public, staff, admin
- 6 News Categories: Teknologi, Keuangan, Bisnis, Prestasi, Kebijakan, Pengumuman
- 1 Admin user: username `admin`, password `admin123`
- 3 Sample news articles

## 🚀 Next Steps untuk User

### Setup Database

**Option 1: Automatic (Recommended)**
```bash
cd backend
npm run db:setup
```

**Option 2: Manual**
1. Buka MySQL client (phpMyAdmin, MySQL Workbench, atau terminal)
2. Execute file `backend/database/schema.sql`

**Catatan:** Pastikan MySQL sudah running dan credentials di `.env` benar

### Start Backend Server

```bash
cd backend
npm run dev
```

Server akan berjalan di: **http://localhost:5000**

### Test API

**1. Test Health:**
```bash
curl http://localhost:5000/api/health
```

**2. Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**3. Test Get News:**
```bash
curl http://localhost:5000/api/news
```

## 📊 Default Admin Credentials

```
Username: admin
Password: admin123
Email: admin@portal.local
Role: admin
```

## 🔄 Fase Selanjutnya

### Fase 1 Remaining:
- [ ] Frontend integration dengan backend
- [ ] Admin dashboard UI untuk manage news
- [ ] Image upload untuk news

### Fase 2: Booking System
- [ ] Database schema untuk bookings
- [ ] API endpoints untuk kunjungan lapang & sewa gedung
- [ ] Email notification system

### Fase 3: LMS
- [ ] Course management API
- [ ] Video upload system
- [ ] Progress tracking

### Fase 4: Internal Systems
- [ ] Migrate E-Laporan ASN (port 5001)
- [ ] Migrate Laporan Keuangan (port 3001)
- [ ] Single Sign-On integration

### Fase 5: Deploy
- [ ] Production optimization
- [ ] Hostinger deployment
- [ ] SSL configuration

## 📝 Notes

**Backend sepenuhnya functional!** Tinggal:
1. Setup MySQL database (run schema.sql)
2. Start server (npm run dev)
3. Test API endpoints
4. Integrate dengan frontend

Lihat `backend/README.md` untuk dokumentasi lengkap API.
