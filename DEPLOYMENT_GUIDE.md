# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
```bash
# Backend .env
NODE_ENV=production
PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_strong_password
DB_NAME=portal_terintegrasi
JWT_SECRET=generate_strong_random_secret_min_32_chars
SMTP_HOST=smtp.hostinger.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password
FRONTEND_URL=https://yourdomain.com
```

### 2. Database Security
- [ ] Change default admin password
- [ ] Create separate DB user for production (not root)
- [ ] Enable SSL for database connections
- [ ] Regular automated backups

### 3. Application Security
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Sanitize all inputs

## Hostinger Deployment

### Backend (Node.js)

1. **Setup Node.js App**:
   - Login to Hostinger control panel
   - Navigate to "Node.js Application"
   - Create new application
   - Select Node.js version (16+)
   - Set application root to `/backend`
   - Entry point: `server.js`

2. **Upload Files**:
```bash
# Via FTP or File Manager
/public_html/backend/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── database/
├── server.js
├── package.json
└── .env
```

3. **Install Dependencies**:
```bash
cd /path/to/backend
npm install --production
```

4. **Setup Database**:
```bash
node scripts/setupDatabase.js
```

5. **Start Application**:
- Use Hostinger's Node.js manager
- Or PM2: `pm2 start server.js --name portal-backend`

### Frontend (React)

1. **Build Production**:
```bash
cd frontend
npm run build
```

2. **Upload to public_html**:
```bash
# Upload contents of dist/ folder to:
/public_html/
├── index.html
├── assets/
└── ...
```

3. **Configure .htaccess** for SPA routing:
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

### SSL/HTTPS Setup

1. **Enable SSL in Hostinger**:
   - Navigate to SSL section
   - Enable Let's Encrypt
   - Force HTTPS redirect

2. **Update Environment**:
   - Update `FRONTEND_URL` to https://
   - Update API calls in frontend

## Post-Deployment Verification

### Backend Health Checks
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"OK","message":"Portal Backend is running"}

curl https://yourdomain.com/api/news
# Expected: News list JSON
```

### Test Critical Flows
- [ ] User registration/login
- [ ] News CRUD (admin)
- [ ] Booking creation
- [ ] Course enrollment
- [ ] Internal systems access (staff)

### Performance Optimization
- [ ] Enable Gzip compression
- [ ] Setup CDN for static assets
- [ ] Configure caching headers
- [ ] Minify JS/CSS
- [ ] Optimize images

## Monitoring

### Setup Logging
```javascript
// In server.js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitor Metrics
- Server uptime
- API response times
- Database query performance
- Error rates
- User activity

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
mysqldump -u user -p portal_terintegrasi > backup_$(date +%Y%m%d).sql

# Keep last 30 days
find /backups -name "backup_*.sql" -mtime +30 -delete
```

### Application Backups
- Weekly full backup via Hostinger
- Keep version-controlled code in Git

## Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: Performance review

### Update Procedure
1. Test updates in staging
2. Backup database
3. Deploy during low-traffic hours
4. Monitor for issues
5. Rollback if needed

## Troubleshooting

### Common Issues

**Database Connection Error**:
```bash
# Check credentials
mysql -h host -u user -p

# Verify firewall rules
# Ensure DB allows remote connections
```

**Node.js App Not Starting**:
```bash
# Check logs
pm2 logs portal-backend

# Restart application
pm2 restart portal-backend
```

**CORS Errors**:
```javascript
// Update CORS in server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
app.use(cors(corsOptions));
```

## Security Hardening

### Additional Measures
- [ ] Setup fail2ban for brute force protection
- [ ] Enable SQL injection protection
- [ ] XSS protection headers
- [ ] CSRF tokens
- [ ] Regular security scans
- [ ] Dependency vulnerability checks

```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

## Performance Tuning

### Database
- [ ] Add indexes on frequently queried columns
- [ ] Optimize slow queries
- [ ] Enable query cache
- [ ] Connection pooling (already implemented)

### Application
- [ ] Enable PM2 cluster mode
- [ ] Setup Redis for sessions (optional)
- [ ] Implement API response caching
- [ ] Optimize bundle size

## Done!

Your portal is now production-ready and deployed! 🚀

Monitor regularly and maintain security updates.
