# MDM SEVA - Frontend Architecture & Model Reference

**Appendix to PROJECT_DOCUMENTATION_V2.md**  
**Version:** 2.0.1  
**Last Updated:** November 29, 2025

---

## Frontend Architecture

### Page Structure

MDM Seva uses **Inertia.js 2.0** to bridge Laravel and React, creating a modern SPA experience without building a separate API.

**Page Directories** (`resources/js/Pages/`):
- `Admin/` (17 pages) - Admin dashboard and management
- `AmountConfiguration/` (2 pages) - Amount config forms
- `AmountReport/` (3 pages) - Amount report views
- `Auth/` (7 pages) - Login, registration, password reset
- `Bills/` (4 pages) - Bill creation and management
- `DailyConsumption/` (3 pages) - Consumption entry forms
- `Dashboard/` (17 pages) - School dashboard views
- `Errors/` (1 page) - Error pages  
- `Legal/` (6 pages) - Terms, privacy policy
- `MonthlyRiceConfiguration/` (4 pages) - Rice config forms
- `Profile/` (4 pages) - User profile management
- `RiceReport/` (4 pages) - Rice report views
- `RollStatements/` (2 pages) - Enrollment management

**Total**: 13 feature areas, 68+ pages

### Component Library

**Core Components** (`resources/js/Components/`):
- `Sidebar.jsx` - Main navigation sidebar (34KB, complex)
- `SupportChatWidget.jsx` - User chat interface (42KB)
- `AdminSupportChatWidget.jsx` - Admin chat interface (50KB)
- `AdminNavigation.jsx` - Admin-specific navigation
- `FeedbackForm.jsx` - User feedback collection
- `RealtimeStats.jsx` - Live dashboard statistics
- `ThemeToggle.jsx` - Dark/light mode switcher

**Form Components**:
- `TextInput.jsx`, `Checkbox.jsx`, `InputLabel.jsx`, `InputError.jsx`
- `PrimaryButton.jsx`, `SecondaryButton.jsx`, `DangerButton.jsx`
- `Dropdown.jsx`, `Modal.jsx`

**Daily Consumption Components** (`Components/DailyConsumption/`):
29 specialized components for consumption tracking:
- Date pickers, student counters, summary cards
- Rice balance displays, amount breakdowns
- Validation feedback, form helpers

**Rice Report Components** (`Components/RiceReport/`):
- Report summary views
- PDF preview interfaces
- Monthly comparison charts

**Admin Components** (`Components/Admin/`):
- School management grids
- Report approval workflows  
- Analytics dashboards
- User activation controls

### State Management

**Inertia Props**:
Each page receives server-rendered props via Inertia:
```typescript
interface PageProps {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
    errors?: Record<string, string>;
    // Page-specific props
}
```

**React State**:
- Local component state via `useState`
- Form state via React Hook Form
- Real-time updates via WebSocket listeners

### TypeScript Types

**Key Type Definitions** (`resources/js/types/`):
```typescript
// User type
interface User {
    id: number;
    name: string;
    email: string;
    school_type: 'primary' | 'middle' | 'secondary';
    udise: string;
    // ... more fields
}

// Daily Consumption
interface DailyConsumption {
    id: number;
    date: string;
    served_primary: number;
    served_middle: number;
    primary_rice: number;
    middle_rice: number;
    total_rice: number;
    // ... amount breakdowns
}

// Rice Configuration
interface MonthlyRiceConfiguration {
    id: number;
    month: number;
    year: number;
    opening_balance_primary: number;
    opening_balance_upper_primary: number;
    rice_lifted_primary: number;
    rice_lifted_upper_primary: number;
    consumed_primary: number;
    consumed_upper_primary: number;
    closing_balance_primary: number;
    closing_balance_upper_primary: number;
    // ... more fields
}
```

### Styling Approach

**TailwindCSS** used throughout for utility-first styling:
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors duration-200 shadow-sm">
    Generate Report
</button>
```

**Custom CSS** (`resources/css/app.css`):
- CSS variables for theme colors
- Custom animations for loaders
- Print-specific styles for reports

### Real-time Features

**WebSocket Integration** (Laravel Reverb):
```typescript
// Listen for new chat messages
Echo.private(`support-chat.${chatId}`)
    .listen('MessageSent', (e) => {
        appendMessage(e.message);
    });

// Admin listens to all chats
Echo.private('admin.support')
    .listen('NewChatCreated', (e) => {
        updateChatList(e.chat);
    });
