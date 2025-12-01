# 🚀 Pre-Deployment Checklist for Shared Hosting

## ✅ Completed (Ready for Deployment)

### Code Quality
- [x] Fixed `app.blade.php` syntax error (removed markdown code fence)
- [x] All console.log statements removed
- [x] No backend debug code (`dd()`, `dump()`, `var_dump()`)
- [x] All Blade templates verified and working
- [x] Git repository updated and pushed to GitHub

### Performance & SEO
- [x] Vite compression configured (Gzip)
- [x] JSON-LD schemas added (Organization + SoftwareApplication)
- [x] `.gitignore` enhanced with security patterns
- [x] `!/public/build` added to allow production assets

### Caches Cleared
- [x] View cache cleared
- [x] Config cache cleared
- [x] Route cache cleared
- [x] Application cache cleared

---

## 📋 Next Steps for Deployment on Hostinger

### 1️⃣ Build Production Assets
Before deploying, build your frontend assets locally:

```bash
cd c:\Users\TASLEEMAH\Documents\mdmseva
npm run build
```

This creates optimized assets in `public/build/`.

### 2️⃣ Commit Built Assets
```bash
git add public/build
git commit -m "chore: add production build assets"
git push origin main
```

### 3️⃣ Deploy via Hostinger Git

1. **Log in to Hostinger hPanel**
2. Go to **Advanced** > **Git**
3. **Add New Repository**:
   - Repository URL: `https://github.com/BilalTali/mdmseva.git`
   - Branch: `main`
   - Target directory: Leave empty (deploys to `public_html`) or use a subfolder
4. Click **Create** and wait for deployment

### 4️⃣ SSH into Server and Run Setup

Connect via SSH (from hPanel):
```bash
cd domains/yourdomain.com/public_html
```

Install dependencies:
```bash
composer install --no-dev --optimize-autoloader
```

Configure environment:
```bash
cp .env.example .env
nano .env
```

Update these critical values in `.env`:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_DATABASE=your_hostinger_db_name
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
```

Generate app key:
```bash
php artisan key:generate
```

Run migrations:
```bash
php artisan migrate --force
```

Link storage:
```bash
php artisan storage:link
```

Build caches:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5️⃣ Fix Document Root

**Option A** (Recommended): Change document root in hPanel
- Go to **Domains** > **Manage**
- Change Document Root from `/public_html` to `/public_html/public`

**Option B**: Use `.htaccess` redirect
Create `.htaccess` in root with:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### 6️⃣ Set Permissions
```bash
chmod -R 775 storage bootstrap/cache
```

### 7️⃣ Verify Deployment
Visit your domain. You should see the MDM SEVA welcome page.

---

## 🔍 Troubleshooting

### If you see "500 Internal Server Error"
```bash
# Check logs
cat storage/logs/laravel.log

# Clear all caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

### If Composer fails
```bash
# Run with verbose output
composer install --no-dev --optimize-autoloader -vvv
```

### If migrations fail
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## ✨ Your Application is Ready!

All critical fixes have been applied:
- ✅ Blade syntax errors fixed
- ✅ Caches cleared
- ✅ Git repository configured
- ✅ Code pushed to GitHub

**Follow the steps above** to deploy to Hostinger shared hosting. Good luck! 🚀
