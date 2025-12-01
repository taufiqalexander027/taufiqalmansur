# 🧪 API Testing Guide - Complete Reference

## Internal Systems APIs

### Base URL
```
http://localhost:5000/api/internal
```

All requests require authentication token!

---

## 📝 ASN (E-Laporan) APIs

### 1. Create Daily Report

**Endpoint:** `POST /api/internal/asn/daily-reports`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "report_date": "2025-12-01",
  "activity_description": "Pengembangan sistem portal terintegrasi dan koordinasi dengan tim development",
  "work_hours": 8,
  "location": "Kantor / WFH",
  "notes": "Berhasil menyelesaikan integrasi ASN dan Financial dashboard"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Laporan harian berhasil dibuat"
}
```

---

### 2. Get My Daily Reports

**Endpoint:** `GET /api/internal/asn/daily-reports`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters (optional):**
- `month`: Filter by month (format: YYYY-MM)

**Example:**
```bash
GET /api/internal/asn/daily-reports?month=2025-12
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "report_date": "2025-12-01",
      "activity_description": "...",
      "work_hours": 8,
      "location": "Kantor",
      "notes": null,
      "created_at": "2025-12-01T07:00:00.000Z"
    }
  ]
}
```

---

### 3. Submit Berakhlak Assessment

**Endpoint:** `POST /api/internal/asn/berakhlak-assessment`

** Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "assessment_period": "2025-12",
  "berorientasi_pelayanan": 5,
  "akuntabel": 5,
  "kompeten": 4,
  "harmonis": 5,
  "loyal": 5,
  "adaptif": 4,
  "kolaboratif": 5,
  "notes": "Komitmen untuk terus meningkatkan kompetensi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment berhasil disimpan"
}
```

---

## 💰 Financial APIs

### 1. Get Financial Summary

**Endpoint:** `GET /api/internal/financial/summary`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `fiscal_year`: Year (default: current year)
- `program_code`: Filter by program code

**Example:**
```bash
GET /api/internal/financial/summary?fiscal_year=2025&program_code=1.02
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "program_code": "1.02",
      "program_name": "PROGRAM PENYULUHAN PERTANIAN",
      "activity_code": "1.02.01",
      "activity_name": "Pelatihan dan Penyuluhan Petani",
      "account_code": "5.2.02.01.01.0051",
      "account_name": "Belanja Modal Perangkat Komputer",
      "fiscal_year": 2025,
      "budget_amount": "150000000.00",
      "total_realization": "0.00",
      "remaining_budget": "150000000.00"
    }
  ]
}
```

---

### 2. Create Budget

**Endpoint:** `POST /api/internal/financial/budgets`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "account_id": 1,
  "fiscal_year": 2025,
  "budget_amount": 150000000,
  "source_of_funds": "APBD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Anggaran berhasil disimpan"
}
```

---

### 3. Create Realization

**Endpoint:** `POST /api/internal/financial/realizations`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "budget_id": 1,
  "month": 1,
  "realization_amount": 12500000,
  "notes": "Realisasi bulan Januari 2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Realisasi berhasil disimpan"
}
```

---

### 4. Get Programs

**Endpoint:** `GET /api/internal/financial/programs`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "1.02",
      "name": "PROGRAM PENYULUHAN PERTANIAN",
      "description": "Program penyuluhan dan pendampingan petani",
      "created_at": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🔧 Complete Testing Workflow

### Step 1: Get Authentication Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Save the `token` from response!

### Step 2: Test ASN Daily Report

```bash
curl -X POST http://localhost:5000/api/internal/asn/daily-reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "report_date": "2025-12-01",
    "activity_description": "Testing API integration",
    "work_hours": 8,
    "location": "Kantor"
  }'
```

### Step 3: Get Reports

```bash
curl -X GET http://localhost:5000/api/internal/asn/daily-reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Test Financial Summary

```bash
curl -X GET "http://localhost:5000/api/internal/financial/summary?fiscal_year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 Postman Collection

Import this collection to Postman:

```json
{
  "info": {
    "name": "Portal Terintegrasi - Internal APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "ASN - Create Daily Report",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"report_date\": \"2025-12-01\",\n  \"activity_description\": \"Testing\",\n  \"work_hours\": 8\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/internal/asn/daily-reports",
          "host": ["{{base_url}}"],
          "path": ["internal", "asn", "daily-reports"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "your_jwt_token_here"
    }
  ]
}
```

---

## 🎯 Migration Scripts Usage

### Migrate ASN Data (Port 5001)

1. **Setup Environment Variables:**

Add to `backend/.env`:
```
# Old ASN Database (port 5001)
OLD_ASN_DB_HOST=localhost
OLD_ASN_DB_USER=root
OLD_ASN_DB_PASSWORD=your_password
OLD_ASN_DB_NAME=e_laporan_asn
OLD_ASN_DB_PORT=3306
```

2. **Run Migration:**
```bash
cd backend
node scripts/migrateASN.js
```

### Migrate Financial Data (Port 3001)

1. **Setup Environment Variables:**

Add to `backend/.env`:
```
# Old Financial Database (port 3001)
OLD_FINANCIAL_DB_HOST=localhost
OLD_FINANCIAL_DB_USER=root
OLD_FINANCIAL_DB_PASSWORD=your_password
OLD_FINANCIAL_DB_NAME=laporan_keuangan
OLD_FINANCIAL_DB_PORT=3306
```

2. **Run Migration:**
```bash
cd backend
node scripts/migrateFinancial.js
```

---

## ✅ Testing Checklist

### ASN System:
- [ ] Create daily report via API
- [ ] View my reports
- [ ] Filter by month
- [ ] Submit Berakhlak assessment
- [ ] Test from frontend dashboard

### Financial System:
- [ ] View financial summary
- [ ] Filter by program
- [ ] Filter by fiscal year
- [ ] Create budget entry
- [ ] Create realization entry
- [ ] View from frontend dashboard

### Migration:
- [ ] Backup old databases
- [ ] Run ASN migration
- [ ] Verify data integrity
- [ ] Run Financial migration
- [ ] Verify calculations
- [ ] Test frontend with migrated data

---

## 🐛 Troubleshooting

**401 Unauthorized:**
- Token expired or invalid
- Re-login to get new token

**403 Forbidden:**
- User role insufficient
- Use admin or staff account

**500 Server Error:**
- Check backend logs
- Verify database connection
- Check required fields

**Migration Errors:**
- Verify old database connectivity
- Check table structures match
- Ensure user email mapping works

---

## 📚 Additional Resources

- **Backend README**: Complete API documentation
- **Database Schema**: See `backend/database/*.sql`
- **Frontend Components**: ASNDashboard.jsx, FinancialDashboard.jsx
- **Migration Scripts**: backend/scripts/migrate*.js

---

**All APIs Ready! Migration Tools Ready! Frontend Complete!** 🎉