```

---

## Complete Model Reference

### 1. User Model

**File**: `app/Models/User.php` (721 lines, 54 methods)

**Purpose**: School and admin accounts

**Key Relationships**:
- `hasMany`: dailyConsumptions, riceConfigurations, amountConfigurations, riceReports, amountReports, bills
- `belongsTo`: district, zone

**Important Methods**:
- `isAdmin()`, `isSchool()` - Role checks
- `getEnrollmentData()` - Aggregate student counts
- `hasPrimaryStudents()`, `hasMiddleStudents()` - Section checks
- `canCreateConsumption()` - Check if configs exist

---

### 2. MonthlyRiceConfiguration Model

**File**: `app/Models/MonthlyRiceConfiguration.php` (525 lines)

**Purpose**: Monthly rice inventory management

**Key Fields**:
- Opening/closing balances (primary & upper_primary)
- Rice lifted/arranged amounts
- Consumed amounts (synced from DailyConsumption)
- Daily consumption rates (g/student)
- Lock status, completion status

**Key Methods**:
- `getOrCreateForPeriod($user_id, $month, $year)` - Get/create with carry-forward
- `syncConsumedFromDaily()` - Sync consumed from daily records
- `recomputeTotals()` - Recalculate closing balances
- `createNextMonth()` - Auto-create next month with balance carry
- `scopeForUser($query, $userId)` - Filter by user
- `scopeForPeriod($query, $month, $year)` - Filter by month/year

---

### 3. MonthlyAmountConfiguration Model

**File**: `app/Models/MonthlyAmountConfiguration.php` (450 lines)

**Purpose**: Monthly cooking cost rates and salt percentages

**Key Fields**:
- Daily rates per student (primary & middle) for: pulses, vegetables, oil, salt, fuel
- Salt breakdown percentages (common, chilli, turmeric, coriander, other)
- Computed totals per student
- Completion status

**Key Methods**:
- `recomputeTotals()` - Calculate total daily amount per student
- `validateSaltPercentages()` - Ensure salt % totals 100%
- `scopeForUser($query, $userId)`
- `scopeForPeriod($query, $month, $year)`
- `scopeCompleted($query)` - Only completed configs

---

### 4. DailyConsumption Model

**File**: `app/Models/DailyConsumption.php` (506 lines, 38 methods)

**Purpose**: Track daily meal consumption

**Key Fields**:
- Date, user_id
- Students served (primary & middle)
- Calculated rice consumed (uses rates from MonthlyRiceConfiguration)
- Calculated amount breakdown (uses rates from MonthlyAmountConfiguration)
- Remarks

**Key Relationships**:
- `belongsTo`: user
- `riceConfig()` - Gets MonthlyRiceConfiguration for the consumption's month

**Accessors**:
- `getPrimaryRiceAttribute()` - Calculated rice for primary section
- `getMiddleRiceAttribute()` - Calculated rice for middle section
- `getTotalRiceAttribute()` - Total rice consumed
- `getAmountBreakdownAttribute()` - Detailed amount breakdown

**Key Methods**:
- `scopeForUser($query, $userId)`
- `scopeForMonth($query, $month, $year)`
- `scopeDateRange($query, $startDate, $endDate)`

---

### 5. RiceReport Model

**File**: `app/Models/RiceReport.php` (147 lines)

**Purpose**: Store generated rice consumption reports

**Key Fields**:
- Month, year, user_id
- Opening/closing balances
- Total rice consumed
- Student totals (primary & middle)
- Rice totals by section
- Serving days, average daily consumption
- Daily records (JSON)
- Stale status

**Key Methods**:
- `scopeForUser($query, $userId)`
- `scopeForPeriod($query, $month, $year)`
- `markAsStale()` - Mark report needing regeneration

---

### 6. AmountReport Model

**File**: `app/Models/AmountReport.php` (529 lines)

**Purpose**: Store generated cooking cost reports

**Key Fields**:
- Month, year, user_id
- Opening/closing balances
- Ingredient totals: pulses, vegetables, oil, fuel
- Salt breakdown (5 subcategories with amounts and percentages)
- Grand total
- Stale status

**Key Methods**:
- `scopeForUser($query, $userId)`
- `scopeForPeriod($query, $month, $year)`
- `markAsStale()`
- `getFormattedAmounts()` - Returns all amounts formatted as currency

---

### 7. Bill Model

**File**: `app/Models/Bill.php` (254 lines)

**Purpose**: Vendor purchase bills (Kiryana/Fuel)

**Constants**:
- `TYPE_KIRYANA` = 'kiryana'
- `TYPE_FUEL` = 'fuel'

**Key Fields**:
- amount_report_id, user_id
- Bill type, month, year
- Shop details: name, shopkeeper, phone, address
- Total amount
- Bill date

**Relationships**:
- `belongsTo`: amountReport, user
- `hasMany`: billItems

**Key Methods**:
- `scopeKiryana($query)`, `scopeFuel($query)`
- `calculateTotal()` - Sum of all bill items
- `getItemsCount()` - Number of line items

---

### 8. BillItem Model

**File**: `app/Models/BillItem.php` (169 lines)

**Purpose**: Line items within bills

**Key Fields**:
- bill_id
- Item name, category
- Quantity, unit, rate per unit
- Amount

**Relationships**:
- `belongsTo`: bill

---

### 9. RollStatement Model

**File**: `app/Models/RollStatement.php` (135 lines)

**Purpose**: Student enrollment records

**Key Fields**:
- UDISE code
- Statement date, class name
- Boys/girls counts various student categories
- Total students, total boys, total girls

**Relationships**:
- School matched by UDISE code

---

### 10. SupportChat Model

**File**: `app/Models/SupportChat.php` (134 lines)

**Purpose**: Support ticket threads

**Key Fields**:
- user_id
- Subject, status (open/closed)
- Admin takeover flag (disable AI when admin responds)
- Last message timestamp

**Relationships**:
- `belongsTo`: user
- `hasMany`: supportMessages

---

### 11. SupportMessage Model

**File**: `app/Models/SupportMessage.php` (93 lines)

**Purpose**: Individual chat messages

**Key Fields**:
- support_chat_id
- Sender (user/admin/ai)
- Message content
- Read status

**Relationships**:
- `belongsTo`: supportChat

---

### 12. AIConfiguration Model

**File**: `app/Models/AIConfiguration.php` (149 lines)

**Purpose**: AI agent settings

**Key Fields**:
- Model name (e.g., 'gemini-1.5-flash')
- Temperature, max tokens
- System prompt
- Is active flag

---

### 13. AIKnowledgeBase Model

**File**: `app/Models/AIKnowledgeBase.php` (78 lines)

**Purpose**: AI training data

**Key Fields**:
- Category, question, answer
- Is active flag

---

## Additional Models

**Other Supporting Models**:
- `District.php` - Geographical districts
- `Zone.php` - Geographical zones  
- `MonthCompletion.php` - Track completed months
- `RiceInventoryActivity.php` - Rice transaction log
- `Feedback.php` - User feedback
- `MessageAttachment.php` - Chat attachments
- `DeveloperMessage.php` - System announcements
- `AmountConfiguration.php` - **DEPRECATED** (replaced by MonthlyAmountConfiguration)
- `MonthlyConfiguration.php` - **LEGACY** (older monthly config model)

---

## Frontend-Backend Integration

### Inertia Page Flow Example

**Rice Report Generation**:
```
1. User clicks "Generate Report" button
   ↓
