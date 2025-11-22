<?php
// Location: routes/web.php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RollStatementController;
use App\Http\Controllers\MonthlyRiceConfigurationController;
use App\Http\Controllers\AmountConfigurationController;
use App\Http\Controllers\DailyConsumptionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\RiceReportController;
use App\Http\Controllers\AmountReportController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\SupportChatController as UserSupportChatController;
use App\Http\Controllers\Admin\SupportChatController as AdminSupportChatController;

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SchoolsController as AdminSchoolsController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->middleware('cache.headers:public');

// Public legal & info pages
Route::get('/privacy-policy', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('legal.privacy');

Route::get('/terms-of-service', function () {
    return Inertia::render('Legal/TermsOfService');
})->name('legal.terms');

Route::get('/cookie-policy', function () {
    return Inertia::render('Legal/CookiePolicy');
})->name('legal.cookies');

Route::get('/about', function () {
    return Inertia::render('Legal/About');
})->name('legal.about');

Route::get('/contact', function () {
    return Inertia::render('Legal/Contact');
})->name('legal.contact');

Route::get('/accessibility-statement', function () {
    return Inertia::render('Legal/AccessibilityStatement');
})->name('legal.accessibility');

// Public user guide (non-Inertia Blade view)
Route::get('/user-guide', function () {
    return view('userguide');
})->name('userguide');

// Downloadable User Guide PDF (A4)
Route::get('/user-guide/pdf', function () {
    $pdf = Pdf::loadView('userguide-pdf');
    return $pdf->download('MDM-SEVA-User-Guide.pdf');
})->name('userguide.pdf');

/*
|--------------------------------------------------------------------------
| Admin Routes - Protected by auth & role:admin middleware
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [AdminDashboardController::class, 'export'])->name('dashboard.export');
    
    // Real-time Admin Dashboard
    Route::get('/realtime', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'index'])->name('realtime');
    Route::get('/realtime/stats', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'getStats'])->name('realtime.stats');
    Route::get('/realtime/health', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'getHealth'])->name('realtime.health');
    Route::get('/realtime/activity', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'getActivity'])->name('realtime.activity');
    Route::get('/realtime/sessions', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'getLiveSessions'])->name('realtime.sessions');
    Route::get('/realtime/performance', [\App\Http\Controllers\Admin\RealtimeDashboardController::class, 'getPerformanceMetrics'])->name('realtime.performance');
    
    // Admin Feedback Management
    Route::prefix('feedback')->name('feedback.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\FeedbackController::class, 'index'])->name('index');
        Route::get('/{feedback}', [\App\Http\Controllers\Admin\FeedbackController::class, 'show'])->name('show');
        Route::patch('/{feedback}/status', [\App\Http\Controllers\Admin\FeedbackController::class, 'updateStatus'])->name('update-status');
        Route::post('/{feedback}/respond', [\App\Http\Controllers\Admin\FeedbackController::class, 'respond'])->name('respond');
        Route::post('/bulk-update', [\App\Http\Controllers\Admin\FeedbackController::class, 'bulkUpdate'])->name('bulk-update');
        Route::get('/analytics/data', [\App\Http\Controllers\Admin\FeedbackController::class, 'analytics'])->name('analytics');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Schools Management
    |--------------------------------------------------------------------------
    */
    Route::prefix('schools')->name('schools.')->group(function () {
        // List all schools
        Route::get('/', [AdminSchoolsController::class, 'index'])->name('index');
        
        // View school details
        Route::get('/{userId}', [AdminSchoolsController::class, 'show'])->name('show');

        // Update school profile (admin)
        Route::patch('/{userId}', [AdminSchoolsController::class, 'update'])->name('update');
        
        // Activate/Deactivate school
        Route::post('/{userId}/activate', [AdminSchoolsController::class, 'activate'])->name('activate');
        Route::post('/{userId}/deactivate', [AdminSchoolsController::class, 'deactivate'])->name('deactivate');
    });
    
    // Export schools
    Route::get('/export/schools', [AdminSchoolsController::class, 'export'])->name('export.schools');
    
    /*
    |--------------------------------------------------------------------------
    | Rice Reports (Admin View)
    |--------------------------------------------------------------------------
    */
    Route::prefix('rice-reports')->name('rice-reports.')->group(function () {
        // List all rice reports across schools
        Route::get('/', [AdminReportsController::class, 'riceReportsIndex'])->name('index');
        
        // View single rice report
        Route::get('/{reportId}', [AdminReportsController::class, 'riceReportShow'])->name('show');
    });
    
    // Export rice reports
    Route::get('/export/rice-reports', [AdminReportsController::class, 'exportRiceReports'])->name('export.rice-reports');
    
    /*
    |--------------------------------------------------------------------------
    | Amount Reports (Admin View)
    |--------------------------------------------------------------------------
    */
    Route::prefix('amount-reports')->name('amount-reports.')->group(function () {
        // List all amount reports across schools
        Route::get('/', [AdminReportsController::class, 'amountReportsIndex'])->name('index');
        
        // View single amount report
        Route::get('/{reportId}', [AdminReportsController::class, 'amountReportShow'])->name('show');
    });
    
    // Export amount reports
    Route::get('/export/amount-reports', [AdminReportsController::class, 'exportAmountReports'])->name('export.amount-reports');
    
    /*
    |--------------------------------------------------------------------------
    | Daily Consumptions (Admin View)
    |--------------------------------------------------------------------------
    */
    Route::get('/daily-consumptions', [AdminReportsController::class, 'dailyConsumptionsIndex'])->name('daily-consumptions.index');
    Route::get('/export/daily-consumptions', [AdminReportsController::class, 'exportDailyConsumptions'])->name('export.daily-consumptions');
    
    /*
    |--------------------------------------------------------------------------
    | Bills (Admin View)
    |--------------------------------------------------------------------------
    */
    Route::prefix('bills')->name('bills.')->group(function () {
        // List all bills across schools
        Route::get('/', [AdminReportsController::class, 'billsIndex'])->name('index');
        
        // View single bill
        Route::get('/{billId}', [AdminReportsController::class, 'billShow'])->name('show');
    });
    
    // Export bills
    Route::get('/export/bills', [AdminReportsController::class, 'exportBills'])->name('export.bills');

    
});

