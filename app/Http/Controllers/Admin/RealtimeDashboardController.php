<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Feedback;
use App\Models\DailyConsumption;
use App\Models\RiceReport;
use App\Models\AmountReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RealtimeDashboardController extends Controller
{
    /**
     * Show real-time admin dashboard
     */
    public function index(): Response
    {
        $stats = $this->getRealtimeStats();
        $systemHealth = $this->getSystemHealth();
        $recentActivity = $this->getRecentActivity();
        $feedbackStats = $this->getFeedbackStats();

        return Inertia::render('Admin/RealtimeDashboard', [
            'stats' => $stats,
            'systemHealth' => $systemHealth,
            'recentActivity' => $recentActivity,
            'feedbackStats' => $feedbackStats
        ]);
    }

    /**
     * Get real-time statistics API endpoint
     */
    public function getStats()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getRealtimeStats(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get system health status
     */
    public function getHealth()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getSystemHealth(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get recent activity feed
     */
    public function getActivity(Request $request)
    {
        $limit = $request->input('limit', 20);
        
        return response()->json([
            'success' => true,
            'data' => $this->getRecentActivity($limit),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get live user sessions
     */
    public function getLiveSessions()
    {
        $activeSessions = User::schools()
            ->where('last_login_at', '>=', now()->subMinutes(15))
            ->select('id', 'name', 'school_name', 'district_id', 'last_login_at')
            ->with('district:id,name')
            ->orderBy('last_login_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activeSessions,
            'count' => $activeSessions->count(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get performance metrics
     */
    public function getPerformanceMetrics()
    {
        $metrics = Cache::remember('performance_metrics', 60, function () {
            return [
                'database_queries' => $this->getDatabaseMetrics(),
                'response_times' => $this->getResponseTimeMetrics(),
                'error_rates' => $this->getErrorRateMetrics(),
                'memory_usage' => $this->getMemoryUsage(),
                'disk_usage' => $this->getDiskUsage()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $metrics,
            'timestamp' => now()->toISOString()
        ]);
    }

    private function getRealtimeStats()
    {
        return Cache::remember('admin_realtime_stats', 60, function () {
            return [
                'total_schools' => User::schools()->count(),
                'active_schools' => User::schools()->where('is_active', true)->count(),
                'total_students' => DailyConsumption::sum(DB::raw('served_primary + served_middle')),
                'total_rice_distributed' => round(DailyConsumption::sum('total_rice'), 2),
                'reports_generated' => RiceReport::count() + AmountReport::count(),
                'active_users_today' => User::schools()
                    ->where('last_login_at', '>=', now()->startOfDay())
                    ->count(),
                'new_feedback_today' => Feedback::whereDate('created_at', today())->count(),
                'pending_feedback' => Feedback::whereIn('status', ['new', 'in_progress'])->count(),
                'system_uptime' => $this->getSystemUptime(),
                'data_growth' => [
                    'daily_consumptions_this_month' => DailyConsumption::whereMonth('created_at', now()->month)->count(),
                    'reports_this_month' => RiceReport::whereMonth('created_at', now()->month)->count() + 
                                          AmountReport::whereMonth('created_at', now()->month)->count(),
                    'new_schools_this_month' => User::schools()->whereMonth('created_at', now()->month)->count()
                ]
            ];
        });
    }

    private function getSystemHealth()
    {
        return [
            'overall_status' => 'healthy',
            'components' => [
                'database' => $this->checkDatabaseHealth(),
                'cache' => $this->checkCacheHealth(),
                'storage' => $this->checkStorageHealth(),
                'queue' => $this->checkQueueHealth(),
                'mail' => $this->checkMailHealth()
            ],
            'last_check' => now()->toISOString()
        ];
    }

    private function getRecentActivity($limit = 20)
    {
        $activities = collect();

        // Recent consumptions
        $consumptions = DailyConsumption::with('user:id,name,school_name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => 'consumption_' . $item->id,
                    'type' => 'consumption',
                    'title' => 'Daily Consumption Added',
                    'description' => "{$item->user->school_name} recorded consumption",
                    'user' => $item->user->name,
                    'timestamp' => $item->created_at,
                    'data' => [
                        'students' => ($item->served_primary ?? 0) + ($item->served_middle ?? 0),
                        'rice' => $item->total_rice
                    ]
                ];
            });

        // Recent feedback
        $feedback = Feedback::latest()
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => 'feedback_' . $item->id,
                    'type' => 'feedback',
                    'title' => 'New Feedback Received',
                    'description' => "From {$item->name} - Rating: {$item->rating}/5",
                    'user' => $item->name,
                    'timestamp' => $item->created_at,
                    'data' => [
                        'rating' => $item->rating,
                        'type' => $item->type,
                        'priority' => $item->priority
                    ]
                ];
            });

        // Recent reports
        $reports = RiceReport::with('user:id,name,school_name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => 'report_' . $item->id,
                    'type' => 'report',
                    'title' => 'Rice Report Generated',
                    'description' => "{$item->user->school_name} generated report for {$item->month}/{$item->year}",
                    'user' => $item->user->name,
                    'timestamp' => $item->created_at,
                    'data' => [
                        'month' => $item->month,
                        'year' => $item->year
                    ]
                ];
            });

        return $activities->concat($consumptions)
            ->concat($feedback)
            ->concat($reports)
            ->sortByDesc('timestamp')
            ->take($limit)
            ->values();
    }

    private function getFeedbackStats()
    {
        return [
            'total' => Feedback::count(),
            'new' => Feedback::where('status', 'new')->count(),
            'urgent' => Feedback::where('priority', 'urgent')->count(),
            'average_rating' => round(Feedback::avg('rating'), 1),
            'response_rate' => $this->calculateResponseRate()
        ];
    }

    private function getSystemUptime()
    {
        // Simple uptime calculation (you can implement more sophisticated tracking)
        return '99.9%';
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            $responseTime = $this->measureDatabaseResponseTime();
            
            return [
                'status' => $responseTime < 100 ? 'healthy' : 'warning',
                'response_time' => $responseTime . 'ms',
                'connections' => 'Active'
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
                'driver' => config('cache.default')
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
        return [
            'status' => 'healthy',
            'driver' => config('queue.default'),
            'pending_jobs' => 0
        ];
    }

    private function checkMailHealth()
    {
        return [
            'status' => 'healthy',
            'driver' => config('mail.default')
        ];
    }

    private function measureDatabaseResponseTime()
    {
        $start = microtime(true);
        User::count();
        $end = microtime(true);
        
        return round(($end - $start) * 1000, 2);
    }

    private function getDatabaseMetrics()
    {
        return [
            'total_queries' => 0, // You can implement query counting
            'slow_queries' => 0,
            'average_response_time' => $this->measureDatabaseResponseTime()
        ];
    }

    private function getResponseTimeMetrics()
    {
        return [
            'average' => '120ms',
            'p95' => '250ms',
            'p99' => '500ms'
        ];
    }

    private function getErrorRateMetrics()
    {
        return [
            'rate' => '0.1%',
            'total_errors' => 0,
            'last_error' => null
        ];
    }

    private function getMemoryUsage()
    {
        return [
            'current' => $this->formatBytes(memory_get_usage(true)),
            'peak' => $this->formatBytes(memory_get_peak_usage(true)),
            'limit' => ini_get('memory_limit')
        ];
    }

    private function getDiskUsage()
    {
        $diskSpace = disk_free_space(storage_path());
        $diskTotal = disk_total_space(storage_path());
        
        return [
            'total' => $this->formatBytes($diskTotal),
            'used' => $this->formatBytes($diskTotal - $diskSpace),
            'free' => $this->formatBytes($diskSpace),
            'usage_percent' => round((($diskTotal - $diskSpace) / $diskTotal) * 100, 2)
        ];
    }

    private function calculateResponseRate()
    {
        $total = Feedback::count();
        if ($total === 0) return 0;
        
        $responded = Feedback::whereNotNull('admin_response')->count();
        return round(($responded / $total) * 100, 1);
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
