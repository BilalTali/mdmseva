# 🚀 Deployment Guide: MDM SEVA on Hostinger (Shared Hosting)

This guide details how to deploy your Laravel + React application to Hostinger Shared Hosting using GitHub.

## 📋 Prerequisites

1.  **GitHub Repository**: Your project code pushed to a GitHub repository.
2.  **Hostinger Account**: Access to hPanel.
3.  **SSH Access**: Enabled in your Hostinger account (recommended) or use Hostinger's Git feature.

---

## 🛠️ Step 1: Prepare Your Application Locally

Shared hosting environments often don't have `Node.js` or `NPM` installed, or they have limited RAM. The most reliable method is to **build your frontend assets locally** and commit them.

1.  **Build Frontend Assets**:
    Run this command in your local terminal to generate the production assets:
    ```bash
    npm run build
    ```

2.  **Update `.gitignore`**:
    By default, `public/build` is ignored. We need to un-ignore it so we can push the built assets to GitHub.
    
    Open `.gitignore` and find this line:
    ```gitignore
    /public/build
    ```
    Change it to (add a `!` or remove the line):
    ```gitignore
    !/public/build
    ```
    *Or simply remove the line entirely.*

3.  **Commit and Push**:
    ```bash
    git add .
    git commit -m "chore: build assets for production deployment"
    git push origin main
    ```

---

## 🗄️ Step 2: Set Up Database on Hostinger

1.  Log in to **Hostinger hPanel**.
2.  Go to **Databases** > **Management**.
3.  Create a New MySQL Database:
    *   **Database Name**: e.g., `u123456789_mdmseva`
    *   **MySQL Username**: e.g., `u123456789_admin`
    *   **Password**: *Create a strong password and save it.*
4.  Click **Create**.
5.  **Important**: Note down the **Database Name**, **Username**, and **Password**. You will need these for the `.env` file.

---

## ☁️ Step 3: Deploy Code to Hostinger

### Method A: Using Hostinger "Git" Feature (Easiest)

1.  In hPanel, go to **Advanced** > **Git**.
2.  **Repository**: Enter your GitHub repository URL (e.g., `https://github.com/username/repo.git`).
3.  **Branch**: `main`.
4.  **Directory**: Leave empty to deploy to `public_html`, or enter a subfolder name (e.g., `app`) if you want to keep the root clean. 
    *   *Recommendation*: Deploy to a subfolder like `mdmseva` (e.g., `domains/yourdomain.com/public_html/mdmseva`) or directly to `public_html` if it's the only site.
5.  Click **Create**. Hostinger will pull your code.

### Method B: Using SSH (Recommended for Control)

1.  **Enable SSH** in hPanel (under **Advanced** > **SSH Access**).
2.  Connect via terminal: `ssh u123456789@your-server-ip -P 65002` (copy command from hPanel).
3.  Navigate to your domain folder:
    ```bash
    cd domains/yourdomain.com/public_html
    ```
4.  Clone your repository:
    ```bash
    git clone https://github.com/yourusername/your-repo.git .
    ```
    *(Note: The `.` at the end clones into the current directory. Ensure the directory is empty first).*

---

## ⚙️ Step 4: Install Dependencies & Configure

You need to run these commands via **SSH** (Terminal).

1.  **Install PHP Dependencies**:
    Hostinger has Composer installed. Run:
    ```bash
    composer install --optimize-autoloader --no-dev
    ```

2.  **Setup Environment Variables**:
    *   Copy the example file:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file:
        ```bash
        nano .env
        ```
    *   **Update the following lines**:
        ```ini
        APP_NAME="MDM SEVA"
        APP_ENV=production
        APP_DEBUG=false
        APP_URL=https://yourdomain.com
        
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=u123456789_mdmseva  <-- Your Hostinger DB Name
        DB_USERNAME=u123456789_admin    <-- Your Hostinger DB User
        DB_PASSWORD=your_password       <-- Your Hostinger DB Password
        ```
    *   Press `Ctrl+O`, `Enter` to save, and `Ctrl+X` to exit.

3.  **Generate App Key**:
    ```bash
    php artisan key:generate
    ```

4.  **Run Migrations**:
    ```bash
    php artisan migrate --force
    ```

5.  **Link Storage**:
    ```bash
    php artisan storage:link
    ```

6.  **Cache Configuration**:
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

---

## 🌐 Step 5: Pointing the Domain (Critical)

Laravel serves files from the `public` folder, but Shared Hosting usually serves from the root (`public_html`).

### Option A: Change Document Root (Best)
If Hostinger allows it for your plan:
1.  Go to **Website** > **Domains**.
2.  Change the **Document Root** from `/public_html` to `/public_html/public`.

### Option B: .htaccess Rewrite (If Option A not available)
Create a `.htaccess` file in your **root** folder (`public_html`) with this content to redirect traffic to `public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

> [!IMPORTANT]
> **Critical File**: The `.htaccess` file in the project root is **essential** for the site to work on shared hosting. It redirects all requests to the `public/` folder.
> 
> - ✅ This file is now **tracked in Git** (at repository root)
> - ⚠️ **Never run** `git clean -fd` without understanding it will remove untracked files
> - 🔄 If the file gets deleted, the site will show `ERR_CONNECTION_TIMED_OUT`
> - 📝 The correct syntax includes `$1` to pass the URL path: `RewriteRule ^(.*)$ public/$1 [L]`

---

## ✅ Step 6: Verify Deployment

1.  Visit your website URL.
2.  You should see the Welcome page.
3.  Test logging in and checking the "Message from Developer" section.
4.  **Troubleshooting**:
    *   **500 Error**: Check `storage/logs/laravel.log`. Ensure permissions for `storage` and `bootstrap/cache` are set to `775` or `777`.
        ```bash
        chmod -R 775 storage bootstrap/cache
        ```

## 🔄 Updating in Future

When you make changes locally:
1.  `npm run build`
2.  `git push`
3.  Go to Hostinger **Git** section and click **Deploy** (or run `git pull` via SSH).
4.  Run `php artisan migrate --force` if you changed the database.
5.  **After deployment**, verify the root `.htaccess` file exists with correct content.

### Safe Deployment Commands (SSH)

```bash
# Navigate to project
cd domains/shayaan786.com/public_html

# Fetch latest changes
git fetch origin

# Reset to match remote branch (safer than git clean -fd)
git reset --hard origin/ui-fixes

# IMPORTANT: Verify .htaccess exists after reset
cat .htaccess

# If .htaccess is missing or incorrect, it should be in Git now
# But if needed, recreate it:
cat > .htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
EOF

# Cache Laravel configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
