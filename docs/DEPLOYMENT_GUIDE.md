# MDM SEVA Portal - Deployment Guide

## Prerequisites

### Server Requirements
- **PHP:** 8.2 or higher
- **Web Server:** Nginx or Apache
- **Database:** MySQL 8.0+ or PostgreSQL 13+
- **Redis:** 6.0+ (for caching, sessions, queues)
- **Node.js:** 20 LTS
- **Composer:** 2.x
- **SSL Certificate:** Valid SSL/TLS certificate

### System Packages
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.2-fpm php8.2-mysql php8.2-redis php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd
sudo apt install nginx mysql-server redis-server
sudo apt install nodejs npm

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

## Step 1: Server Setup

### 1.1 Create Application User
```bash
sudo adduser mdmseva
sudo usermod -aG www-data mdmseva
```

### 1.2 Create Application Directory
```bash
sudo mkdir -p /var/www/mdmseva
sudo chown mdmseva:www-data /var/www/mdmseva
```

---

## Step 2: Clone and Configure Application

### 2.1 Clone Repository
```bash
cd /var/www/mdmseva
git clone https://github.com/your-org/mdmseva.git .
```

### 2.2 Install Dependencies
```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies
npm install

# Build frontend assets
npm run build
```

### 2.3 Configure Environment
```bash
# Copy production environment file
cp .env.production.example .env

# Generate application key
php artisan key:generate

# Edit .env with production values
nano .env
```

**Critical .env Settings:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=mdmseva_production
DB_USERNAME=mdmseva_user
DB_PASSWORD=your_secure_password

SESSION_DRIVER=redis
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true

CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=your_redis_password
```

### 2.4 Set Permissions
```bash
sudo chown -R mdmseva:www-data /var/www/mdmseva
sudo chmod -R 755 /var/www/mdmseva
sudo chmod -R 775 /var/www/mdmseva/storage
sudo chmod -R 775 /var/www/mdmseva/bootstrap/cache
```

---

## Step 3: Database Setup

### 3.1 Create Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE mdmseva_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mdmseva_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mdmseva_production.* TO 'mdmseva_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 Run Migrations
```bash
php artisan migrate --force
```

### 3.3 Seed Initial Data
```bash
php artisan db:seed --force
```

---

## Step 4: Nginx Configuration

### 4.1 Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/mdmseva
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/mdmseva/public;
    index index.php index.html;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers (additional to Laravel middleware)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/mdmseva-access.log;
    error_log /var/log/nginx/mdmseva-error.log;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/mdmseva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 5: SSL Certificate Setup

### 5.1 Install Certbot (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
```

### 5.2 Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5.3 Auto-renewal
```bash
sudo certbot renew --dry-run
```

---

## Step 6: Redis Configuration

### 6.1 Configure Redis
```bash
sudo nano /etc/redis/redis.conf
```

```conf
# Set password
requirepass your_redis_password

# Bind to localhost only
bind 127.0.0.1

# Enable persistence
save 900 1
save 300 10
save 60 10000
```

### 6.2 Restart Redis
```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## Step 7: Queue Worker Setup

### 7.1 Create Supervisor Configuration
```bash
sudo nano /etc/supervisor/conf.d/mdmseva-worker.conf
```

```ini
[program:mdmseva-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mdmseva/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=mdmseva
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/mdmseva/storage/logs/worker.log
stopwaitsecs=3600
```

### 7.2 Start Worker
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mdmseva-worker:*
```

---

## Step 8: Backup Configuration

### 8.1 Publish Backup Configuration
```bash
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

### 8.2 Configure Backup
Edit `config/backup.php`:
```php
'destination' => [
    'disks' => [
        'local',
        's3', // If using S3
    ],
],

'notifications' => [
    'mail' => [
        'to' => 'admin@yourdomain.com',
    ],
],
```

### 8.3 Schedule Backups
Add to `routes/console.php`:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:clean')->daily()->at('01:00');
Schedule::command('backup:run')->daily()->at('02:00');
```

### 8.4 Test Backup
```bash
php artisan backup:run
```

---

## Step 9: Monitoring Setup

### 9.1 Install Sentry
```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=your_sentry_dsn
```

### 9.2 Configure Log Rotation
```bash
sudo nano /etc/logrotate.d/mdmseva
```

```
/var/www/mdmseva/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 mdmseva www-data
    sharedscripts
}
```

---

## Step 10: Optimization

### 10.1 Cache Configuration
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 10.2 Enable OPcache
```bash
sudo nano /etc/php/8.2/fpm/conf.d/10-opcache.ini
```

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
```

### 10.3 Restart PHP-FPM
```bash
sudo systemctl restart php8.2-fpm
```

---

## Step 11: Final Checks

### 11.1 Run Tests
```bash
php artisan test
```

### 11.2 Check Application
```bash
php artisan about
php artisan optimize
```

### 11.3 Verify Permissions
```bash
php artisan storage:link
```

---

## Step 12: Post-Deployment

### 12.1 Submit Sitemap
- Update sitemap.xml with production domain
- Submit to Google Search Console

### 12.2 Monitor Logs
```bash
tail -f storage/logs/laravel.log
tail -f /var/log/nginx/mdmseva-error.log
```

### 12.3 Set Up Monitoring
- Configure UptimeRobot for uptime monitoring
- Set up Sentry alerts
- Configure backup notifications

---

## Deployment Checklist

- [ ] Server requirements met
- [ ] Application cloned and dependencies installed
- [ ] Environment configured (.env)
- [ ] Database created and migrated
- [ ] Nginx configured with SSL
- [ ] Redis configured and running
- [ ] Queue workers running (Supervisor)
- [ ] Backups configured and tested
- [ ] Monitoring setup (Sentry, logs)
- [ ] Caches optimized
- [ ] OPcache enabled
- [ ] Tests passing
- [ ] Sitemap submitted
- [ ] DNS configured
- [ ] Firewall configured
- [ ] Backup restoration tested

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Switch to previous release
cd /var/www/mdmseva
git checkout previous-tag

# 2. Reinstall dependencies
composer install --no-dev
npm install && npm run build

# 3. Clear caches
php artisan optimize:clear

# 4. Rollback database if needed
php artisan migrate:rollback

# 5. Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
sudo supervisorctl restart mdmseva-worker:*
```

---

## Maintenance Mode

```bash
# Enable maintenance mode
php artisan down --secret="your-secret-token"

# Perform updates
git pull
composer install --no-dev
npm install && npm run build
php artisan migrate --force
php artisan optimize

# Disable maintenance mode
php artisan up
```

---

## Support

For issues or questions:
- Check logs: `storage/logs/laravel.log`
- Review Sentry errors
- Contact: admin@yourdomain.com
