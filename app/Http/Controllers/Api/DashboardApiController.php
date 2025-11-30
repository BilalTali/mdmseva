<?php

// File: app/Http/Controllers/Api/DashboardApiController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Models\DailyConsumption;
use App\Services\ConsumptionCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DashboardApiController extends Controller
{
    /**
     * Get the current or latest period with data
     */
    private function getPeriod(Request $request, $userId)
    {
        if ($request->has('year') && $request->has('month')) {
            return [
                'year' => (int) $request->input('year'),
                'month' => (int) $request->input('month')
            ];
        }

        // Find latest month with data
        $latestConsumption = DailyConsumption::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->first();

        if ($latestConsumption) {
            return [
                'year' => $latestConsumption->date->year,
                'month' => $latestConsumption->date->month
            ];
        }

        // Default to current month
        return [
            'year' => now()->year,
            'month' => now()->month
        ];
    }

    /**
     * Get rice configuration for a specific period (month/year only)
     * No fallback to latest/global config.
     */
    private function getRiceConfiguration(int $userId, int $year, int $month): ?MonthlyRiceConfiguration
    {
        return MonthlyRiceConfiguration::forUser($userId)
            ->forPeriod($month, $year)
            ->first();
    }

    /**
     * Get amount configuration for a specific period (month/year only)
     * No fallback to latest/global config.
     */
    private function getAmountConfiguration(int $userId, int $year, int $month): ?MonthlyAmountConfiguration
    {
        return MonthlyAmountConfiguration::forUser($userId)
            ->forPeriod($month, $year)
            ->first();
    }

    /**
     * Calculate rice available for the selected month only
     * Uses month-specific configuration and consumption.
     */
    private function calculateRiceAvailable($riceConfig, $year, $month)
    {
        if (!$riceConfig) {
            return 0;
        }

        // Opening + lifted + arranged for both sections
        $openingPrimary = ($riceConfig->opening_balance_primary ?? 0) + ($riceConfig->rice_lifted_primary ?? 0) + ($riceConfig->rice_arranged_primary ?? 0);
        $openingUpper   = ($riceConfig->opening_balance_upper_primary ?? 0) + ($riceConfig->rice_lifted_upper_primary ?? 0) + ($riceConfig->rice_arranged_upper_primary ?? 0);

        // Consumed for this month only (already month-specific on config after sync)
        $consumedPrimary = $riceConfig->consumed_primary ?? 0;
        $consumedUpper   = $riceConfig->consumed_upper_primary ?? 0;

        $available = ($openingPrimary + $openingUpper) - ($consumedPrimary + $consumedUpper);

        return round($available, 2);
    }

    /**
     * Calculate initial balance based on school type
     */
    private function calculateInitialBalance($riceConfig)
    {
        if (!$riceConfig) {
            return 0;
        }

        $schoolType = $riceConfig->school_type;

        if ($schoolType === 'primary') {
            return $riceConfig->total_available_primary;
        } elseif ($schoolType === 'middle') {
            return $riceConfig->total_available_primary + $riceConfig->total_available_upper_primary;
        }

        return $riceConfig->total_available_primary;
    }

    /**
     * Sync consumed amounts from actual DailyConsumption records
     */
    protected function syncConsumedAmounts(MonthlyRiceConfiguration $config): void
    {
        // Get total consumed from ALL consumption records for this user
        $totalConsumedPrimary = DailyConsumption::where('user_id', $config->user_id)
            ->selectRaw('SUM(served_primary * ?) as total', [0.1]) // Primary rate: 0.1 kg per student
            ->value('total') ?? 0;

        $totalConsumedMiddle = DailyConsumption::where('user_id', $config->user_id)
            ->selectRaw('SUM(served_middle * ?) as total', [0.15]) // Middle rate: 0.15 kg per student
            ->value('total') ?? 0;

        // Update consumed amounts
        $config->consumed_primary = round($totalConsumedPrimary, 2);
        $config->consumed_upper_primary = round($totalConsumedMiddle, 2);

        // Use recomputeTotals() to update closing balances
        $config->recomputeTotals();

        $config->save();
    }

    /**
     * Get dashboard summary statistics
     */
    public function getSummary(Request $request)
    {
        try {
            $user = $request->user();
            $enrollment = $user->getEnrollmentData();
            $totalEnrolledStudents = ($enrollment['total'] ?? 0)
                ?: (($enrollment['primary'] ?? 0) + ($enrollment['middle'] ?? 0));
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get configurations for selected period
            $riceConfig = $this->getRiceConfiguration($user->id, $year, $month);
            
            // Sync consumed amounts using month-specific method on the model
            if ($riceConfig) {
                $riceConfig->syncConsumedFromDaily();
                $riceConfig->refresh();
            }
            
            $amountConfig = $this->getAmountConfiguration($user->id, $year, $month);

            // Check if month is before configuration was set
            $isBeforeConfig = false;
            if ($riceConfig && $riceConfig->last_updated_year && $riceConfig->last_updated_month) {
                $configDate = \Carbon\Carbon::create($riceConfig->last_updated_year, $riceConfig->last_updated_month, 1);
                $selectedDate = \Carbon\Carbon::create($year, $month, 1);
                $isBeforeConfig = $selectedDate->lt($configDate);
            }

            // If no rice config, return zeros
            if (!$riceConfig) {
                return response()->json([
                    'rice_available' => 0,
                    'rice_consumed' => 0,
                    'amount_spent' => 0,
                    'students_served' => 0,
                    'days_served' => 0,
                    'total_students' => $totalEnrolledStudents,
                    'student_serving_target' => 0,
                    'current_month' => $month,
                    'current_year' => $year,
                    'primary_rice_consumed' => 0,
                    'middle_rice_consumed' => 0,
                    'primary_amount_spent' => 0,
                    'middle_amount_spent' => 0,
                    'primary_students_served' => 0,
                    'middle_students_served' => 0,
                    'is_before_config' => false,
                    'config_missing' => true,
                    'message' => 'Rice configuration not set up yet.',
                ]);
            }

            // Get daily consumptions for the month
            $dailyConsumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->get();

            // If no consumption and NOT current month, return 0s (hide data)
            $isCurrentMonth = ($year == now()->year && $month == now()->month);
            if ($dailyConsumptions->isEmpty() && !$isCurrentMonth) {
                 return response()->json([
                    'rice_available' => 0,
                    'rice_consumed' => 0,
                    'amount_spent' => 0,
                    'students_served' => 0,
                    'days_served' => 0,
                    'total_students' => $totalEnrolledStudents,
                    'student_serving_target' => 0,
                    'current_month' => $month,
                    'current_year' => $year,
                    'primary_rice_consumed' => 0,
                    'middle_rice_consumed' => 0,
                    'primary_amount_spent' => 0,
                    'middle_amount_spent' => 0,
                    'primary_students_served' => 0,
                    'middle_students_served' => 0,
                    'is_before_config' => false,
                    'message' => 'No data available for this month.',
                ]);
            }

            // Calculate historical rice available
            $riceAvailable = $this->calculateRiceAvailable($riceConfig, $year, $month);

            // Total rice available for this month (opening + lifted + arranged)
            $totalAvailablePrimary = ($riceConfig->opening_balance_primary ?? 0)
                + ($riceConfig->rice_lifted_primary ?? 0)
                + ($riceConfig->rice_arranged_primary ?? 0);
            $totalAvailableUpper = ($riceConfig->opening_balance_upper_primary ?? 0)
                + ($riceConfig->rice_lifted_upper_primary ?? 0)
                + ($riceConfig->rice_arranged_upper_primary ?? 0);
            $totalAvailable = $totalAvailablePrimary + $totalAvailableUpper;

            // Calculate closing balance for selected month from configuration (current stock)
            $closingBalance = ($riceConfig->closing_balance_primary ?? 0)
                + ($riceConfig->closing_balance_upper_primary ?? 0);

            // Calculate totals
            $totalRiceConsumed = $dailyConsumptions->sum('total_rice');
            $totalStudentsServed = $dailyConsumptions->sum(function($consumption) {
                return ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0);
            });
            $daysOfService = $dailyConsumptions->count();
            $studentServingTarget = $daysOfService > 0
                ? $totalEnrolledStudents * $daysOfService
                : $totalEnrolledStudents;

            // Calculate breakdown by section
            $primaryRiceConsumed = 0;
            $middleRiceConsumed = 0;
            $primaryAmountSpent = 0;
            $middleAmountSpent = 0;
            $primaryStudentsServed = 0;
            $middleStudentsServed = 0;
            $totalAmountSpent = 0;

            foreach ($dailyConsumptions as $consumption) {
                $primaryRiceConsumed += ($consumption->served_primary ?? 0) * 0.1;
                $middleRiceConsumed += ($consumption->served_middle ?? 0) * 0.15;

                $primaryStudentsServed += ($consumption->served_primary ?? 0);
                $middleStudentsServed += ($consumption->served_middle ?? 0);
            }

            if ($amountConfig) {
                $calculationService = app(ConsumptionCalculationService::class);
                $monthlyTotals = $calculationService->calculateMonthlyAmountTotals(
                    $dailyConsumptions,
                    $amountConfig,
                    $user
                );

                $totalAmountSpent = $monthlyTotals['grand_total'] ?? 0;
                $primaryAmountSpent = $monthlyTotals['total_primary_amount'] ?? 0;
                $middleAmountSpent = $monthlyTotals['total_middle_amount'] ?? 0;
            }

            return response()->json([
                'rice_available' => round($riceAvailable, 2),
                'total_available' => round($totalAvailable, 2),
                'closing_balance' => round($closingBalance, 2),
                'rice_consumed' => round($totalRiceConsumed, 2),
                'amount_spent' => round($totalAmountSpent, 2),
                'students_served' => $totalStudentsServed,
                'days_served' => $daysOfService,
                'total_students' => $totalEnrolledStudents,
                'student_serving_target' => $studentServingTarget,
                'current_month' => $month,
                'current_year' => $year,
                'primary_rice_consumed' => round($primaryRiceConsumed, 2),
                'middle_rice_consumed' => round($middleRiceConsumed, 2),
                'primary_amount_spent' => round($primaryAmountSpent, 2),
                'middle_amount_spent' => round($middleAmountSpent, 2),
                'primary_students_served' => $primaryStudentsServed,
                'middle_students_served' => $middleStudentsServed,
                'is_before_config' => $isBeforeConfig,
                'message' => $isBeforeConfig ? 'Selected month is before rice configuration was set.' : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard API getSummary error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch dashboard summary',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rice balance timeseries for line chart
     */
    public function getRiceBalanceTimeseries(Request $request)
    {
        try {
            $user = $request->user();
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get rice configuration for selected period
            $riceConfig = $this->getRiceConfiguration($user->id, $year, $month);

            if (!$riceConfig) {
                return response()->json([]);
            }

            // Sync: Ensure data is up-to-date for this month
            $riceConfig->syncConsumedFromDaily();

            // Get initial balance
            $initialBalance = $this->calculateInitialBalance($riceConfig);

            // Get daily consumptions for the month ordered by date
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();

            $data = [];
            $runningBalance = $initialBalance;

            // Rice consumption rates
            $primaryRate = 0.1;
            $middleRate = 0.15;

            foreach ($consumptions as $consumption) {
                $opening = $runningBalance;

                $primaryConsumed = ($consumption->served_primary ?? 0) * $primaryRate;
                $middleConsumed = ($consumption->served_middle ?? 0) * $middleRate;
                $totalConsumed = $consumption->total_rice;

                $closing = max(0, $opening - $totalConsumed);

                $data[] = [
                    'date' => $consumption->date->format('Y-m-d'),
                    'opening' => round($opening, 2),
                    'consumed' => round($totalConsumed, 2),
                    'closing' => round($closing, 2),
                    'primary_consumed' => round($primaryConsumed, 2),
                    'middle_consumed' => round($middleConsumed, 2),
                ];

                $runningBalance = $closing;
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getRiceBalanceTimeseries error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch rice balance data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDailyAmountChart(Request $request)
    {
        try {
            $user = $request->user();
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get amount configuration for selected period
            $amountConfig = $this->getAmountConfiguration($user->id, $year, $month);

            if (!$amountConfig) {
                return response()->json([]);
            }

            // Get daily consumptions
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();

            $data = [];

            foreach ($consumptions as $consumption) {
                $servedPrimary = $consumption->served_primary ?? 0;
                $servedMiddle = $consumption->served_middle ?? 0;

                // Calculate section totals using current monthly config
                // Prefer precomputed daily_amount_per_student_* if present, otherwise
                // fall back to summing component daily_* rates.
                $primaryRate = ($amountConfig->daily_amount_per_student_primary ?? null);
                if ($primaryRate === null) {
                    $primaryRate = ($amountConfig->daily_pulses_primary ?? 0)
                        + ($amountConfig->daily_vegetables_primary ?? 0)
                        + ($amountConfig->daily_oil_primary ?? 0)
                        + ($amountConfig->daily_salt_primary ?? 0)
                        + ($amountConfig->daily_fuel_primary ?? 0);
                }

                $middleRate = ($amountConfig->daily_amount_per_student_upper_primary ?? null);
                if ($middleRate === null) {
                    $middleRate = ($amountConfig->daily_pulses_middle ?? 0)
                        + ($amountConfig->daily_vegetables_middle ?? 0)
                        + ($amountConfig->daily_oil_middle ?? 0)
                        + ($amountConfig->daily_salt_middle ?? 0)
                        + ($amountConfig->daily_fuel_middle ?? 0);
                }

                $primaryAmount = $servedPrimary * $primaryRate;
                $middleAmount = $servedMiddle * $middleRate;
                $totalAmount = $primaryAmount + $middleAmount;

                // Break down by component
                $primaryBreakdown = [
                    'pulses' => $servedPrimary * ($amountConfig->daily_pulses_primary ?? 0),
                    'vegetables' => $servedPrimary * ($amountConfig->daily_vegetables_primary ?? 0),
                    'oil' => $servedPrimary * ($amountConfig->daily_oil_primary ?? 0),
                    'salt' => $servedPrimary * ($amountConfig->daily_salt_primary ?? 0),
                    'fuel' => $servedPrimary * ($amountConfig->daily_fuel_primary ?? 0),
                ];

                $middleBreakdown = [
                    'pulses' => $servedMiddle * ($amountConfig->daily_pulses_middle ?? 0),
                    'vegetables' => $servedMiddle * ($amountConfig->daily_vegetables_middle ?? 0),
                    'oil' => $servedMiddle * ($amountConfig->daily_oil_middle ?? 0),
                    'salt' => $servedMiddle * ($amountConfig->daily_salt_middle ?? 0),
                    'fuel' => $servedMiddle * ($amountConfig->daily_fuel_middle ?? 0),
                ];

                $data[] = [
                    'date' => $consumption->date->format('Y-m-d'),
                    'amount' => round($totalAmount, 2),
                    'primary_amount' => round($primaryAmount, 2),
                    'middle_amount' => round($middleAmount, 2),
                    'pulses' => round($primaryBreakdown['pulses'] + $middleBreakdown['pulses'], 2),
                    'vegetables' => round($primaryBreakdown['vegetables'] + $middleBreakdown['vegetables'], 2),
                    'oil' => round($primaryBreakdown['oil'] + $middleBreakdown['oil'], 2),
                    'salt' => round($primaryBreakdown['salt'] + $middleBreakdown['salt'], 2),
                    'fuel' => round($primaryBreakdown['fuel'] + $middleBreakdown['fuel'], 2),
                ];
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getDailyAmountChart error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch daily amount data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get amount breakdown by component for pie chart
     */
    public function getAmountBreakdown(Request $request)
    {
        try {
            $user = $request->user();
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get amount configuration for selected period
            $amountConfig = $this->getAmountConfiguration($user->id, $year, $month);

            if (!$amountConfig) {
                return response()->json([
                    'pulses_total' => 0,
                    'vegetables_total' => 0,
                    'oil_total' => 0,
                    'salt_total' => 0,
                    'fuel_total' => 0,
                ]);
            }

            // Get daily consumptions for the month
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->get();

            // Calculate totals
            $totals = [
                'pulses' => 0,
                'vegetables' => 0,
                'oil' => 0,
                'salt' => 0,
                'fuel' => 0,
            ];

            foreach ($consumptions as $consumption) {
                $servedPrimary = $consumption->served_primary ?? 0;
                $servedMiddle = $consumption->served_middle ?? 0;

                $totals['pulses'] += ($servedPrimary * $amountConfig->daily_pulses_primary) +
                                    ($servedMiddle * $amountConfig->daily_pulses_middle);

                $totals['vegetables'] += ($servedPrimary * $amountConfig->daily_vegetables_primary) +
                                        ($servedMiddle * $amountConfig->daily_vegetables_middle);

                $totals['oil'] += ($servedPrimary * $amountConfig->daily_oil_primary) +
                                 ($servedMiddle * $amountConfig->daily_oil_middle);

                $totals['salt'] += ($servedPrimary * $amountConfig->daily_salt_primary) +
                                  ($servedMiddle * $amountConfig->daily_salt_middle);

                $totals['fuel'] += ($servedPrimary * $amountConfig->daily_fuel_primary) +
                                  ($servedMiddle * $amountConfig->daily_fuel_middle);
            }

            return response()->json([
                'pulses_total' => round($totals['pulses'], 2),
                'vegetables_total' => round($totals['vegetables'], 2),
                'oil_total' => round($totals['oil'], 2),
                'salt_total' => round($totals['salt'], 2),
                'fuel_total' => round($totals['fuel'], 2),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard API getAmountBreakdown error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch amount breakdown',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent consumptions with proper date formatting
     */
    public function getRecentConsumptions(Request $request)
    {
        try {
            $user = $request->user();
            $perPage = $request->input('per_page', 10);

            // Get month/year filters if provided
            $query = DailyConsumption::where('user_id', $user->id);

            if ($request->has('month') && $request->has('year')) {
                $query->whereYear('date', $request->year)
                      ->whereMonth('date', $request->month);
            }

            $consumptions = $query->orderBy('date', 'desc')
                ->paginate($perPage);

            // Transform the data
            $consumptions->getCollection()->transform(function ($consumption) {
                return [
                    'id' => $consumption->id,
                    'date' => $consumption->date ? $consumption->date->format('Y-m-d') : null,
                    'day' => $consumption->day ?? null,
                    'served_primary' => $consumption->served_primary ?? 0,
                    'served_middle' => $consumption->served_middle ?? 0,
                    'rice_consumed' => round($consumption->total_rice, 2),
                    'amount_consumed' => round($consumption->amount_consumed ?? 0, 2),
                    'rice_balance_after' => round($consumption->rice_balance_after ?? 0, 2),
                    'remarks' => $consumption->remarks ?? null,
                ];
            });

            return response()->json($consumptions);
        } catch (\Exception $e) {
            Log::error('Dashboard API getRecentConsumptions error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch recent consumptions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated consumption records with filtering
     */
    public function getConsumptions(Request $request)
    {
        try {
            $user = $request->user();

            $query = DailyConsumption::where('user_id', $user->id)
                ->orderBy('date', 'desc');

            // Apply filters
            if ($request->has('month')) {
                $query->whereMonth('date', $request->month);
            }

            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }

            $perPage = $request->input('per_page', 10);
            $consumptions = $query->paginate($perPage);

            // Transform data
            $consumptions->getCollection()->transform(function ($consumption) {
                return [
                    'id' => $consumption->id,
                    'date' => $consumption->date ? $consumption->date->format('Y-m-d') : null,
                    'day' => $consumption->day,
                    'served_primary' => $consumption->served_primary ?? 0,
                    'served_middle' => $consumption->served_middle ?? 0,
                    'rice_consumed' => round($consumption->total_rice, 2),
                    'amount_consumed' => round($consumption->amount_consumed ?? 0, 2),
                    'rice_balance_after' => round($consumption->rice_balance_after ?? 0, 2),
                ];
            });

            return response()->json($consumptions);
        } catch (\Exception $e) {
            Log::error('Dashboard API getConsumptions error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch consumptions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity feed
     */
    public function getActivityFeed(Request $request)
    {
        try {
            $user = $request->user();
            $limit = $request->input('limit', 5);

            // Get recent consumptions as activities
            $activities = DailyConsumption::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($consumption) {
                    $totalServed = ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0);
                    return [
                        'type' => 'consumption_added',
                        'description' => "Added consumption for {$consumption->date->format('d M Y')}",
                        'timestamp' => $consumption->created_at,
                        'data' => [
                            'date' => $consumption->date ? $consumption->date->format('Y-m-d') : null,
                            'rice_consumed' => round($consumption->total_rice, 2),
                            'students_served' => $totalServed,
                            'served_primary' => $consumption->served_primary ?? 0,
                            'served_middle' => $consumption->served_middle ?? 0,
                        ]
                    ];
                });

            return response()->json($activities);
        } catch (\Exception $e) {
            Log::error('Dashboard API getActivityFeed error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch activity feed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get weekly trends data for the selected month (formerly monthly trends)
     */
    public function getMonthlyTrends(Request $request)
    {
        try {
            $user = $request->user();

            // Use same period resolution as other endpoints
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get amount configuration for selected period (may be null)
            $amountConfig = $this->getAmountConfiguration($user->id, $year, $month);

            // Get all consumptions for the selected month
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();

            if ($consumptions->isEmpty()) {
                return response()->json([]);
            }

            // Group by week of month
            $weeks = [];

            foreach ($consumptions as $consumption) {
                $weekNumber = $consumption->date->weekOfMonth; // 1..5

                if (!isset($weeks[$weekNumber])) {
                    $weeks[$weekNumber] = [
                        'week' => $weekNumber,
                        'week_label' => 'Week ' . $weekNumber,
                        'rice_consumed' => 0,
                        'amount_spent' => 0,
                        'students_served' => 0,
                        'days_count' => 0,
                    ];
                }

                // Rice
                $weeks[$weekNumber]['rice_consumed'] += $consumption->total_rice ?? 0;

                // Students
                $servedStudents = ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0);
                $weeks[$weekNumber]['students_served'] += $servedStudents;

                // Amount (if config exists)
                if ($amountConfig) {
                    $primaryAmount = ($consumption->served_primary ?? 0) * $amountConfig->total_daily_primary;
                    $middleAmount = ($consumption->served_middle ?? 0) * $amountConfig->total_daily_middle;
                    $weeks[$weekNumber]['amount_spent'] += ($primaryAmount + $middleAmount);
                }

                $weeks[$weekNumber]['days_count']++;
            }

            // Build final data array sorted by week
            ksort($weeks);

            $data = [];
            foreach ($weeks as $week) {
                $daysCount = max(1, $week['days_count']);

                // Approximate average attendance rate similar to monthly logic
                $avgAttendanceRate = ($week['students_served'] / ($daysCount * 100)) * 100;

                $data[] = [
                    'week' => $week['week'],
                    'week_label' => $week['week_label'],
                    'rice_consumed' => round($week['rice_consumed'], 2),
                    'amount_spent' => round($week['amount_spent'], 2),
                    'students_served' => $week['students_served'],
                    'avg_attendance_rate' => round($avgAttendanceRate, 1),
                ];
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getMonthlyTrends error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch monthly trends data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory status
     */
    public function getInventoryStatus(Request $request)
    {
        try {
            $user = $request->user();
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get rice configuration for rice stock for selected period
            $riceConfig = $this->getRiceConfiguration($user->id, $year, $month);
            $riceAvailable = 0;
            if ($riceConfig) {
                // Ensure month-specific totals are in sync
                $riceConfig->syncConsumedFromDaily();
                $riceAvailable = ($riceConfig->closing_balance_primary ?? 0)
                    + ($riceConfig->closing_balance_upper_primary ?? 0);
            }

            // Mock data for other inventory items (you can replace with actual inventory models)
            $data = [
                'rice_current' => round($riceAvailable, 2),
                'rice_minimum' => 50, // Minimum required stock
                'pulses_current' => rand(20, 100),
                'pulses_minimum' => 25,
                'vegetables_current' => rand(15, 80),
                'vegetables_minimum' => 20,
                'oil_current' => rand(10, 50),
                'oil_minimum' => 15,
                'salt_current' => rand(5, 30),
                'salt_minimum' => 10,
                'fuel_current' => rand(20, 100),
                'fuel_minimum' => 30,
            ];

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getInventoryStatus error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch inventory status data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student attendance data for chart
     */
    public function getStudentAttendance(Request $request)
    {
        try {
            $user = $request->user();
            $period = $this->getPeriod($request, $user->id);
            $year = $period['year'];
            $month = $period['month'];

            // Get daily consumptions for the month
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();

            if ($consumptions->isEmpty()) {
                return response()->json([]);
            }

            // Get total students enrolled from user enrollment data
            $enrollment = $user->getEnrollmentData();
            $totalPrimaryStudents = (int) ($enrollment['primary'] ?? 0);
            $totalMiddleStudents = (int) ($enrollment['middle'] ?? 0);

            $data = [];

            foreach ($consumptions as $consumption) {
                $servedPrimary = $consumption->served_primary ?? 0;
                $servedMiddle = $consumption->served_middle ?? 0;
                $totalServed = $servedPrimary + $servedMiddle;

                $totalStudents = $totalPrimaryStudents + $totalMiddleStudents;

                // Calculate attendance rates (percentage)
                $primaryRate = $totalPrimaryStudents > 0 
                    ? round(($servedPrimary / $totalPrimaryStudents) * 100, 1) 
                    : 0;
                $middleRate = $totalMiddleStudents > 0 
                    ? round(($servedMiddle / $totalMiddleStudents) * 100, 1) 
                    : 0;
                $overallRate = $totalStudents > 0
                    ? round(($totalServed / $totalStudents) * 100, 1)
                    : 0;

                $data[] = [
                    'date' => $consumption->date->format('Y-m-d'),
                    'day' => $consumption->date->format('D'),
                    'served_primary' => $servedPrimary,
                    'served_middle' => $servedMiddle,
                    'total_served' => $totalServed,
                    // Fields expected by StudentAttendanceChart
                    'total_students' => $totalStudents,
                    'present_students' => $totalServed,
                    'primary_present' => $servedPrimary,
                    'middle_present' => $servedMiddle,
                    // Precomputed rates for any consumers that use them
                    'primary_rate' => $primaryRate,
                    'middle_rate' => $middleRate,
                    'attendance_rate' => $overallRate,
                ];
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getStudentAttendance error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch student attendance data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get weekly performance data for radar chart
     */
    public function getWeeklyPerformance(Request $request)
    {
        try {
            $user = $request->user();
            
            // Get this week's data
            $thisWeekStart = now()->startOfWeek();
            $thisWeekEnd = now()->endOfWeek();
            $thisWeekConsumptions = DailyConsumption::where('user_id', $user->id)
                ->whereBetween('date', [$thisWeekStart, $thisWeekEnd])
                ->get();

            // Get last week's data
            $lastWeekStart = now()->subWeek()->startOfWeek();
            $lastWeekEnd = now()->subWeek()->endOfWeek();
            $lastWeekConsumptions = DailyConsumption::where('user_id', $user->id)
                ->whereBetween('date', [$lastWeekStart, $lastWeekEnd])
                ->get();

            // Calculate metrics (simplified calculations)
            $thisWeekStudents = $thisWeekConsumptions->sum(function($c) {
                return ($c->served_primary ?? 0) + ($c->served_middle ?? 0);
            });
            $lastWeekStudents = $lastWeekConsumptions->sum(function($c) {
                return ($c->served_primary ?? 0) + ($c->served_middle ?? 0);
            });

            $data = [
                'attendance_rate_current' => $thisWeekConsumptions->count() > 0 ? 
                    min(100, ($thisWeekStudents / ($thisWeekConsumptions->count() * 100)) * 100) : 0,
                'attendance_rate_previous' => $lastWeekConsumptions->count() > 0 ? 
                    min(100, ($lastWeekStudents / ($lastWeekConsumptions->count() * 100)) * 100) : 0,
                'meal_quality_current' => rand(75, 95), // Mock data
                'meal_quality_previous' => rand(70, 90),
                'budget_efficiency_current' => rand(80, 95),
                'budget_efficiency_previous' => rand(75, 90),
                'stock_management_current' => rand(70, 90),
                'stock_management_previous' => rand(65, 85),
                'nutrition_score_current' => rand(85, 95),
                'nutrition_score_previous' => rand(80, 90),
                'compliance_rate_current' => rand(90, 100),
                'compliance_rate_previous' => rand(85, 95),
            ];

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard API getWeeklyPerformance error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch weekly performance data',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
