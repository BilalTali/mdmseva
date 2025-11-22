# MDM SEVA Portal

**Mid-Day Meal Scheme Management System**

A comprehensive Laravel 12 application for managing the Mid-Day Meal Scheme with real-time tracking, reporting, and analytics.

---

## 🚀 Features

### Core Functionality
- **User Management** - Role-based access control (Admin, School)
- **Daily Consumption Tracking** - Record daily meal consumption by category
- **Rice Inventory Management** - Track rice stock, receipts, and consumption
- **Amount Configuration** - Manage cooking costs and financial allocations
- **Report Generation** - Automated PDF reports for rice and amount tracking
- **Bill Management** - Generate and track bills with itemized details
- **Support System** - Built-in chat support for users
- **Dashboard Analytics** - Real-time statistics and visualizations

### Technical Features
- **Modern Stack** - Laravel 12 + Inertia.js + React
- **Security** - Rate limiting, CSP, secure headers, strong password policy
- **Performance** - Redis caching, query optimization, browser caching
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Real-time Updates** - Live data synchronization
- **PDF Generation** - Professional report templates
- **Data Visualization** - Interactive charts with Recharts

---

## 📋 Requirements

- **PHP:** 8.2 or higher
- **Composer:** 2.x
- **Node.js:** 20 LTS
- **Database:** MySQL 8.0+ or PostgreSQL 13+
- **Redis:** 6.0+ (for caching, sessions, queues)
- **Web Server:** Nginx or Apache

---

## 🛠️ Installation

### Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/your-org/mdmseva.git
cd mdmseva
```

2. **Install Dependencies**
```bash
composer install
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure Database**
Edit `.env`:
```env
DB_CONNECTION=sqlite
# Or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_DATABASE=mdmseva
# DB_USERNAME=root
# DB_PASSWORD=
```

5. **Run Migrations**
```bash
php artisan migrate
php artisan db:seed
```

6. **Build Assets**
```bash
npm run dev
```

7. **Start Development Server**
```bash
composer run dev
```

This starts:
- Laravel server (http://localhost:8000)
- Queue worker
- Log viewer
- Vite dev server

---

## 🚢 Production Deployment

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Quick Production Setup

1. **Install Dependencies**
```bash
composer install --no-dev --optimize-autoloader
npm install && npm run build
```

2. **Configure Environment**
```bash
cp .env.production.example .env
php artisan key:generate
# Edit .env with production values
```

3. **Optimize Application**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

4. **Set Permissions**
```bash
chmod -R 775 storage bootstrap/cache
```

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

---

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Comprehensive Audit Report](docs/COMPREHENSIVE_AUDIT_REPORT.md) - Security and quality audit
- [Realtime System Documentation](REALTIME_SYSTEM_DOCUMENTATION.md) - System architecture

---

## 🔒 Security

### Implemented Security Features
- ✅ Rate limiting on authentication endpoints
- ✅ Strong password policy (12+ chars, complexity requirements)
- ✅ Content Security Policy (CSP)
- ✅ Secure headers (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ CSRF protection
- ✅ SQL injection prevention (Eloquent ORM)
- ✅ XSS prevention
- ✅ Session encryption (production)

### Security Checklist
- [ ] SSL/TLS certificate installed
- [ ] Firewall configured
- [ ] Regular security audits scheduled
- [ ] Backup system configured
- [ ] Error monitoring (Sentry) setup

---

## 🎨 Tech Stack

### Backend
- **Framework:** Laravel 12
- **PHP:** 8.2+
- **Database:** MySQL/PostgreSQL/SQLite
- **Cache:** Redis
- **Queue:** Redis
- **PDF:** DomPDF
- **Permissions:** Spatie Laravel Permission

### Frontend
- **Framework:** React 18.2
- **Router:** Inertia.js 2.0
- **Styling:** Tailwind CSS 3.2
- **UI Components:** Headless UI
- **Charts:** Recharts
- **Icons:** Heroicons
- **Build Tool:** Vite 7

### Development Tools
- **Code Quality:** PHPStan, Laravel Pint
- **Testing:** PHPUnit
- **Linting:** ESLint
- **Version Control:** Git

---

## 📊 Project Structure

```
mdmseva/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Application controllers
│   │   ├── Middleware/      # Custom middleware
│   │   └── Requests/        # Form request validation
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic services
│   └── Rules/               # Custom validation rules
├── database/
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Database seeders
│   └── factories/           # Model factories
├── resources/
│   ├── js/
│   │   ├── Components/      # React components
│   │   ├── Layouts/         # Page layouts
│   │   └── Pages/           # Inertia pages
│   ├── css/                 # Stylesheets
│   └── views/               # Blade templates (PDF)
├── routes/
│   ├── web.php              # Web routes
│   ├── api.php              # API routes
│   └── auth.php             # Authentication routes
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
└── docs/                    # Documentation
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow PSR-12 coding standards
- Write tests for new features
- Update documentation as needed
- Run `composer run quality` before committing

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

**Development Team**
- Project Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- QA Engineer: [Name]

---

## 📞 Support

For issues or questions:
- **Email:** support@yourdomain.com
- **Documentation:** [docs/](docs/)
- **Issue Tracker:** GitHub Issues

---

## 🔄 Changelog

### Version 1.0.0 (2025-11-19)
- Initial release
- Core MDM tracking functionality
- Rice and amount management
- PDF report generation
- Security hardening
- Performance optimization

---

## 🙏 Acknowledgments

- Laravel Framework
- React Community
- Inertia.js Team
- Tailwind CSS
- All contributors

---

**Built with ❤️ for the Mid-Day Meal Scheme**