2. React calls: Inertia.post(route('rice-reports.generate'), { month, year })
   ↓
3. Laravel RiceReportController::generate() receives request
   ↓
4. Calls RiceReportService::generateReport()
   ↓
5. Service validates, calculates, saves RiceReport model
   ↓
6. Returns Inertia::render('RiceReport/Show', { report })
   ↓
7. React RiceReport/Show.tsx receives props and renders
```

### API Endpoints (AJAX)

**Dashboard Real-time Data**:
```typescript
// Fetch dashboard summary
axios.get(route('dashboard.api.summary'))
    .then(response => {
        setSummaryData(response.data);
    });

// Fetch rice balance timeseries  
axios.get(route('dashboard.api.rice-balance'))
    .then(response => {
        setChartData(response.data);
    });
```

**Key API Routes** (return JSON):
- `/dashboard/api/summary` - Overview stats
- `/dashboard/api/rice-balance-timeseries` - Chart data
- `/dashboard/api/amount-breakdown` - Pie chart data
- `/dashboard/api/recent-consumptions` - Activity feed
- `/admin/realtime/stats` - Admin metrics
- `/admin/realtime/sessions` - Live user sessions

---

## Deployment & Production

### Build Process

**Development**:
```bash
npm run dev  # Vite dev server with HMR
```

**Production**:
```bash
npm run build  # Vite production build
# Outputs to public/build/
```

### Performance Optimizations

**Frontend**:
- Code splitting by route (Vite automatic)
- Lazy loading for heavy components
- Image optimization
- TailwindCSS purging (production only)

**Backend**:
- Query eager loading to prevent N+1 issues
- Redis caching for sessions and frequent queries
- Database indexes on frequently queried columns
- Chunk large report datasets

---

## Testing Strategy

**Backend Testing**:
- Unit tests for Service layer (PHPUnit)
- Feature tests for Controllers
- Database tests with RefreshDatabase trait

**Frontend Testing**:
- Component tests (React Testing Library)
- E2E tests (potential: Playwright/Cypress)

**Manual Testing Checklist**:
- [ ] Rice configuration workflow (create, carry-forward, sync)
- [ ] Amount configuration setup
- [ ] Daily consumption entry
- [ ] Report generation (rice & amount)
- [ ] Bill creation with pre-filled items
- [ ] Chat system (user, admin, AI responses)
- [ ] WebSocket real-time updates
- [ ] PDF generation quality

---

**Document Version**: 2.0.1 (Appendix)  
**Covers**: Frontend Architecture, Complete Model Reference  
**Last Updated**: November 29, 2025
