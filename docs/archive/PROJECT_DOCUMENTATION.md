# MDM SEVA - Mid-Day Meal Scheme Management System
## Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** November 29, 2025 (Rice Configuration Refactoring)  
**Framework:** Laravel 12 + React 18 + Inertia.js 2.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Backend Components](#5-backend-components)
6. [Frontend Components](#6-frontend-components)
7. [API Routes & Endpoints](#7-api-routes--endpoints)
8. [Core Features](#8-core-features)
9. [Configuration & Setup](#9-configuration--setup)
10. [Security Implementation](#10-security-implementation)

---

## 1. Project Overview

### 1.1 Purpose
MDM SEVA is a comprehensive web application for managing the **Mid-Day Meal Scheme** in educational institutions across Jammu and Kashmir. The system enables schools to track daily meal consumption, manage rice inventory, generate reports, handle bills, and communicate with administrators.

### 1.2 Key Objectives
- **Digital Tracking:** Replace manual record-keeping with automated digital tracking
- **Transparency:** Provide real-time visibility into meal distribution and resource usage
- **Compliance:** Generate compliant reports for government submission
- **Efficiency:** Streamline bill generation and inventory management
- **Support:** Offer AI-powered assistance for user queries

### 1.3 User Roles
- **Admin:** Full system access, manage all schools, view consolidated reports
- **School:** Manage own data, track consumption, generate reports and bills

---

## 2. Technology Stack

### 2.1 Backend
- **Framework:** Laravel 12 (PHP 8.2+)
- **Database:** MySQL 8.0+ / PostgreSQL 13+ / SQLite
- **Cache/Queue:** Redis 6.0+
- **PDF Generation:** DomPDF (barryvdh/laravel-dompdf)
- **Authentication:** Laravel Breeze + Sanctum
- **Permissions:** Spatie Laravel Permission
- **Real-time:** Laravel Reverb (WebSockets)
- **AI Integration:** Google Gemini API

### 2.2 Frontend
- **Framework:** React 18.2
- **Router:** Inertia.js 2.0
- **Styling:** Tailwind CSS 3.2
- **UI Components:** Headless UI, Radix UI
- **Charts:** Recharts
- **Icons:** Heroicons, Lucide React
- **Build Tool:** Vite 7

### 2.3 Development Tools
- **Code Quality:** PHPStan, Laravel Pint
- **Linting:** ESLint
- **Package Manager:** Composer (PHP), NPM (JS)

---

## 3. System Architecture

### 3.1 Architecture Pattern
The application follows a **layered MVC architecture** with additional service layer:

```
┌─────────────────────────────────────────┐
│         Frontend (React/Inertia)        │
│  ├─ Pages (Route Components)            │
│  ├─ Layouts (Authenticated/Guest)       │
│  └─ Components (Reusable UI)            │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON (Inertia Protocol)
┌──────────────▼──────────────────────────┐
│      Controllers (Route Handlers)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Services (Business Logic)        │
│  ├─ ConsumptionCalculationService       │
│  ├─ RiceReportService                   │
│  ├─ AmountReportService                 │
│  ├─ AIAgentService                      │
│  └─ SchoolDataContextService            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Models (Eloquent ORM)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Database (MySQL/SQLite)        │
└─────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
mdmseva/
├── app/
│   ├── Events/              # Broadcast events
│   ├── Exceptions/          # Custom exception handlers
│   ├── Http/
│   │   ├── Controllers/     # Request handlers
│   │   │   ├── Admin/       # Admin-specific controllers
│   │   │   ├── Api/         # API controllers
│   │   │   └── Auth/        # Authentication controllers
│   │   ├── Middleware/      # Custom middleware
│   │   └── Requests/        # Form request validation
│   ├── Listeners/           # Event listeners
│   ├── Models/              # Eloquent models (23 models)
│   ├── Notifications/       # Email/SMS notifications
│   ├── Observers/           # Model observers
│   ├── Providers/           # Service providers
│   ├── Rules/               # Custom validation rules
│   └── Services/            # Business logic (8 services)
├── bootstrap/               # App initialization
├── config/                  # Configuration files
├── database/
│   ├── factories/           # Model factories
│   ├── migrations/          # Database migrations (18 files)
│   └── seeders/             # Database seeders
├── public/                  # Public assets
├── resources/
│   ├── css/                 # Stylesheets
│   ├── js/
│   │   ├── Components/      # React components
│   │   ├── Layouts/         # Page layouts
│   │   └── Pages/           # Inertia pages
│   └── views/               # Blade templates (PDF generation)
├── routes/
│   ├── api.php              # API routes
│   ├── auth.php             # Auth routes
│   ├── channels.php         # Broadcast channels
│   ├── console.php          # CLI commands
│   └── web.php              # Web routes (522 lines)
└── storage/                 # Logs, cache, uploads
```

---

## 4. Database Schema

### 4.1 Core Tables

#### 4.1.1 Users & Authentication
```sql
-- users: School/Admin user accounts
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(15),
    date_of_birth DATE,
    address VARCHAR(500),
    udise_code VARCHAR(20) UNIQUE, -- School identifier
    school_name VARCHAR(255),
    school_type ENUM('primary', 'middle', 'secondary', 'senior_secondary'),
    institute_address VARCHAR(255),
    school_pincode VARCHAR(10),
    state VARCHAR(255) DEFAULT 'Jammu and Kashmir',
    district VARCHAR(255),
    zone VARCHAR(255),
    district_id BIGINT,
    zone_id BIGINT,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);
```

#### 4.1.2 Location Tables
```sql
-- districts: Districts in Jammu & Kashmir
CREATE TABLE districts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    code VARCHAR(10) UNIQUE,
    state VARCHAR(255) DEFAULT 'Jammu and Kashmir',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- zones: Zones within districts
CREATE TABLE zones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    district_id BIGINT,
    name VARCHAR(255),
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE KEY (district_id, name)
);
```

#### 4.1.3 Roll Statements
```sql
-- roll_statements: Student enrollment by class
CREATE TABLE roll_statements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    udise VARCHAR(20), -- Links to users.udise_code
    date DATE,
    class VARCHAR(10), -- e.g., 'KG', '1', '2', ..., '8'
    boys INT DEFAULT 0,
    girls INT DEFAULT 0,
    total INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX (udise, date)
);
```

#### 4.1.4 Rice Management
```sql
-- monthly_rice_configurations: Monthly rice inventory tracking
CREATE TABLE monthly_rice_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    month INT, -- 1-12
    year INT,
    -- Opening balances
    opening_balance_primary DECIMAL(10,2) DEFAULT 0,
    opening_balance_upper_primary DECIMAL(10,2) DEFAULT 0,
    -- Rice lifted/arranged during month
    rice_lifted_primary DECIMAL(10,2) DEFAULT 0,
    rice_lifted_upper_primary DECIMAL(10,2) DEFAULT 0,
    rice_arranged_primary DECIMAL(10,2) DEFAULT 0,
    rice_arranged_upper_primary DECIMAL(10,2) DEFAULT 0,
    -- Consumption rates (grams per student)
    daily_consumption_primary INT DEFAULT 100,
    daily_consumption_upper_primary INT DEFAULT 150,
    -- Calculated consumed amounts
    rice_consumed_primary DECIMAL(10,2) DEFAULT 0,
    rice_consumed_upper_primary DECIMAL(10,2) DEFAULT 0,
    -- Closing balances
    closing_balance_primary DECIMAL(10,2) DEFAULT 0,
    closing_balance_upper_primary DECIMAL(10,2) DEFAULT 0,
    -- Completion status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, month, year)
);

-- rice_inventory_activities: Rice stock transaction log
CREATE TABLE rice_inventory_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    monthly_rice_configuration_id BIGINT,
    type ENUM('opening', 'lifted', 'arranged', 'consumed', 'closing'),
    section ENUM('primary', 'upper_primary'),
    quantity DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    description TEXT,
    date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (monthly_rice_configuration_id) REFERENCES monthly_rice_configurations(id)
);
```

#### 4.1.5 Amount Configuration
```sql
#### 4.1.5 Amount Configuration
```sql
-- monthly_amount_configurations: Monthly cooking cost rates and totals
CREATE TABLE monthly_amount_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    month INT,
    year INT,
    -- Primary Rates (Classes I-V)
    daily_pulses_primary DECIMAL(8,2),
    daily_vegetables_primary DECIMAL(8,2),
    daily_oil_primary DECIMAL(8,2),
    daily_salt_primary DECIMAL(8,2),
    daily_fuel_primary DECIMAL(8,2),
    -- Middle Rates (Classes VI-VIII)
    daily_pulses_middle DECIMAL(8,2),
    daily_vegetables_middle DECIMAL(8,2),
    daily_oil_middle DECIMAL(8,2),
    daily_salt_middle DECIMAL(8,2),
    daily_fuel_middle DECIMAL(8,2),
    -- Unified Salt Percentages
    salt_percentage_common DECIMAL(5,2) DEFAULT 30,
    salt_percentage_chilli DECIMAL(5,2) DEFAULT 20,
    salt_percentage_turmeric DECIMAL(5,2) DEFAULT 20,
    salt_percentage_coriander DECIMAL(5,2) DEFAULT 15,
    salt_percentage_other DECIMAL(5,2) DEFAULT 15,
    -- Calculated Totals
    daily_amount_per_student_primary DECIMAL(10,2),
    daily_amount_per_student_upper_primary DECIMAL(10,2),
    -- Completion Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    completed_by BIGINT,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, month, year)
);
```
```

#### 4.1.6 Daily Consumption
```sql
-- daily_consumptions: Daily meal tracking
CREATE TABLE daily_consumptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    date DATE,
    day VARCHAR(20), -- Day name (Monday, Tuesday, etc.)
    served_primary INT DEFAULT 0, -- Students served (Classes I-V)
    served_middle INT DEFAULT 0, -- Students served (Classes VI-VIII)
    rice_consumed DECIMAL(10,2), -- Total rice consumed (kg)
    rice_balance_after DECIMAL(10,2), -- Rice balance after consumption
    amount_consumed DECIMAL(10,2), -- Total cooking cost
    remarks TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, date)
);
```

#### 4.1.7 Reports
```sql
-- rice_reports: Monthly rice consumption reports
CREATE TABLE rice_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    month INT,
    year INT,
    total_days INT,
    total_rice_consumed DECIMAL(10,2),
    average_daily_consumption DECIMAL(10,2),
    opening_balance DECIMAL(10,2),
    closing_balance DECIMAL(10,2),
    pdf_path VARCHAR(255),
    report_data JSON, -- Full report data
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, month, year)
);

-- amount_reports: Monthly cooking cost reports
CREATE TABLE amount_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    month INT,
    year INT,
    total_days INT,
    total_amount DECIMAL(10,2),
    total_primary_amount DECIMAL(10,2),
    total_middle_amount DECIMAL(10,2),
    breakdown JSON, -- Detailed item-wise breakdown
    pdf_path VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, month, year)
);
```

#### 4.1.8 Bills
```sql
-- bills: Kiryana and Fuel bills
CREATE TABLE bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    amount_report_id BIGINT,
    type ENUM('kiryana', 'fuel'),
    bill_number VARCHAR(50),
    bill_date DATE,
    vendor_name VARCHAR(255),
    total_amount DECIMAL(10,2),
    gst_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    pdf_path VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (amount_report_id) REFERENCES amount_reports(id)
);

-- bill_items: Individual items in bills
CREATE TABLE bill_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bill_id BIGINT,
    item_name VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    rate DECIMAL(10,2),
    amount DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);
```

#### 4.1.9 Support System
```sql
-- support_chats: Support chat conversations
CREATE TABLE support_chats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    subject VARCHAR(255),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    assigned_to BIGINT, -- Admin user ID
    last_message_at TIMESTAMP,
    ai_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- support_messages: Chat messages
CREATE TABLE support_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    support_chat_id BIGINT,
    user_id BIGINT,
    message TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_ai_generated BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (support_chat_id) REFERENCES support_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- message_attachments: File attachments for messages
CREATE TABLE message_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    support_message_id BIGINT,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    filesize INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (support_message_id) REFERENCES support_messages(id) ON DELETE CASCADE
);
```

#### 4.1.10 AI Configuration
```sql
-- ai_configurations: AI agent settings
CREATE TABLE ai_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    is_active BOOLEAN DEFAULT true,
    system_prompt TEXT,
    model_name VARCHAR(100) DEFAULT 'gemini-2.5-flash',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INT DEFAULT 1024,
    auto_respond BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ai_knowledge_base: PDF documents for AI context
CREATE TABLE ai_knowledge_base (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    content LONGTEXT, -- Extracted PDF text
    is_active BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### 4.1.11 Additional Tables
```sql
-- feedback: User feedback
CREATE TABLE feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    category VARCHAR(100),
    message TEXT,
    rating INT, -- 1-5 stars
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    admin_response TEXT,
    district VARCHAR(255),
    zone VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- developer_messages: System-wide announcements
CREATE TABLE developer_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    message TEXT,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_active BOOLEAN DEFAULT true,
    team_member_name VARCHAR(255),
    team_member_role VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- month_completions: Track completed months (deprecated)
CREATE TABLE month_completions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    month INT,
    year INT,
    completion_type ENUM('rice', 'amount'),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (user_id, month, year, completion_type)
);
```

### 4.2 Spatie Permission Tables
```sql
-- roles: User roles
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    guard_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- permissions: System permissions
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    guard_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- model_has_roles: User-role assignments
CREATE TABLE model_has_roles (
    role_id BIGINT,
    model_type VARCHAR(255),
    model_id BIGINT,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- role_has_permissions: Role-permission assignments
CREATE TABLE role_has_permissions (
    permission_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## 5. Backend Components

### 5.1 Models (23 Total)

**Core Models:**
- `User` - User accounts with school/admin differentiation
- `District` - District locations
- `Zone` - Zone locations within districts
- `RollStatement` - Student enrollment records

**Rice Management:**
- `MonthlyRiceConfiguration` - Monthly rice inventory with automatic balance carry-forward
- `RiceInventoryActivity` - Rice transaction log
- `RiceReport` - Monthly rice reports (uses month-specific configuration)

**Amount Management:**
- `MonthlyAmountConfiguration` - Monthly cooking cost rates and totals
- `AmountReport` - Monthly amount reports

**Daily Operations:**
- `DailyConsumption` - Daily meal tracking
- `MonthlyConfiguration` - Monthly master configuration (deprecated)
- `MonthCompletion` - Month completion tracking

**Bills:**
- `Bill` - Kiryana and fuel bills
- `BillItem` - Individual bill line items

**Support System:**
- `SupportChat` - Chat conversations
- `SupportMessage` - Individual messages
- `MessageAttachment` - File attachments

**AI System:**
- `AIConfiguration` - AI agent settings
- `AIKnowledgeBase` - PDF knowledge base

**Miscellaneous:**
- `Feedback` - User feedback
- `DeveloperMessage` - System announcements
- `Role` - User roles (Spatie)

### 5.2 Controllers (15+ Total)

**School Controllers:**
- `DashboardController` - School dashboard
- `ProfileController` - User profile management
- `RollStatementController` - Roll statement CRUD
- `MonthlyRiceConfigurationController` - Rice configuration
- `AmountConfigurationController` - Amount configuration
- `DailyConsumptionController` - Daily consumption tracking
- `RiceReportController` - Rice report generation
- `AmountReportController` - Amount report generation
- `BillController` - Bill generation
- `SupportChatController` - User support chat

**Admin Controllers:**
- `Admin\DashboardController` - Admin dashboard
- `Admin\SchoolsController` - School management
- `Admin\ReportsController` - Consolidated reports
- `Admin\SupportChatController` - Admin chat handling
- `Admin\FeedbackController` - Feedback management
- `Admin\DeveloperMessageController` - Announcements
- `Admin\AIConfigurationController` - AI settings
- `Admin\RealtimeDashboardController` - Real-time stats

**API Controllers:**
- `Api\DashboardApiController` - Dashboard data endpoints

### 5.3 Services (8 Total)

**`ConsumptionCalculationService`**
- Calculates rice consumption based on students served and configured rates
- Calculates amount breakdown for all food items
- Handles salt sub-category calculations
- ✅ Updated getOpeningBalanceForDate() to use month-specific MonthlyRiceConfiguration
- Used by: DailyConsumptionController, ReportControllers

**`RiceReportService`**
- Generates monthly rice reports using month-specific configuration
- Aggregates daily consumption data for the specific month
- Calculates opening/closing balances from MonthlyRiceConfiguration
- Creates PDF reports
- ✅ Updated to use month-specific config instead of global 'latest'

**`AmountReportService`**
- Generates monthly amount reports
- Computes item-wise expenditure using monthly configuration
- Handles unified salt breakdown aggregation
- Creates PDF reports

**`AmountBillComposer`**
- Pre-fills bill items based on amount report data
- Separates Kiryana items (pulses, vegetables, oil, salt) from fuel
- Calculates totals and GST

**`AIAgentService`**
- Handles AI chat responses using Gemini API
- Builds conversation context with knowledge base
- Generates intelligent responses to user queries

**`SchoolDataContextService`**
- Formats school data for AI context
- Provides enrollment, consumption, and configuration data
- Enables AI to answer data-specific questions

**`CacheService`**
- Manages Redis caching for performance
- Caches frequently accessed data (districts, zones, configurations)
- Handles cache invalidation

**`PDFParserService`**
- Extracts text from uploaded PDF files
- Used for AI knowledge base content extraction

### 5.4 Middleware

**Custom Middleware:**
- `ActiveUserMiddleware` - Ensures user account is active
- `RoleMiddleware` - Role-based access control

**Laravel Default:**
- Authentication, CSRF protection, throttling, etc.

### 5.5 Events & Listeners

**Events:**
- `MessageSent` - Broadcast support chat messages
- `TypingEvent` - Broadcast typing indicators

**Listeners:**
- `SendMessageNotification` - Notify users of new messages

### 5.6 Observers

**`AIConfigurationObserver`**
- Ensures only one active AI configuration exists
- Deactivates other configs when new one is activated

**`MonthlyAmountConfigurationObserver`**
- Calculates totals on save
- Marks reports as stale when configuration changes

---

## 6. Frontend Components

### 6.1 Page Components (13 Directories)

**Authentication:**
- `Auth/Login.jsx`
- `RollStatements/Index.jsx` - List roll statements
- `RollStatements/Create.jsx` - Create roll statement

**Rice Configuration:**
- `MonthlyRiceConfiguration/Index.jsx` - Rice config dashboard
- `MonthlyRiceConfiguration/Create.jsx` - Create month
- `MonthlyRiceConfiguration/Edit.jsx` - Edit month
- `MonthlyRiceConfiguration/CreateNext.jsx` - Create next month

**Amount Configuration:**
- `AmountConfiguration/Index.jsx` - List configs
- `AmountConfiguration/Create.jsx` - Create/edit config

**Daily Consumption:**
- `DailyConsumption/Index.jsx` - Month selector
- `DailyConsumption/List.jsx` - Daily consumption list
- `DailyConsumption/Create.jsx` - Add consumption entry

**Reports:**
- `RiceReport/Index.jsx` - List rice reports
- `RiceReport/Create.jsx` - Generate rice report
- `RiceReport/Show.jsx` - View rice report
- `AmountReport/Index.jsx` - List amount reports
- `AmountReport/Create.jsx` - Generate amount report
- `AmountReport/Show.jsx` - View amount report

**Bills:**
- `Bills/Create.jsx` - Create bill (Kiryana/Fuel)
- `Bills/Show.jsx` - View bill

**Admin Pages:**
- `Admin/Schools/Index.jsx` - Manage schools
- `Admin/Schools/Show.jsx` - School details
- `Admin/Reports/*.jsx` - Admin reports views
- `Admin/Feedback/Index.jsx` - Feedback management
- `Admin/DeveloperMessages/*.jsx` - Announcement management
- `Admin/AIConfiguration/Index.jsx` - AI settings
- `Admin/Realtime/Index.jsx` - Real-time dashboard

**Legal:**
- `Legal/PrivacyPolicy.jsx`
- `Legal/TermsOfService.jsx`
- `Legal/CookiePolicy.jsx`
- `Legal/About.jsx`
- `Legal/Contact.jsx`
- `Legal/AccessibilityStatement.jsx`

**`AdminLayout.jsx`** (if separate)
- Admin-specific layout with admin navigation

### 6.3 Reusable UI Components

**Navigation:**
- `Sidebar.jsx` - Main navigation sidebar
- `AdminNavigation.jsx` - Admin navigation menu
- `NavLink.jsx` - Navigation links
- `ResponsiveNavLink.jsx` - Mobile navigation links
- `Dropdown.jsx` - Dropdown menus

**Forms:**
- `TextInput.jsx` - Text input fields
- `InputLabel.jsx` - Form labels
- `InputError.jsx` - Validation error messages
- `Checkbox.jsx` - Checkbox inputs
- `Forms/SelectInput.jsx` - Select dropdowns
- `Forms/FormField.jsx` - Generic form field wrapper

**Buttons:**
- `PrimaryButton.jsx` - Primary action buttons
- `SecondaryButton.jsx` - Secondary buttons
- `DangerButton.jsx` - Destructive actions
- `AccessibleButton.jsx` - Accessible button component

**UI Elements:**
- `Modal.jsx` - Modal dialogs
- `ThemeToggle.jsx` - Dark/light mode toggle
- `Footer.jsx` - Footer component
- `ApplicationLogo.jsx` - App logo
- `AuthLogo.jsx` - Auth page logo

**Dashboard Specific:**
- `RealtimeStats.jsx` - Real-time statistics display
- `DeveloperMessageCard.jsx` - System announcement card

**Daily Consumption:**
- 29 sub-components for daily consumption form
- `DailyConsumption/DatePickerField.jsx`
- `DailyConsumption/StudentInputCard.jsx`
- `DailyConsumption/InfoTile.jsx`
- etc.

**Support Chat:**
- `SupportChatWidget.jsx` - User chat widget
- `AdminSupportChatWidget.jsx` - Admin chat interface

**Welcome Page:**
- `Welcome/HeroSection.jsx`
- `Welcome/FeaturesSection.jsx`
- `Welcome/TestimonialsSection.jsx`
- `Welcome/CTASection.jsx`
- etc.

**Admin Components:**
- `Admin/SchoolsTable.jsx`
- `Admin/ReportsTable.jsx`
- `Admin/StatsCard.jsx`

**UI Library (Radix/Shadcn):**
- `ui/label.jsx`
- `ui/button.jsx`
- `ui/card.jsx`
- `ui/dialog.jsx`
- `ui/input.jsx`
- `ui/select.jsx`
- `ui/toast.jsx`

---

## 7. API Routes & Endpoints

### 7.1 Public Routes

```
GET  /                          - Landing page
GET  /privacy-policy            - Privacy policy
GET  /terms-of-service          - Terms of service
GET  /cookie-policy             - Cookie policy
GET  /about                     - About page
GET  /contact                   - Contact page
GET  /accessibility-statement   - Accessibility statement
GET  /user-guide                - User guide (HTML)
GET  /user-guide/pdf            - User guide (PDF download)
GET  /api/developer-message     - Get active developer message
```

### 7.2 Authentication Routes

```
GET  /login                     - Login page
POST /login                     - Login submit
POST /logout                    - Logout
GET  /register                  - Registration page
POST /register                  - Registration submit
GET  /forgot-password           - Forgot password page
POST /forgot-password           - Send reset link
GET  /reset-password/{token}    - Reset password page
POST /reset-password            - Reset password submit
GET  /verify-email              - Email verification notice
GET  /verify-email/{id}/{hash}  - Verify email
POST /email/verification-notification - Resend verification
```

### 7.3 School User Routes (Protected: auth, active)

**Dashboard:**
```
GET  /dashboard                 - School dashboard
GET  /api/dashboard/summary     - Dashboard summary stats
GET  /api/dashboard/rice-balance-timeseries - Rice balance chart data
GET  /api/dashboard/daily-amount-chart - Daily amount chart
GET  /api/dashboard/amount-breakdown - Amount breakdown
GET  /api/dashboard/recent-consumptions - Recent consumption records
GET  /api/dashboard/activity-feed - Activity feed
```

**Profile:**
```
GET    /profile                - Profile edit page
PATCH  /profile                - Update profile
DELETE /profile                - Delete account
```

**Roll Statements:**
```
GET    /roll-statements              - List roll statements
GET    /roll-statements/create       - Create page
POST   /roll-statements              - Store roll statement
GET    /roll-statements/{id}         - View roll statement
GET    /roll-statements/{id}/edit    - Edit page
PUT    /roll-statements/{id}         - Update roll statement
DELETE /roll-statements/{id}         - Delete roll statement
GET    /roll-statements/pdf          - Download PDF
```

**Monthly Rice Configuration:**
```
GET  /monthly-rice-config                - Rice config dashboard
GET  /monthly-rice-config/create         - Create new month page
POST /monthly-rice-config                - Store new month
GET  /monthly-rice-config/edit           - Edit month page
PUT  /monthly-rice-config                - Update month
POST /monthly-rice-config/add-rice-lifted - Add rice lifted
POST /monthly-rice-config/add-rice-arranged - Add rice arranged
POST /monthly-rice-config/sync-consumed  - Sync consumed rice
POST /monthly-rice-config/toggle-lock    - Lock/unlock month
POST /monthly-rice-config/complete-month - Complete month
GET  /monthly-rice-config/create-next    - Create next month page
POST /monthly-rice-config/store-next     - Store next month
```

**Amount Configuration:**
```
GET    /amount-config              - List configurations
GET    /amount-config/create       - Create page
POST   /amount-config              - Store configuration
GET    /amount-config/{id}/edit    - Edit page
PUT    /amount-config/{id}         - Update configuration
DELETE /amount-config/{id}         - Delete configuration
POST   /amount-config/confirm      - Confirm configuration
```

**Daily Consumption:**
```
GET    /daily-consumptions              - Month selector
GET    /daily-consumptions/select-month - Handle month selection
GET    /daily-consumptions/list         - List for selected month
GET    /daily-consumptions/create       - Create page
POST   /daily-consumptions              - Store consumption
GET    /daily-consumptions/{id}/edit    - Edit page
PUT    /daily-consumptions/{id}         - Update consumption
DELETE /daily-consumptions/{id}         - Delete consumption
GET    /daily-consumptions/{id}         - View consumption
```

**Rice Reports:**
```
GET    /rice-reports                    - List reports
GET    /rice-reports/create             - Create report page
POST   /rice-reports                    - Generate report
GET    /rice-reports/find-report        - Find existing report
GET    /rice-reports/{id}               - View report
GET    /rice-reports/{id}/view-pdf      - View PDF in browser
GET    /rice-reports/{id}/generate-pdf  - Download PDF
POST   /rice-reports/{id}/regenerate    - Regenerate report
DELETE /rice-reports/{id}               - Delete report
```

**Amount Reports:**
```
GET    /amount-reports                    - List reports
GET    /amount-reports/create             - Create report page
POST   /amount-reports                    - Generate report
GET    /amount-reports/find-report        - Find existing report
GET    /amount-reports/{id}               - View report
GET    /amount-reports/{id}/view-pdf      - View PDF in browser
GET    /amount-reports/{id}/generate-pdf  - Download PDF
POST   /amount-reports/{id}/regenerate    - Regenerate report
DELETE /amount-reports/{id}               - Delete report
```

**Bills (nested under amount reports):**
```
GET  /amount-reports/{reportId}/bills              - List bills
GET  /amount-reports/{reportId}/bills/create/{type} - Create bill (kiryana/fuel)
POST /bills                                         - Store bill
GET  /bills/{id}                                    - View bill
GET  /bills/{id}/pdf                                - Download PDF
GET  /bills/{id}/view-pdf                           - View PDF in browser
DELETE /bills/{id}                                  - Delete bill
```

**User Support Chat (API):**
```
GET  /api/support-chat           - Get user's chats
POST /api/support-chat/message   - Send message
POST /api/support-chat/upload    - Upload attachment
POST /api/support-chat/typing    - Send typing indicator
POST /api/support-chat/{id}/read - Mark chat as read
POST /api/support-chat/{id}/close - Close chat
GET  /api/support-chat/unread-count - Get unread count
```

### 7.4 Admin Routes (Protected: auth, role:admin)

**Admin Dashboard:**
```
GET  /admin/dashboard        - Admin dashboard
GET  /admin/dashboard/export - Export dashboard data
```

**Real-time Dashboard:**
```
GET  /admin/realtime              - Real-time dashboard page
GET  /admin/realtime/stats        - Real-time stats
GET  /admin/realtime/health       - System health
GET  /admin/realtime/activity     - Recent activity
GET  /admin/realtime/sessions     - Live sessions
GET  /admin/realtime/performance  - Performance metrics
```

**Schools Management:**
```
GET    /admin/schools           - List all schools
GET    /admin/schools/{id}      - View school details
PATCH  /admin/schools/{id}      - Update school
POST   /admin/schools/{id}/activate - Activate school
POST   /admin/schools/{id}/deactivate - Deactivate school
GET    /admin/export/schools    - Export schools data
```

**Admin Reports:**
```
GET  /admin/rice-reports              - All rice reports
GET  /admin/rice-reports/{id}         - View rice report
GET  /admin/export/rice-reports       - Export rice reports
GET  /admin/amount-reports            - All amount reports
GET  /admin/amount-reports/{id}       - View amount report
GET  /admin/export/amount-reports     - Export amount reports
GET  /admin/daily-consumptions        - All daily consumptions
GET  /admin/export/daily-consumptions - Export consumptions
GET  /admin/bills                     - All bills
GET  /admin/bills/{id}                - View bill
GET  /admin/export/bills              - Export bills
```

**Feedback Management:**
```
GET    /admin/feedback                  - List feedback
GET    /admin/feedback/{id}             - View feedback
PATCH  /admin/feedback/{id}/status      - Update status
POST   /admin/feedback/{id}/respond     - Respond to feedback
POST   /admin/feedback/bulk-update      - Bulk update
GET    /admin/feedback/analytics/data   - Feedback analytics
```

**Developer Messages:**
```
GET    /admin/developer-messages        - List messages (resource)
POST   /admin/developer-messages        - Create message
GET    /admin/developer-messages/{id}   - View message
PUT    /admin/developer-messages/{id}   - Update message
DELETE /admin/developer-messages/{id}   - Delete message
```

**AI Configuration:**
```
GET    /admin/ai-config                 - AI settings page
POST   /admin/ai-config/update          - Update AI config
POST   /admin/ai-config/upload-pdf      - Upload PDF to knowledge base
POST   /admin/ai-config/toggle-pdf/{id} - Toggle PDF active status
DELETE /admin/ai-config/delete-pdf/{id} - Delete PDF
POST   /admin/ai-config/test-ai         - Test AI connection
```

**Admin Support Chat (API):**
```
GET    /api/admin/support-chat              - Get all chats
GET    /api/admin/support-chat/{id}         - Get chat details
POST   /api/admin/support-chat/message      - Send message
POST   /api/admin/support-chat/upload       - Upload attachment
POST   /api/admin/support-chat/typing       - Send typing indicator
POST   /api/admin/support-chat/{id}/assign  - Assign chat
POST   /api/admin/support-chat/{id}/status  - Update status
GET    /api/admin/support-chat/unread-count - Unread count
POST   /api/admin/support-chat/{id}/read    - Mark as read  
POST   /api/admin/support-chat/{id}/disable-ai - Disable AI for chat
```

### 7.5 Broadcasting Channels

```
private-support.chat.{chatId}  - Support chat messages
private-support.user.{userId}  - User notifications
presence-admin.support         - Admin presence channel
```

---

## 8. Core Features

### 8.1 User Management

**Registration:**
- Schools register with UDISE code
- Requires school details, location (district/zone)
- Admin approval required (status: pending → active)

**Authentication:**
- Email/password login
- Email verification
- Password reset via email
- Remember me functionality

**Roles:**
- **Admin:** Full access, manage schools, view all reports
- **School:** Manage own data only

**Profile Management:**
- Edit personal information
- Update school details
- Change location (cannot change UDISE)
- Delete account

### 8.2 Roll Statements

**Purpose:** Track student enrollment by class

**Features:**
- Create enrollment records by class (KG-8)
- Separate counts for boys/girls
- Date-based tracking
- Edit/delete records
- Download PDF

**Validation:**
- Unique date constraint
- Required fields: UDISE, date, class, counts

### 8.3 Monthly Rice Configuration

**Purpose:** Manage monthly rice inventory

**Workflow:**
1. **Create Month:** Set opening balance, consumption rates
2. **Add Rice:** Record lifted/arranged rice during month
3. **Sync Consumed:** Calculate total consumed from daily entries
4. **Lock/Unlock:** Prevent/allow modifications
5. **Complete Month:** Finalize month, carry forward balances to next month

**Key Fields:**
- Opening balance (primary/upper primary)
- Rice lifted (government supply)
- Rice arranged (purchased)
- Daily consumption rate per student (grams)
- Consumed rice (calculated)
- Closing balance (calculated)

**Business Rules:**
- One configuration per month per user
- Consumed rice auto-calculated from daily consumption entries
- Closing balance = Opening + Lifted + Arranged - Consumed
- Next month's opening = Previous month's closing

### 8.4 Amount Configuration

**Purpose:** Set cooking cost rates per student

**Components:**
- **Primary Rates:** Pulses, Vegetables, Oil, Salt, Fuel
- **Middle Rates:** Pulses, Vegetables, Oil, Salt, Fuel
- **Salt Breakdown:** Common salt, Chilli powder, Turmeric, Coriander, Others

**Features:**
- Effective date range
- Confirmation workflow
- Latest config auto-applied to new records

### 8.5 Daily Consumption

**Purpose:** Record daily meal distribution

**Data Captured:**
- Date and day
- Students served (primary/middle)
- Rice consumed (auto-calculated)
- Amount consumed (auto-calculated)
- Rice balance after consumption
- Remarks

**Calculations:**
- Rice consumed = Students × Rate (from monthly config)
- Amount = Students × Rates (from amount config)
- Breakdown by item: pulses, vegetables, oil, salt (with sub-categories), fuel

**Validation:**
- Cannot create duplicate date entries
- Requires monthly rice configuration
- Date must be within active month

### 8.6 Rice Reports

**Purpose:** Generate monthly rice consumption reports

**Report Contents:**
- Opening balance (from rice config)
- Total rice consumed (sum of daily entries)
- Number of meal days
- Average daily consumption
- Closing balance
- Day-wise breakdown

**Output:**
- PDF download/preview
- School-wise (for schools)
- Consolidated view (for admins)

**Generation:**
- Select month/year
- System aggregates daily consumption
- Generates PDF using Blade template
- Stores PDF path in database

### 8.7 Amount Reports

**Purpose:** Generate monthly cooking cost reports

**Report Contents:**
- Total amount spent
- Item-wise breakdown (pulses, vegetables, oil, fuel)
- Salt sub-category breakdown
- Primary vs Middle section totals
- Number of meal days

**Output:**
- PDF download/preview
- Pre-filled data for bill generation

**Generation:**
- Select month/year
- System aggregates daily amounts
- Calculates item totals using amount config rates
- Generates PDF

### 8.8 Bill Management

**Types:**
1. **Kiryana Bill:** Pulses, Vegetables, Oil, Salt (with sub-items)
2. **Fuel Bill:** Fuel expenses

**Features:**
- Pre-filled items from amount report
- Editable quantities and rates
- GST calculation (if applicable)
- Vendor details
- Bill number auto-generation
- PDF generation

**Workflow:**
1. Generate amount report for month
2. Create bill (Kiryana or Fuel)
3. Review pre-filled items from report
4. Edit as needed (quantities, rates, add/remove items)
5. Save and generate PDF

### 8.9 Support Chat System

**User Interface:**
- Global chat widget available on all authenticated pages (via `AuthenticatedLayout.jsx`)
- Separate widgets for users (`SupportChatWidget.jsx`) and admins (`AdminSupportChatWidget.jsx`)
- Real-time messaging with instant message delivery
- File attachments support (images, documents)
- Emoji support for enhanced communication
- Typing indicators to show when other party is typing
- Unread message indicators and notifications
- Message search and filtering

**Admin Interface:**
- View all support chats across all schools
- Assign chats to specific admin users
- Update chat status (open/in progress/resolved/closed)
- Real-time notifications for new messages
- Filter chats by status, priority, and assignment
- Bulk operations for managing multiple chats

**AI Agent Integration:**
- Powered by Google Gemini API (gemini-2.5-flash model)
- Auto-responds to user queries when enabled
- Context-aware responses using `SchoolDataContextService`
  - Accesses user's school enrollment data
  - References consumption history and configurations
  - Provides data-specific answers
- Knowledge base from uploaded PDF documents (via `PDFParserService`)
- Configurable system prompts, temperature, and max tokens
- AI automatically disabled when admin sends a message (takeover mechanism)
- Can be manually disabled/enabled per chat
- Test AI connection feature for administrators

**Real-time Features:**
- Built on Laravel Reverb (WebSocket server)
- Private channels for each chat (`private-support.chat.{chatId}`)
- User notification channels (`private-support.user.{userId}`)
- Presence channel for admin availability (`presence-admin.support`)
- Broadcasting for message delivery, typing indicators, and status updates
- Message persistence in database
- Unread count tracking
- Complete chat history
- Attachment storage and retrieval

**Security:**
- Channel authorization for message privacy
- File upload validation and sanitization
- User can only access their own chats
- Admins can access all chats

### 8.10 AI Configuration (Admin)

**Settings:**
- Enable/disable AI agent
- System prompt configuration
- Model selection (Gemini models)
- Temperature and max tokens
- Auto-respond toggle

**Knowledge Base:**
- Upload PDF documents
- Extract and store text content
- Enable/disable individual PDFs
- PDFs provide context for AI responses

**Testing:**
- Test AI connection
- View sample response
- Verify configuration

### 8.11 Feedback System

**User Submission:**
- Category selection
- Message/description
- Rating (1-5 stars)
- Auto-captures location (district/zone)

**Admin Management:**
- View all feedback
- Filter by category, status, rating
- Respond to feedback
- Update status (pending/reviewed/resolved)
- Analytics dashboard

### 8.12 Developer Messages

**Purpose:** System-wide announcements/notifications

**Features:**
- Display on landing page
- Type: Info, Warning, Success, Error
- Active/inactive toggle
- Team member attribution (name, role)
- One active message at a time

**Use Cases:**
- Maintenance notices
- Feature announcements
- System updates
- Important alerts

### 8.13 Admin Features

**School Management:**
- View all schools
- Search and filter
- Activate/deactivate accounts
- View school details and statistics
- Update school information

**Consolidated Reports:**
- View all rice reports across schools
- View all amount reports
- View all bills
- Export data (CSV/Excel)
- Filter by district, zone, date range

**Real-time Dashboard:**
- Active users count
- System health metrics
- Recent activity feed
- Live sessions
- Performance monitoring

**Analytics:**
- Total schools registered
- Active vs inactive schools
- Consumption trends
- District-wise statistics
- Monthly comparisons

---

## 9. Configuration & Setup

### 9.1 Environment Variables

```env
# Application
APP_NAME="MDM SEVA"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mdmseva
DB_USERNAME=root
DB_PASSWORD=

# Redis (Cache, Queue, Broadcasting)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"

# Broadcasting (Laravel Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Pusher (for frontend)
VITE_PUSHER_APP_KEY="${REVERB_APP_KEY}"
VITE_PUSHER_HOST="${REVERB_HOST}"
VITE_PUSHER_PORT="${REVERB_PORT}"
VITE_PUSHER_SCHEME="${REVERB_SCHEME}"
VITE_PUSHER_APP_CLUSTER=mt1

# Gemini AI
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_DEFAULT_MODEL=gemini-2.5-flash

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=redis

# Queue
QUEUE_CONNECTION=redis
```

### 9.2 Installation Steps

**1. Clone Repository**
```bash
git clone <repository-url>
cd mdmseva
```

**2. Install Dependencies**
```bash
composer install
npm install
```

**3. Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

**4. Configure Database**
Edit `.env` and set database credentials

**5. Run Migrations**
```bash
php artisan migrate
```

**6. Seed Database**
```bash
php artisan db:seed
```
Seeds:
- 22 districts of J&K
- Zones for each district
- Admin user
- Default roles (admin, school)

**7. Build Frontend**
```bash
npm run dev
```

**8. Start Server**
```bash
php artisan serve
```

### 9.3 Production Deployment

**1. Optimize Autoloader**
```bash
composer install --no-dev --optimize-autoloader
```

**2. Build Assets**
```bash
npm install
npm run build
```

**3. Cache Configuration**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

**4. Set Permissions**
```bash
chmod -R 775 storage bootstrap/cache
```

**5. Setup Queue Worker**
```bash
php artisan queue:work --tries=3
```

**6. Setup Reverb Server**
```bash
php artisan reverb:start
```

**7. Configure Web Server (Nginx/Apache)**
Point document root to `/public`

**8. Enable HTTPS**
Install SSL certificate

### 9.4 Required Services

**Redis:**
- Cache storage
- Session storage
- Queue backend
- Broadcasting

**MySQL/PostgreSQL:**
- Primary database

**Laravel Reverb:**
- WebSocket server for real-time features

**Composer & NPM:**
- Dependency management

---

## 10. Security Implementation

### 10.1 Authentication Security

**Password Policy:**
- Minimum 12 characters
- Must include uppercase, lowercase, number, special character
- Hashed using bcrypt

**Session Security:**
- Encrypted sessions in production
- Redis-backed sessions
- CSRF protection on all forms
- Session timeout (2 hours)

**Email Verification:**
- Required for account activation
- Signed URLs for verification links

### 10.2 Authorization

**Role-Based Access Control (RBAC):**
- Spatie Laravel Permission package
- Two roles: Admin, School
- Middleware protection on routes
- Policy-based authorization

**Data Isolation:**
- Schools can only access their own data
- Scoped queries by user_id
- Admin can view all data

### 10.3 Input Validation

**Form Requests:**
- Dedicated request classes for validation
- Server-side validation for all inputs
- XSS prevention (auto-escaped by Laravel)
- SQL injection prevention (Eloquent ORM)

**File Uploads:**
- Type validation (PDF, images)
- Size limits
- Stored outside public directory
- Sanitized filenames

### 10.4 API Security

**Rate Limiting:**
- Throttling on auth endpoints (5 attempts per minute)
- API endpoint limits
- DDoS protection

**CORS:**
- Configured allowed origins
- Credentials support for Reverb

### 10.5 Headers & CSP

**Security Headers:**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

**Content Security Policy:**
- Configured for production
- Restricts inline scripts
- Allows trusted domains

### 10.6 Data Protection

**Encryption:**
- Database encryption at rest (if configured)
- HTTPS in production
- Sensitive data encrypted

**Backup:**
- Regular database backups
- Backup retention policy

**Logging:**
- Activity logging
- Error tracking
- Security event monitoring

---

## Appendix

### A. Default Admin Credentials
After seeding, default admin:
- **Email:** admin@mdmseva.com
- **Password:** password (CHANGE IMMEDIATELY)

### B. Composer Scripts
```bash
composer run dev         # Start development server with queue, logs, and Vite
composer run test        # Run PHPUnit tests
composer run analyse     # Run PHPStan static analysis
composer run quality     # Run analysis and code formatting check
```

### C. NPM Scripts
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting errors
```

### D. Artisan Commands
```bash
php artisan migrate:fresh --seed  # Reset database with seeds
php artisan cache:clear           # Clear application cache
php artisan config:clear          # Clear config cache
php artisan route:list            # List all routes
php artisan tinker                # Interactive shell
php artisan queue:work            # Process queue jobs
php artisan reverb:start          # Start Reverb WebSocket server
```

### E. Database Seeder Classes
- `DatabaseSeeder` - Main seeder
- `DistrictSeeder` - Seeds 22 districts of J&K
- `ZoneSeeder` - Seeds zones for districts
- `RoleSeeder` - Creates admin and school roles
- `AdminUserSeeder` - Creates default admin user

---

**End of Documentation**

For issues, feature requests, or contributions, contact the development team.

© 2025 MDM SEVA - Mid-Day Meal Scheme Management System
