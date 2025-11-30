<?php
// Location: routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\DashboardApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Dashboard API Routes
|--------------------------------------------------------------------------
| These routes use web middleware for session-based authentication.
| Protected by auth middleware - only authenticated users can access.
*/

// Public dashboard stats (no auth required for welcome page)
Route::get('/dashboard/stats', [App\Http\Controllers\Api\DashboardStatsController::class, 'index']);
Route::middleware(['web', 'auth'])->prefix('dashboard')->name('api.dashboard.')->group(function () {
    // Summary statistics
    Route::get('/summary', [DashboardApiController::class, 'getSummary'])->name('summary');
    
    // Chart data endpoints
    Route::get('/rice-balance-timeseries', [DashboardApiController::class, 'getRiceBalanceTimeseries'])->name('rice-balance-timeseries');
    Route::get('/daily-amount-chart', [DashboardApiController::class, 'getDailyAmountChart'])->name('daily-amount-chart');
    Route::get('/amount-breakdown', [DashboardApiController::class, 'getAmountBreakdown'])->name('amount-breakdown');
    Route::get('/recent-consumptions', [DashboardApiController::class, 'getRecentConsumptions'])->name('recent-consumptions');
    
    // New chart endpoints
    Route::get('/student-attendance', [DashboardApiController::class, 'getStudentAttendance'])->name('student-attendance');
    Route::get('/monthly-trends', [DashboardApiController::class, 'getMonthlyTrends'])->name('monthly-trends');
    Route::get('/inventory-status', [DashboardApiController::class, 'getInventoryStatus'])->name('inventory-status');
    Route::get('/weekly-performance', [DashboardApiController::class, 'getWeeklyPerformance'])->name('weekly-performance');
});

// Public API routes (no authentication required)
Route::prefix('public')->name('api.public.')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Api\PublicStatsController::class, 'getRealtimeStats'])
        ->middleware('cache.headers:api')
        ->name('stats');
    Route::get('/health', [\App\Http\Controllers\Api\PublicStatsController::class, 'getSystemHealth'])
        ->middleware('cache.headers:api')
        ->name('health');
    Route::get('/activity', [\App\Http\Controllers\Api\PublicStatsController::class, 'getRecentActivity'])
        ->middleware('cache.headers:api')
        ->name('activity');
});

// Feedback API routes
Route::prefix('feedback')->name('api.feedback.')->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\FeedbackController::class, 'store'])->name('store');
    Route::middleware(['web', 'auth', 'role:admin'])->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\FeedbackController::class, 'getStats'])->name('stats');
    });
    Route::get('/testimonials', [\App\Http\Controllers\Api\FeedbackController::class, 'publicTestimonials'])->name('testimonials');
});

/*
|--------------------------------------------------------------------------
| Public Location API Routes - Phase 5
|--------------------------------------------------------------------------
| These endpoints are public (no authentication required) to support
| the registration page where users select their district and zone.
| 
| Provides cascading location data for Jammu & Kashmir and Ladakh only.
*/

// Get all districts (optionally filtered by state)
// Usage: /api/districts or /api/districts?state=Jammu and Kashmir
Route::get('/districts', [LocationController::class, 'getDistricts'])
    ->name('api.districts');

// Get zones for a specific district
// Usage: /api/zones/{districtId}
Route::get('/zones/{districtId}', [LocationController::class, 'getZones'])
    ->name('api.zones');

// Get available states/UTs (helper endpoint for dropdowns)
// Usage: /api/states
Route::get('/states', [LocationController::class, 'getStates'])
    ->name('api.states');

// Validate that a zone belongs to a district (optional utility)
// Usage: /api/validate-location?district_id=1&zone_id=5
Route::get('/validate-location', [LocationController::class, 'validateLocation'])
    ->name('api.validate-location');

// Get complete location hierarchy (useful for admin/debugging)
// Usage: /api/location-hierarchy
Route::get('/location-hierarchy', [LocationController::class, 'getLocationHierarchy'])
    ->name('api.location-hierarchy');