/*
|--------------------------------------------------------------------------
| School User Routes - Protected by auth, verified & active middleware
|--------------------------------------------------------------------------
| These routes are for school users only (not admin)
*/
Route::middleware(['auth', 'verified', 'active'])->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | Dashboard Routes
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Dashboard API Routes
    Route::prefix('api/dashboard')->name('api.dashboard.')->group(function () {
        Route::get('/summary', [DashboardApiController::class, 'getSummary'])->name('summary');
        Route::get('/rice-balance-timeseries', [DashboardApiController::class, 'getRiceBalanceTimeseries'])->name('rice-balance');
        Route::get('/daily-amount-chart', [DashboardApiController::class, 'getDailyAmountChart'])->name('daily-amount');
        Route::get('/amount-breakdown', [DashboardApiController::class, 'getAmountBreakdown'])->name('amount-breakdown');
        Route::get('/recent-consumptions', [DashboardApiController::class, 'getRecentConsumptions'])->name('recent-consumptions');
        Route::get('/activity-feed', [DashboardApiController::class, 'getActivityFeed'])->name('activity-feed');
        
        // New chart endpoints
        Route::get('/student-attendance', [DashboardApiController::class, 'getStudentAttendance'])->name('student-attendance');
        Route::get('/monthly-trends', [DashboardApiController::class, 'getMonthlyTrends'])->name('monthly-trends');
        Route::get('/inventory-status', [DashboardApiController::class, 'getInventoryStatus'])->name('inventory-status');
        Route::get('/weekly-performance', [DashboardApiController::class, 'getWeeklyPerformance'])->name('weekly-performance');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Location Route
    |--------------------------------------------------------------------------
    */
    Route::get('/location', function () {
        return Inertia::render('Location/Index');
    })->name('location');
    
    /*
    |--------------------------------------------------------------------------
    | Profile Routes - Enhanced with Personal, Institutional & Location Data
    |--------------------------------------------------------------------------
    | Users can update all registration fields EXCEPT UDISE code
    | Includes: Personal info, School/Institution details, and Location data
    */
    Route::prefix('profile')->name('profile.')->group(function () {
        // Display profile edit form with all user data
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        
        // Update profile (handles personal, institutional & location info)
        // UDISE is excluded from updates for security reasons
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        
        // Delete user account
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Roll Statement Routes
    |--------------------------------------------------------------------------
    | IMPORTANT: Specific routes must come BEFORE wildcard routes
    */
    
    // PDF Download Route (must be before {rollStatement})
    Route::get('/roll-statements/pdf', [RollStatementController::class, 'downloadPDF'])
        ->name('roll-statements.print');
    
    // Create Route (must be before {rollStatement})
    Route::get('/roll-statements/create', [RollStatementController::class, 'create'])
        ->name('roll-statements.create');
    
    // Index Route
    Route::get('/roll-statements', [RollStatementController::class, 'index'])
        ->name('roll-statements.index');
    
    // Store Route
    Route::post('/roll-statements', [RollStatementController::class, 'store'])
        ->name('roll-statements.store');
    
    // Wildcard Routes (must come AFTER specific routes)
    Route::get('/roll-statements/{rollStatement}', [RollStatementController::class, 'show'])
        ->name('roll-statements.show');
    
    Route::get('/roll-statements/{rollStatement}/edit', [RollStatementController::class, 'edit'])
        ->name('roll-statements.edit');
    
    Route::put('/roll-statements/{rollStatement}', [RollStatementController::class, 'update'])
        ->name('roll-statements.update');
    
    Route::delete('/roll-statements/{rollStatement}', [RollStatementController::class, 'destroy'])
        ->name('roll-statements.destroy');
    
    /*
    |--------------------------------------------------------------------------
    | Rice Configuration Routes - DEPRECATED: Using Monthly System
    |--------------------------------------------------------------------------
    | Old single-configuration system removed. Use monthly-rice-config routes instead.
    */

    /*
    |--------------------------------------------------------------------------
    | Monthly Rice Configuration Routes - NEW MONTHLY SYSTEM
    |--------------------------------------------------------------------------
    | Month-based rice configuration with completion workflow
    */
    Route::prefix('monthly-rice-config')->name('monthly-rice-config.')->group(function () {
        // Main dashboard
        Route::get('/', [MonthlyRiceConfigurationController::class, 'index'])->name('index');
        
        // Create new month
        Route::get('/create', [MonthlyRiceConfigurationController::class, 'create'])->name('create');
        Route::post('/', [MonthlyRiceConfigurationController::class, 'store'])->name('store');
        
        // Edit existing month
        Route::get('/edit', [MonthlyRiceConfigurationController::class, 'edit'])->name('edit');
        Route::put('/', [MonthlyRiceConfigurationController::class, 'update'])->name('update');
        
        // Rice management actions
        Route::post('/add-rice-lifted', [MonthlyRiceConfigurationController::class, 'addRiceLifted'])->name('add-lifted');
        Route::post('/add-rice-arranged', [MonthlyRiceConfigurationController::class, 'addRiceArranged'])->name('add-arranged');
        Route::post('/sync-consumed', [MonthlyRiceConfigurationController::class, 'syncConsumed'])->name('sync-consumed');
        Route::post('/toggle-lock', [MonthlyRiceConfigurationController::class, 'toggleLock'])->name('toggle-lock');
        
        // Month completion workflow
        Route::post('/complete-month', [MonthlyRiceConfigurationController::class, 'completeMonth'])->name('complete');
        
        // Next month creation
        Route::get('/create-next', [MonthlyRiceConfigurationController::class, 'createNext'])->name('create-next');
        Route::post('/store-next', [MonthlyRiceConfigurationController::class, 'storeNext'])->name('store-next');
    });


    
    /*
    |--------------------------------------------------------------------------
    | Amount Configuration Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('amount-config')
        ->name('amount-config.')
        ->group(function () {
            Route::get('/', [AmountConfigurationController::class, 'index'])->name('index');
            Route::get('/create', [AmountConfigurationController::class, 'form'])->name('create');
            Route::post('/', [AmountConfigurationController::class, 'store'])->name('store');
            Route::get('/{config}/edit', [AmountConfigurationController::class, 'form'])->name('edit');
            Route::put('/{config}', [AmountConfigurationController::class, 'update'])->name('update');
            Route::delete('/{config}', [AmountConfigurationController::class, 'destroy'])->name('destroy');
        });
    
    /*
    |--------------------------------------------------------------------------
    | Daily Consumption Routes - Full CRUD with Month Selection
    |--------------------------------------------------------------------------
    | IMPORTANT: Specific routes must come BEFORE wildcard routes
    */
    Route::prefix('daily-consumptions')
        ->name('daily-consumptions.')
        ->group(function () {
            // Index - Show month selector landing page
            Route::get('/', [DailyConsumptionController::class, 'index'])
                ->name('index');
            
            // Select Month - Handle month selection and redirect to appropriate page
            Route::get('/select-month', [DailyConsumptionController::class, 'selectMonth'])
                ->name('select-month');
            
            // List - Show daily consumption entries for selected month
            Route::get('/list', [DailyConsumptionController::class, 'list'])
                ->name('list');
            
            // Create - Show form for new consumption
            Route::get('/create', [DailyConsumptionController::class, 'create'])
                ->name('create');
            
            // Store - Save new consumption
            Route::post('/', [DailyConsumptionController::class, 'store'])
                ->name('store');
            
            // Edit - Show form for editing (must be before wildcard)
            Route::get('/{dailyConsumption}/edit', [DailyConsumptionController::class, 'edit'])
                ->name('edit');
            
            // Update - Save edited consumption
            Route::put('/{dailyConsumption}', [DailyConsumptionController::class, 'update'])
                ->name('update');
            
            // Delete - Remove consumption
            Route::delete('/{dailyConsumption}', [DailyConsumptionController::class, 'destroy'])
                ->name('destroy');
            
            // Show - View single consumption (optional, if needed)
            Route::get('/{dailyConsumption}', [DailyConsumptionController::class, 'show'])
                ->name('show');
        });

    /*
    |--------------------------------------------------------------------------
    | Rice Report Routes
    |--------------------------------------------------------------------------
    | IMPORTANT: Specific routes must come BEFORE wildcard routes
    */
    Route::prefix('rice-reports')->name('rice-reports.')->group(function () {
        Route::get('/', [RiceReportController::class, 'index'])->name('index');
        Route::get('/create', [RiceReportController::class, 'create'])->name('create');
        Route::post('/', [RiceReportController::class, 'store'])->name('store');
        Route::get('/find-report', [RiceReportController::class, 'findReport'])->name('find-report');
        Route::get('/{report}', [RiceReportController::class, 'show'])->name('show');
        Route::get('/{report}/view-pdf', [RiceReportController::class, 'viewPdf'])->name('view-pdf');
        Route::get('/{report}/generate-pdf', [RiceReportController::class, 'generatePdf'])->name('generate-pdf');
        Route::post('/{report}/regenerate', [RiceReportController::class, 'regenerate'])->name('regenerate');
        Route::delete('/{report}', [RiceReportController::class, 'destroy'])->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Amount Report Routes
    |--------------------------------------------------------------------------
    | IMPORTANT: Specific routes must come BEFORE wildcard routes
    */
    Route::prefix('amount-reports')->name('amount-reports.')->group(function () {
        Route::get('/', [AmountReportController::class, 'index'])->name('index');
        Route::get('/create', [AmountReportController::class, 'create'])->name('create');
        Route::post('/', [AmountReportController::class, 'store'])->name('store');
        Route::get('/find-report', [AmountReportController::class, 'findReport'])->name('find-report');
        Route::get('/{amountReport}', [AmountReportController::class, 'show'])->name('show');
        Route::get('/{amountReport}/view-pdf', [AmountReportController::class, 'viewPdf'])->name('view-pdf');
        Route::get('/{amountReport}/generate-pdf', [AmountReportController::class, 'generatePdf'])->name('generate-pdf');
        Route::post('/{amountReport}/regenerate', [AmountReportController::class, 'regenerate'])->name('regenerate');
        Route::delete('/{amountReport}', [AmountReportController::class, 'destroy'])->name('destroy');
        
        // =====================================================================
        // Bills Routes (nested under amount reports)
        // =====================================================================
        Route::prefix('{amountReport}/bills')->name('bills.')->group(function () {
            // List all bills for a report
            Route::get('/', [BillController::class, 'index'])->name('index');
            
            // Create new bill form (kiryana or fuel)
            Route::get('/create/{type}', [BillController::class, 'create'])
                ->whereIn('type', ['kiryana', 'fuel'])
                ->name('create');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Bills Routes (standalone)
    |--------------------------------------------------------------------------
    | IMPORTANT: Specific routes must come BEFORE wildcard routes
    */
    Route::prefix('bills')->name('bills.')->group(function () {
        // Store new bill (POST)
        Route::post('/', [BillController::class, 'store'])->name('store');
        
        // Generate PDF for a bill (must be before wildcard)
        Route::get('/{bill}/pdf', [BillController::class, 'generatePdf'])->name('pdf');
        Route::get('/{bill}/view-pdf', [BillController::class, 'viewPdf'])->name('view-pdf');
        
        // View specific bill
        Route::get('/{bill}', [BillController::class, 'show'])->name('show');
        
        // Delete a bill
        Route::delete('/{bill}', [BillController::class, 'destroy'])->name('destroy');
    });
    
    // Guidelines page
    Route::get('/guidelines', function () {
        return view('guidelines');
    })->name('guidelines');  
});

require __DIR__.'/auth.php';

// User Support Chat API (session-auth, web middleware) — separated to allow auth-only access
Route::middleware(['auth'])->prefix('api/support-chat')->group(function () {
    Route::get('/', [UserSupportChatController::class, 'index']);
    Route::post('/message', [UserSupportChatController::class, 'sendMessage']);
    Route::post('/upload', [UserSupportChatController::class, 'uploadAttachment']);
    Route::post('/typing', [UserSupportChatController::class, 'typing']);
    Route::post('/{chatId}/read', [UserSupportChatController::class, 'markAsRead']);
    Route::post('/{chatId}/close', [UserSupportChatController::class, 'close']);
    Route::get('/unread-count', [UserSupportChatController::class, 'unreadCount']);
});

// Admin Support Chat API (session-auth, role:admin)
Route::middleware(['auth', 'role:admin'])->prefix('api/admin/support-chat')->group(function () {
    Route::get('/', [AdminSupportChatController::class, 'index']);
    Route::get('/{chatId}', [AdminSupportChatController::class, 'show']);
    Route::post('/message', [AdminSupportChatController::class, 'sendMessage']);
    Route::post('/upload', [AdminSupportChatController::class, 'uploadAttachment']);
    Route::post('/typing', [AdminSupportChatController::class, 'typing']);
    Route::post('/{chatId}/assign', [AdminSupportChatController::class, 'assign']);
    Route::post('/{chatId}/status', [AdminSupportChatController::class, 'updateStatus']);
    Route::get('/unread-count', [AdminSupportChatController::class, 'unreadCount']);
    Route::post('/{chatId}/read', [AdminSupportChatController::class, 'markAsRead']);
});