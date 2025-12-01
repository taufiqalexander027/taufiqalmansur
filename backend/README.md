# Backend Setup Guide

## Prerequisites

- Node.js (v16 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- npm atau yarn

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env` dan sesuaikan dengan konfigurasi database Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portal_terintegrasi
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Setup Database

Jalankan script setup database:

```bash
npm run db:setup
```

Script ini akan:
- Create database `portal_terintegrasi`
- Create semua tabel yang diperlukan
- Insert default data (roles, categories, sample news)
- Create admin user default

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

### 4. Start Development Server

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "081234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@portal.local",
      "full_name": "Administrator",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### News

#### Get All News (Public)
```http
GET /api/news?page=1&limit=10&category=teknologi&featured=true&search=portal
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category slug
- `featured` - Filter featured news (true/false)
- `search` - Search in title and content

#### Get Single News (Public)
```http
GET /api/news/{slug}
```

#### Create News (Admin Only)
```http
POST /api/news
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Judul Berita",
  "excerpt": "Ringkasan berita",
  "content": "Konten lengkap berita",
  "category_id": 1,
  "is_published": true,
  "is_featured": false
}
```

#### Update News (Admin Only)
```http
PUT /api/news/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Judul Berita Updated",
  "is_published": true
}
```

#### Delete News (Admin Only)
```http
DELETE /api/news/{id}
Authorization: Bearer {admin_token}
```

#### Get Categories (Public)
```http
GET /api/news/categories
```

## Database Schema

### Tables

1. **roles** - User roles (public, staff, admin)
2. **users** - User accounts
3. **news_categories** - News categories
4. **news** - News articles
5. **user_sessions** - Active sessions (optional tracking)
6. **activity_logs** - Activity audit trail

### Views

- `v_news_full` - News with category and author info
- `v_users_with_roles` - Users with role information

## Security

### Authentication
- JWT tokens dengan expiration
- Password hashing menggunakan bcrypt
- Role-based access control (RBAC)

### Authorization Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Get News
```bash
curl http://localhost:5000/api/news
```

## Troubleshooting

### Database Connection Error

Pastikan:
1. MySQL service sudah running
2. Database credentials di `.env` benar
3. User MySQL punya akses ke database

### JWT Token Error

Pastikan:
1. `JWT_SECRET` di `.env` sudah diset
2. Token dikirim di header dengan format: `Bearer {token}`

## Next Steps

Setelah backend berjalan:
1. ✅ Test semua endpoint dengan Postman/Thunder Client
2. ✅ Integrate dengan frontend
3. ✅ Deploy ke production server
