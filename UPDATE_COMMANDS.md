# Quick Update Command Reference

## Update Workflow (Setelah Deploy)

### From Local → Production

```bash
# 1. Di local - edit code
# 2. Test perubahan
# 3. Commit & Push
git add .
git commit -m "Update: describe your changes"
git push origin main

# 4. SSH ke server
ssh u123456789@yourdomain.com

# 5. Pull & Deploy
cd domains/yourdomain.com/portal-terintegrasi && \
git pull && \
cd backend && npm install --production && pm2 restart portal-backend && \
cd .. && npm run build && cp -r dist/* ../public_html/

# DONE!
```

### One-Liner Deploy:
```bash
ssh u123456789@yourdomain.com 'cd portal-terintegrasi && git pull && cd backend && npm install && pm2 restart portal-backend && cd .. && npm run build && cp -r dist/* ../public_html/'
```

Copy command ini, save di notes - tinggal run setiap update! ✅
