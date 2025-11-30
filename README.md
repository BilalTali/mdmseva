# MDM SEVA Portal

**Mid-Day Meal Service Management System**

A comprehensive web application for managing school meal programs, tracking inventory, generating reports, and monitoring student nutrition.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [License](#license)

## 🎯 Overview

MDM SEVA Portal is a full-featured management system designed for the Mid-Day Meal (MDM) scheme in schools. It enables efficient tracking of:
- Student attendance and meal consumption
- Rice inventory management
- Financial expenditure reporting
- Bill generation for food and fuel
- Real-time analytics and insights

## ✨ Features

### For Schools
- **📊 Analytics Dashboard** - Real-time insights into meal programs
  - Rice balance tracking
  - Cost trend analysis  
  - Student attendance statistics
  - Monthly consumption graphs

- **🍚 Rice Management** - Comprehensive rice inventory system
  - Opening balance tracking
  - Rice lifted from government supply
  - Rice arranged from alternative sources
  - Daily consumption recording
  - Automatic balance calculation

- **💰 Amount Configuration** - Financial tracking
  - Configurable rates for food items
  - Salt subcategory breakdowns
  - Fuel cost tracking
  - Automatic total calculations

- **📅 Daily Consumption** - Record daily meal data
  - Student attendance by class
  - Rice consumption tracking
  - Date-wise reporting
  - Edit and delete within current month

- **📈 Reports** - Automated report generation
  - Rice consumption reports (monthly)
  - Amount expenditure reports (monthly)
  - PDF export with school details
  - Excel export for data analysis

- **💵 Bill Management** - Generate vendor bills
  - Kiryana (groceries) bills
  - Fuel bills  
  - Pre-filled from amount reports
  - Customizable line items

- **📝 Roll Statements** - Student enrollment tracking
  - Class-wise student counts
  - Boys/Girls breakdown
  - Month-wise tracking

- **💬 Support System** - Integrated helpdesk
  - Real-time chat with admin
  - AI-powered assistance
  - File attachments support
  - Typing indicators

### For Administrators
- **🏫 School Management** - Complete school oversight
  - View all schools and their data
  - Activate/deactivate schools
  - Delete schools with all data
  - Export school lists

- **📊 Admin Dashboard** - System-wide analytics
  - Total schools tracking
  - Active vs inactive schools
  - System-wide consumption statistics
  - Data export capabilities

- **💬 Support Management** - Handle user queries
  - View all support chats
  - AI assistance with manual override
  - Real-time notifications

- **🔧 System Configuration** - Platform settings
  - AI chat bot configuration
  - Developer messages for users
  - Knowledge base management

## 🛠 Technology Stack

### Backend
- **PHP 8.2+** - Server-side language
- **Laravel 12** - PHP framework
- **MySQL** - Database
- **Inertia.js** - Modern monolith architecture
- **Laravel Reverb** - WebSocket server for real-time features

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Headless UI** - Accessible components
- **Heroicons** - Icon library

### Additional Tools
- **Vite** - Frontend build tool
- **DomPDF** - PDF generation
- **Laravel Excel** - Excel export
- **Spatie Permissions** - Role management

## 📦 Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0
- Git

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/mdmseva.git
cd mdmseva
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 3. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Database
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mdmseva
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Run Migrations
```bash
# Run database migrations
php artisan migrate

# Seed initial data (districts, zones, admin user)
php artisan db:seed
```

### 6. Build Frontend
```bash
# Build for production
npm run build

# OR run development server
npm run dev
```

### 7. Start Application
```bash
# Start Laravel server
php artisan serve

# In another terminal, start queue worker (for async jobs)
php artisan queue:listen

# In another terminal, start WebSocket server (for real-time features)
php artisan reverb:start
```

Visit `http://localhost:8000`

### Default Admin Credentials
```
Email: admin@mdmseva.com
Password: Admin@123
```

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- GitHub deployment workflow
- Server requirements
- Production configuration
- SSL setup
- Performance optimization

## 👥 User Roles

### School
- Access own school data
- Record daily consumption
- Manage rice configurations
- Generate reports
- Create bills
- Submit support tickets

### Admin
- View all schools
- Access system-wide analytics
- Manage schools (activate/deactivate/delete)
- Handle support chats
- Configure system settings

## 📄 License

This project is proprietary software developed for the Mid-Day Meal scheme.

## 🤝 Support

For technical support or bug reports, please contact the system administrator.

---

**Made with ❤️ for better nutrition management in schools**
