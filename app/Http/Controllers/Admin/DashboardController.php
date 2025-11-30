<?php
// ============================================
// FILE 1 of 2: app/Http/Controllers/Admin/DashboardController.php
// Location: app/Http/Controllers/Admin/DashboardController.php
// 
// INSTRUCTIONS:
// 1. Add "use App\Models\Feedback;" at the top with other use statements
// 2. Add the getFeedbackStatistics() method at the end of the class
// 3. Add 'feedbackStats' => $feedbackStats to the Inertia::render return array
// ============================================

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\District;
use App\Models\Zone;
use App\Models\DailyConsumption;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with aggregated statistics.
     * 
     * Accepts filters: district_id, zone_id, month, year
     * 
     * GET /admin/dashboard
     */
    public function index(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020|max:' . (date('Y') + 1),
        ]);

        // Get filter values
        $districtId = $request->district_id;
        $zoneId = $request->zone_id;

        // Smart default for month/year: Use latest data if no filter provided and current month is empty
        if ($request->filled('month') && $request->filled('year')) {
            $month = $request->month;
            $year = $request->year;
        } else {
            // Check if we have data for current month
            $hasCurrentData = DailyConsumption::whereMonth('date', Carbon::now()->month)
                ->whereYear('date', Carbon::now()->year)
                ->exists();
                
            if ($hasCurrentData) {
                $month = Carbon::now()->month;
                $year = Carbon::now()->year;
            } else {
                // Try to find latest data
                $latest = DailyConsumption::latest('date')->first();
                if ($latest) {
                    $month = $latest->date->month;
                    $year = $latest->date->year;
                } else {
                    $month = Carbon::now()->month;
                    $year = Carbon::now()->year;
                }
            }
        }

        // Build base query for schools with filters
        $schoolsQuery = User::schools()->with(['district', 'zone']);

        if ($districtId) {
            $schoolsQuery->where('district_id', $districtId);
        }

        if ($zoneId) {
            $schoolsQuery->where('zone_id', $zoneId);
        }

        // Get filtered schools
        $schools = $schoolsQuery->get();
        $schoolIds = $schools->pluck('id');

        // Calculate school statistics
        $totalSchools = $schools->count();
        $activeSchools = $schools->where('is_active', true)->count();
        $inactiveSchools = $schools->where('is_active', false)->count();

        // Build consumption query for the period
        $consumptionQuery = DailyConsumption::whereIn('user_id', $schoolIds)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        // Get all consumption records for the period
        $consumptions = $consumptionQuery->get();

        // Fetch configurations for the period to calculate breakdowns efficiently
        $riceConfigs = MonthlyRiceConfiguration::whereIn('user_id', $schoolIds)
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->keyBy('user_id');

        // ✅ UPDATED: Fetch MonthlyAmountConfiguration instead of AmountConfiguration
        $amountConfigs = MonthlyAmountConfiguration::whereIn('user_id', $schoolIds)
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->keyBy('user_id');

        // Calculate period statistics with breakdowns
        $totalRiceConsumed = 0;
        $totalAmountSpent = 0;
        $totalPrimaryStudents = 0;
        $totalMiddleStudents = 0;
        $totalRicePrimary = 0;
        $totalRiceMiddle = 0;
        $totalAmountPrimary = 0;
        $totalAmountMiddle = 0;

        $defaultPrimaryRiceRate = 0.10;
        $defaultMiddleRiceRate = 0.15;

        foreach ($consumptions as $consumption) {
            $totalRiceConsumed += $consumption->rice_consumed;
            $totalAmountSpent += $consumption->amount_consumed;
            $totalPrimaryStudents += $consumption->served_primary;
            $totalMiddleStudents += $consumption->served_middle;

            // Rice Breakdown
            $riceConfig = $riceConfigs->get($consumption->user_id);
            $pRiceRate = $riceConfig ? ($riceConfig->daily_consumption_primary / 1000) : $defaultPrimaryRiceRate;
            $mRiceRate = $riceConfig ? ($riceConfig->daily_consumption_upper_primary / 1000) : $defaultMiddleRiceRate;
            
            $totalRicePrimary += round($consumption->served_primary * $pRiceRate, 2);
            $totalRiceMiddle += round($consumption->served_middle * $mRiceRate, 2);

            // Amount Breakdown
            $amountConfig = $amountConfigs->get($consumption->user_id);
            
            // ✅ UPDATED: Use fields from MonthlyAmountConfiguration
            $pAmountRate = $amountConfig ? (
                ($amountConfig->daily_pulses_primary ?? 0) +
                ($amountConfig->daily_vegetables_primary ?? 0) +
                ($amountConfig->daily_oil_primary ?? 0) +
                ($amountConfig->daily_salt_primary ?? 0) +
                ($amountConfig->daily_fuel_primary ?? 0)
            ) : 0;
            
            $mAmountRate = $amountConfig ? (
                ($amountConfig->daily_pulses_middle ?? 0) +
                ($amountConfig->daily_vegetables_middle ?? 0) +
                ($amountConfig->daily_oil_middle ?? 0) +
                ($amountConfig->daily_salt_middle ?? 0) +
                ($amountConfig->daily_fuel_middle ?? 0)
            ) : 0;

            $totalAmountPrimary += round($consumption->served_primary * $pAmountRate, 2);
            $totalAmountMiddle += round($consumption->served_middle * $mAmountRate, 2);
        }

        $totalStudentsServed = $totalPrimaryStudents + $totalMiddleStudents;
        $totalServingDays = $consumptions->pluck('date')->unique()->count();

        // Schools by district breakdown (if no district filter)
        $schoolsByDistrict = [];
        if (!$districtId) {
            $schoolsByDistrict = User::schools()
                ->select('district_id', DB::raw('COUNT(*) as count'))
                ->with('district')
                ->groupBy('district_id')
                ->get()
                ->map(function($item) {
                    return [
                        'district_id' => $item->district_id,
                        'district_name' => $item->district->name ?? 'Unknown',
                        'state' => $item->district->state ?? 'Unknown',
                        'count' => $item->count,
                    ];
                });
        }

        // Schools by zone breakdown (if district filtered)
        $schoolsByZone = [];
        if ($districtId) {
            $schoolsByZone = User::schools()
                ->select('zone_id', DB::raw('COUNT(*) as count'))
                ->where('district_id', $districtId)
                ->with('zone')
                ->groupBy('zone_id')
                ->get()
                ->map(function($item) {
                    return [
                        'zone_id' => $item->zone_id,
                        'zone_name' => $item->zone->name ?? 'Unknown',
                        'count' => $item->count,
                    ];
                });
        }

        // Top 5 schools by rice consumption (for current period)
        $topSchools = DailyConsumption::whereIn('user_id', $schoolIds)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->select('user_id', DB::raw('SUM(rice_consumed) as total_rice'))
            ->groupBy('user_id')
            ->orderBy('total_rice', 'desc')
            ->limit(5)
            ->with('user.district', 'user.zone')
            ->get()
            ->map(function($item) use ($month, $year) {
                $servingDays = DailyConsumption::where('user_id', $item->user_id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->pluck('date')
                    ->unique()
                    ->count();
                return [
                    'user_id' => $item->user_id,
                    'school_name' => $item->user->school_name ?? 'Unknown',
                    'district_name' => $item->user->district->name ?? 'Unknown',
                    'zone_name' => $item->user->zone->name ?? 'Unknown',
                    'total_rice' => round($item->total_rice, 2),
                    'serving_days' => $servingDays,
                ];
            });

        // Recent activity - Last 10 daily consumption entries
        $recentActivity = DailyConsumption::whereIn('user_id', $schoolIds)
            ->with(['user.district', 'user.zone'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($consumption) {
                $user = $consumption->user;

                $enrollment = $user ? $user->getEnrollmentData() : ['primary' => 0, 'middle' => 0];

                $consumptionDate = Carbon::parse($consumption->date);

                // Get Rice Configuration for the specific month
                $riceConfig = MonthlyRiceConfiguration::where('user_id', $consumption->user_id)
                    ->where('month', $consumptionDate->month)
                    ->where('year', $consumptionDate->year)
                    ->first();
                
                // Fallback to latest if specific month not found
                if (!$riceConfig) {
                    $riceConfig = MonthlyRiceConfiguration::where('user_id', $consumption->user_id)->latest()->first();
                }

                $defaultPrimaryRateKg = 0.10;
                $defaultMiddleRateKg = 0.15;
                $primaryRateKg = $riceConfig && $riceConfig->daily_consumption_primary
                    ? ($riceConfig->daily_consumption_primary / 1000)
                    : $defaultPrimaryRateKg;
                $middleRateKg = $riceConfig && $riceConfig->daily_consumption_upper_primary
                    ? ($riceConfig->daily_consumption_upper_primary / 1000)
                    : $defaultMiddleRateKg;

                $servedPrimary = (int) ($consumption->served_primary ?? 0);
                $servedMiddle = (int) ($consumption->served_middle ?? 0);
                $ricePrimary = round($servedPrimary * $primaryRateKg, 2);
                $riceMiddle = round($servedMiddle * $middleRateKg, 2);

                // Get Amount Configuration for the specific month
                // ✅ UPDATED: Use MonthlyAmountConfiguration
                $amountConfig = MonthlyAmountConfiguration::where('user_id', $consumption->user_id)
                    ->where('month', $consumptionDate->month)
                    ->where('year', $consumptionDate->year)
                    ->first();

                // Fallback to latest if specific month not found
                if (!$amountConfig) {
                    $amountConfig = MonthlyAmountConfiguration::where('user_id', $consumption->user_id)
                        ->orderBy('year', 'desc')
                        ->orderBy('month', 'desc')
                        ->first();
                }

                $primaryAmountRate = $amountConfig
                    ? (($amountConfig->daily_pulses_primary ?? 0)
                        + ($amountConfig->daily_vegetables_primary ?? 0)
                        + ($amountConfig->daily_oil_primary ?? 0)
                        + ($amountConfig->daily_salt_primary ?? 0)
                        + ($amountConfig->daily_fuel_primary ?? 0))
                    : 0;
                $middleAmountRate = $amountConfig
                    ? (($amountConfig->daily_pulses_middle ?? 0)
                        + ($amountConfig->daily_vegetables_middle ?? 0)
                        + ($amountConfig->daily_oil_middle ?? 0)
                        + ($amountConfig->daily_salt_middle ?? 0)
                        + ($amountConfig->daily_fuel_middle ?? 0))
                    : 0;
                $amountPrimary = round($servedPrimary * $primaryAmountRate, 2);
                $amountMiddle = round($servedMiddle * $middleAmountRate, 2);

                return [
                    'id' => $consumption->id,
                    'user_id' => $consumption->user_id,
                    'date' => $consumption->date,
                    'school_name' => $user->school_name ?? 'Unknown',
                    'udise' => $user->udise_code ?? '', // Fixed column name
                    'district_name' => $user->district->name ?? 'Unknown',
                    'zone_name' => $user->zone->name ?? 'Unknown',
                    'served_primary' => $servedPrimary,
                    'served_middle' => $servedMiddle,
                    'students_served' => $servedPrimary + $servedMiddle,
                    'enrollment_primary' => (int) ($enrollment['primary'] ?? 0),
                    'enrollment_middle' => (int) ($enrollment['middle'] ?? 0),
                    'rice_consumed' => round($consumption->rice_consumed ?? 0, 2),
                    'rice_primary' => $ricePrimary,
                    'rice_middle' => $riceMiddle,
                    'amount_consumed' => round($consumption->amount_consumed ?? 0, 2),
                    'amount_primary' => $amountPrimary,
                    'amount_middle' => $amountMiddle,
                ];
            });

        // Get all districts for filter dropdown
        $allDistricts = District::with('zones')
            ->orderBy('state')
            ->orderBy('name')
            ->get();

        // Get zones for selected district (if any)
        $allZones = [];
        if ($districtId) {
            $allZones = Zone::where('district_id', $districtId)
                ->orderBy('name')
                ->get();
        }

        // ========================================
        // NEW: GET FEEDBACK STATISTICS
        // ========================================
        $feedbackStats = $this->getFeedbackStatistics();

        // Prepare statistics object
        $statistics = [
            'school_stats' => [
                'total' => $totalSchools,
                'active' => $activeSchools,
                'inactive' => $inactiveSchools,
            ],
            'period_stats' => [
                'rice_consumed' => round($totalRiceConsumed, 2),
                'amount_spent' => round($totalAmountSpent, 2),
                'students_served' => $totalStudentsServed,
                'serving_days' => $totalServingDays,
                'primary_students' => $totalPrimaryStudents,
                'middle_students' => $totalMiddleStudents,
                'rice_primary' => round($totalRicePrimary, 2),
                'rice_middle' => round($totalRiceMiddle, 2),
                'amount_primary' => round($totalAmountPrimary, 2),
                'amount_middle' => round($totalAmountMiddle, 2),
            ],
            'breakdowns' => [
                'schools_by_district' => $schoolsByDistrict,
                'schools_by_zone' => $schoolsByZone,
            ],
            'top_schools' => $topSchools,
            'recent_activity' => $recentActivity,
        ];

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'districts' => $allDistricts,
            'zones' => $allZones,
            'filters' => [
                'district_id' => $districtId,
                'zone_id' => $zoneId,
                'month' => $month,
                'year' => $year,
            ],
            'feedbackStats' => $feedbackStats, // ADD THIS LINE
        ]);
    }

    /**
     * NEW METHOD: Get feedback statistics for dashboard card
     */
    private function getFeedbackStatistics(): array
    {
        $total = Feedback::count();
        $new = Feedback::where('status', 'new')->count();
        $inProgress = Feedback::where('status', 'in_progress')->count();
        $resolved = Feedback::where('status', 'resolved')->count();
        $urgent = Feedback::whereIn('priority', ['urgent', 'high'])->count();
        
        // Get average rating
        $averageRating = Feedback::avg('rating') ?? 0;
        
        // Recent feedback (last 5)
        $recentFeedback = Feedback::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($feedback) {
                return [
                    'id' => $feedback->id,
                    'name' => $feedback->name,
                    'type' => $feedback->type,
                    'status' => $feedback->status,
                    'priority' => $feedback->priority,
                    'rating' => $feedback->rating,
                    'created_at' => $feedback->created_at->format('d M Y'),
                ];
            });

        return [
            'total' => $total,
            'new' => $new,
            'in_progress' => $inProgress,
            'resolved' => $resolved,
            'urgent' => $urgent,
            'average_rating' => $averageRating ? round($averageRating, 1) : 0,
            'recent' => $recentFeedback,
        ];
    }

    /**
     * Export dashboard data to CSV.
     * 
     * GET /admin/dashboard/export
     */
    public function export(Request $request)
    {
        // ... KEEP EXISTING EXPORT METHOD UNCHANGED ...
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2020',
        ]);

        $districtId = $request->district_id;
        $zoneId = $request->zone_id;
        $month = $request->month ?? Carbon::now()->month;
        $year = $request->year ?? Carbon::now()->year;

        $schoolsQuery = User::schools()->with(['district', 'zone']);

        if ($districtId) {
            $schoolsQuery->where('district_id', $districtId);
        }

        if ($zoneId) {
            $schoolsQuery->where('zone_id', $zoneId);
        }

        $schools = $schoolsQuery->get();
        $schoolIds = $schools->pluck('id');

        $consumptionsBySchool = DailyConsumption::whereIn('user_id', $schoolIds)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->select('user_id', 
                DB::raw('SUM(rice_consumed) as total_rice'),
                DB::raw('SUM(amount_consumed) as total_amount'),
                DB::raw('SUM(served_primary + served_middle) as total_students'),
                DB::raw('COUNT(DISTINCT date) as serving_days')
            )
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $filename = 'dashboard_export_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function() use ($schools, $consumptionsBySchool, $month, $year) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Dashboard Export - ' . date('F Y', mktime(0, 0, 0, $month, 1, $year))]);
            fputcsv($handle, ['Generated on: ' . now()->format('d M Y H:i:s')]);
            fputcsv($handle, []);

            fputcsv($handle, [
                'School Name',
                'UDISE',
                'District',
                'Zone',
                'State',
                'Status',
                'Rice Consumed (kg)',
                'Amount Spent (₹)',
                'Students Served',
                'Serving Days',
            ]);

            foreach ($schools as $school) {
                $consumption = $consumptionsBySchool->get($school->id);

                fputcsv($handle, [
                    $school->school_name ?? '',
                    $school->udise_code ?? '',
                    $school->district->name ?? '',
                    $school->zone->name ?? '',
                    $school->district->state ?? '',
                    $school->is_active ? 'Active' : 'Inactive',
                    $consumption ? round($consumption->total_rice, 2) : 0,
                    $consumption ? round($consumption->total_amount, 2) : 0,
                    $consumption ? $consumption->total_students : 0,
                    $consumption ? $consumption->serving_days : 0,
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, [
                'TOTALS',
                '',
                '',
                '',
                '',
                '',
                round($consumptionsBySchool->sum('total_rice'), 2),
                round($consumptionsBySchool->sum('total_amount'), 2),
                $consumptionsBySchool->sum('total_students'),
                '',
            ]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
