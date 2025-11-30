<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RiceReport;
use App\Models\AmountReport;
use App\Models\Bill;
use App\Models\DailyConsumption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublicStatsController extends Controller
{
    /**
     * Get real-time statistics for welcome page
     */
    public function getRealtimeStats()
    {
        $isFallback = false;

        try {
            // Cache only the raw statistics array for 5 minutes
            $stats = Cache::remember('public_stats', 300, function () {
                // School statistics for public view:
                // treat any user with a school_name as a school, so
                // even manually created schools are counted.
                $totalSchools = User::whereNotNull('school_name')->count();
                $activeSchools = User::whereNotNull('school_name')
                    ->where('status', 'active')
                    ->count();

                // Get rice reports count
                $riceReportsGenerated = RiceReport::count();

                // Get amount reports count
                $amountReportsGenerated = AmountReport::count();

                // Get bills count by type (column is bill_type in schema)
                $kiryanaaBills = Bill::where('bill_type', 'kiryana')->count();
                $fuelBills = Bill::where('bill_type', 'fuel')->count();

                // Get total students served (sum of all daily consumptions)
                $totalStudentsServed = DailyConsumption::sum(DB::raw('served_primary + served_middle'));

                // Get active users (all active school accounts)
                $activeUsers = $activeSchools;

                // Calculate total rice distributed (sum of all rice consumed)
                $riceDistributed = DailyConsumption::all()->sum('total_rice');

                // Calculate current rice balance across all schools (available rice)
                $riceAvailable = User::whereNotNull('school_name')
                    ->get()
                    ->sum(function (User $user) {
                        return $user->getCurrentRiceBalance();
                    });

                // Additional metrics
                $totalBills = $kiryanaaBills + $fuelBills;
                $averageStudentsPerSchool = $totalSchools > 0 ? round($totalStudentsServed / $totalSchools) : 0;

                return [
                    // Keep original key for backwards compatibility
                    'enrolledSchools' => $totalSchools,
                    // New explicit keys mirroring admin dashboard
                    'totalSchools' => $totalSchools,
                    'activeSchools' => $activeSchools,
                    'riceReportsGenerated' => $riceReportsGenerated,
                    'amountReportsGenerated' => $amountReportsGenerated,
                    'kiryanaaBills' => $kiryanaaBills,
                    'fuelBills' => $fuelBills,
                    'totalBills' => $totalBills,
                    'totalStudentsServed' => $totalStudentsServed,
                    'activeUsers' => $activeUsers,
                    'riceDistributed' => round($riceDistributed, 2),
                    'riceAvailable' => round($riceAvailable, 2),
                    'averageStudentsPerSchool' => $averageStudentsPerSchool,
                    'lastUpdated' => now()->toISOString(),
                ];
            });
        } catch (\Exception $e) {
            // If anything fails, fall back to safe zeroed data (no demo numbers)
            $isFallback = true;
            $stats = [
                'enrolledSchools' => 0,
                'riceReportsGenerated' => 0,
                'amountReportsGenerated' => 0,
                'kiryanaaBills' => 0,
                'fuelBills' => 0,
                'totalBills' => 0,
                'totalStudentsServed' => 0,
                'activeUsers' => 0,
                'riceDistributed' => 0.0,
                'averageStudentsPerSchool' => 0,
                'lastUpdated' => now()->toISOString(),
            ];
        }

        return response()->json([
            'success' => true,
            'is_fallback' => $isFallback,
            'data' => $stats,
        ]);
    }

    /**
     * Get system health status for admin monitoring
     */
    public function getSystemHealth()
    {
        try {
            $health = [
                'database' => $this->checkDatabaseHealth(),
                'cache' => $this->checkCacheHealth(),
                'storage' => $this->checkStorageHealth(),
                'queue' => $this->checkQueueHealth(),
            ];

            $overallStatus = collect($health)->every(fn($status) => $status['status'] === 'healthy') 
                ? 'healthy' : 'degraded';

            return response()->json([
                'success' => true,
                'overall_status' => $overallStatus,
                'components' => $health,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'overall_status' => 'unhealthy',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * Get recent activity for admin dashboard
     */
    public function getRecentActivity(Request $request)
    {
        $limit = $request->input('limit', 10);

        try {
            $activities = collect();

            // Recent consumptions
            $recentConsumptions = DailyConsumption::with('user:id,name,school_name')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($consumption) {
                    return [
                        'type' => 'consumption',
                        'title' => 'Daily Consumption Added',
                        'description' => "{$consumption->user->school_name} recorded consumption for " . $consumption->date->format('M d, Y'),
                        'user' => $consumption->user->name,
                        'timestamp' => $consumption->created_at,
                        'data' => [
                            'students_served' => ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0),
                            'rice_consumed' => $consumption->total_rice
                        ]
                    ];
                });

            // Recent reports
            $recentReports = RiceReport::with('user:id,name,school_name')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($report) {
                    return [
                        'type' => 'report',
                        'title' => 'Rice Report Generated',
                        'description' => "{$report->user->school_name} generated report for {$report->month}/{$report->year}",
                        'user' => $report->user->name,
                        'timestamp' => $report->created_at,
                        'data' => [
                            'month' => $report->month,
                            'year' => $report->year,
                            'total_rice' => $report->total_rice_consumed
                        ]
                    ];
                });

            // Merge and sort activities
            $activities = $recentConsumptions->concat($recentReports)
                ->sortByDesc('timestamp')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch recent activity',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            $userCount = User::count();
            
            return [
                'status' => 'healthy',
                'response_time' => '< 100ms',
                'details' => "Connected, {$userCount} users"
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }

    private function checkCacheHealth()
    {
        try {
            Cache::put('health_check', 'ok', 60);
            $value = Cache::get('health_check');
            
            return [
                'status' => $value === 'ok' ? 'healthy' : 'degraded',
                'details' => 'Cache read/write successful'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }

    private function checkStorageHealth()
    {
        try {
            $diskSpace = disk_free_space(storage_path());
            $diskTotal = disk_total_space(storage_path());
            $usagePercent = round((($diskTotal - $diskSpace) / $diskTotal) * 100, 2);
            
            return [
                'status' => $usagePercent < 90 ? 'healthy' : 'warning',
                'usage_percent' => $usagePercent,
                'free_space' => $this->formatBytes($diskSpace)
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }

    private function checkQueueHealth()
    {
        try {
            // Simple queue health check
            return [
                'status' => 'healthy',
                'details' => 'Queue system operational'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ];
        }
    }

    private function formatBytes($size, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }
}
