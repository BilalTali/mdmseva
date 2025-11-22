<?php

// File: app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\MonthlyRiceConfiguration;
use App\Models\AmountConfiguration;
use App\Models\DailyConsumption;
use App\Models\RiceReport;
use App\Models\AmountReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard page
     * FIXED: Uses latest month with data and proper historical calculation
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get month/year from request OR find latest month with data OR default to current
        if (!$request->has('year') || !$request->has('month')) {
            // Find the most recent consumption record
            $latestConsumption = DailyConsumption::where('user_id', $user->id)
                ->orderBy('date', 'desc')
                ->first();
            
            if ($latestConsumption) {
                $currentYear = $latestConsumption->date->year;
                $currentMonth = $latestConsumption->date->month;
            } else {
                // Fallback to current month if no records exist
                $currentYear = now()->year;
                $currentMonth = now()->month;
            }
        } else {
            $currentYear = (int) $request->input('year');
            $currentMonth = (int) $request->input('month');
        }
        
        // Get user's school type from monthly rice configuration for current month
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();
        
        $schoolType = $riceConfig ? $riceConfig->school_type : 'primary';
        
        // ✅ SYNC: Update consumed amounts for current month
        if ($riceConfig) {
            $riceConfig->syncConsumedFromDaily();
            $riceConfig->save();
        }
        
        // Get initial summary data
        $summary = $this->getSummaryData($user->id, $currentYear, $currentMonth, $schoolType);

        // Build monthly report/bill status for recent years (current year and 5 years back)
        $monthlyStatus = [];
        $startYear = $currentYear;
        $endYear = $currentYear - 5;

        for ($year = $startYear; $year >= $endYear; $year--) {
            for ($month = 1; $month <= 12; $month++) {
                // Rice report exists?
                $hasRiceReport = RiceReport::forUser($user->id)
                    ->forPeriod($month, $year)
                    ->exists();

                // Amount report and associated bills
                $amountReport = AmountReport::where('user_id', $user->id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->first();

                $hasAmountReport = (bool) $amountReport;
                $hasKiryanaBill = $amountReport ? $amountReport->kiryanaBills()->exists() : false;
                $hasFuelBill = $amountReport ? $amountReport->fuelBills()->exists() : false;

                $monthlyStatus[$year][$month] = [
                    'has_rice_report' => $hasRiceReport,
                    'has_amount_report' => $hasAmountReport,
                    'has_kiryana_bill' => $hasKiryanaBill,
                    'has_fuel_bill' => $hasFuelBill,
                ];
            }
        }
        
        return Inertia::render('Dashboard/Dashboard', [
            'user' => $user,
            'initialSummary' => $summary,
            'currentYear' => $currentYear,
            'currentMonth' => $currentMonth,
            'schoolType' => $schoolType,
            'monthlyReportStatus' => $monthlyStatus,
        ]);
    }
    
    // Removed - Now using MonthlyRiceConfiguration::syncConsumedFromDaily()
    
    /**
     * Get summary data for dashboard
     * ✅ FIXED: Calculates historical rice available for selected month
     */
    private function getSummaryData($userId, $year, $month, $schoolType)
    {
        try {
            // Get monthly rice configuration for selected period
            $riceConfig = MonthlyRiceConfiguration::where('user_id', $userId)
                ->where('month', $month)
                ->where('year', $year)
                ->first();
            
            if (!$riceConfig) {
                return $this->getEmptySummary();
            }
            
            // Get rice available from monthly config
            $schoolType = $riceConfig->school_type;
            
            if ($schoolType === 'primary') {
                $riceAvailable = $riceConfig->closing_balance_primary;
            } elseif ($schoolType === 'middle') {
                $riceAvailable = $riceConfig->closing_balance_primary + $riceConfig->closing_balance_upper_primary;
            } else {
                $riceAvailable = $riceConfig->closing_balance_primary;
            }
            
            // Get amount configuration
            $amountConfig = AmountConfiguration::where('user_id', $userId)
                ->first();
            
            // Get daily consumptions for the month
            $dailyConsumptions = DailyConsumption::where('user_id', $userId)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->get();
            
            // Get total consumed from monthly config
            $totalConsumed = $riceConfig->consumed_primary + $riceConfig->consumed_upper_primary;
            
            // Calculate total amount spent
            $totalAmountSpent = 0;
            if ($amountConfig && $dailyConsumptions->isNotEmpty()) {
                foreach ($dailyConsumptions as $consumption) {
                    $primaryAmount = ($consumption->served_primary ?? 0) * $amountConfig->total_daily_primary;
                    $middleAmount = ($consumption->served_middle ?? 0) * $amountConfig->total_daily_middle;
                    
                    $totalAmountSpent += ($primaryAmount + $middleAmount);
                }
            }
            
            // Get total students served
            $totalStudentsServed = $dailyConsumptions->sum(function($consumption) {
                return ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0);
            });
            
            // Get days of service
            $daysOfService = $dailyConsumptions->count();
            
            return [
                'rice_available' => round($riceAvailable, 2),
                'rice_consumed' => round($totalConsumed, 2),
                'amount_spent' => round($totalAmountSpent, 2),
                'students_served' => $totalStudentsServed,
                'days_served' => $daysOfService
            ];
        } catch (\Exception $e) {
            Log::error('Dashboard summary error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $userId,
                'year' => $year,
                'month' => $month
            ]);
            return $this->getEmptySummary();
        }
    }
    
    /**
     * Return empty summary data
     */
    private function getEmptySummary()
    {
        return [
            'rice_available' => 0,
            'rice_consumed' => 0,
            'amount_spent' => 0,
            'students_served' => 0,
            'days_served' => 0
        ];
    }
    
    /**
     * Calculate initial balance based on school type from monthly config
     * Used for historical calculations
     */
    private function calculateInitialBalance($riceConfig, $schoolType)
    {
        if (!$riceConfig) {
            return 0;
        }

        // Use opening balance + lifted + arranged for total available
        if ($schoolType === 'primary') {
            return $riceConfig->opening_balance_primary + 
                   $riceConfig->rice_lifted_primary + 
                   ($riceConfig->rice_arranged_primary ?? 0);
        } elseif ($schoolType === 'middle') {
            return ($riceConfig->opening_balance_primary + 
                    $riceConfig->rice_lifted_primary + 
                    ($riceConfig->rice_arranged_primary ?? 0)) +
                   ($riceConfig->opening_balance_upper_primary + 
                    $riceConfig->rice_lifted_upper_primary + 
                    ($riceConfig->rice_arranged_upper_primary ?? 0));
        }

        return $riceConfig->opening_balance_primary + 
               $riceConfig->rice_lifted_primary + 
               ($riceConfig->rice_arranged_primary ?? 0);
    }
    
    /**
     * Get rice balance history for chart
     * ✅ FIXED: Returns daily balance using CONFIGURED RATES
     */
    public function getRiceBalanceHistory(Request $request)
    {
        try {
            $user = $request->user();
            $year = (int) $request->input('year', now()->year);
            $month = (int) $request->input('month', now()->month);
            
            // Get monthly rice configuration for the period
            $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();
            
            if (!$riceConfig) {
                return response()->json([]);
            }
            
            $schoolType = $riceConfig->school_type;
            
            // GET CONFIGURED RATES
            $primaryRate = $riceConfig->daily_consumption_primary / 1000;
            $middleRate = $riceConfig->daily_consumption_upper_primary / 1000;
            
            // Get initial balance from monthly config
            $initialBalance = $this->calculateInitialBalance($riceConfig, $schoolType);
            
            // Get daily consumptions for the month ordered by date
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();
            
            $data = [];
            $runningBalance = $initialBalance;
            
            foreach ($consumptions as $consumption) {
                $opening = $runningBalance;
                
                // ✅ Calculate consumed using CONFIGURED RATES
                $primaryConsumed = ($consumption->served_primary ?? 0) * $primaryRate;
                $middleConsumed = ($consumption->served_middle ?? 0) * $middleRate;
                $consumed = $primaryConsumed + $middleConsumed;
                
                $closing = max(0, $opening - $consumed);
                
                $data[] = [
                    'date' => $consumption->date->format('Y-m-d'),
                    'day' => $consumption->date->format('l'),
                    'opening' => round($opening, 2),
                    'consumed' => round($consumed, 2),
                    'closing' => round($closing, 2),
                    'served_primary' => $consumption->served_primary ?? 0,
                    'served_middle' => $consumption->served_middle ?? 0,
                ];
                
                $runningBalance = $closing;
            }
            
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard getRiceBalanceHistory error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch rice balance history'], 500);
        }
    }
    
    /**
     * Get amount spending history for chart
     * Returns daily spending breakdown
     */
    public function getAmountHistory(Request $request)
    {
        try {
            $user = $request->user();
            $year = (int) $request->input('year', now()->year);
            $month = (int) $request->input('month', now()->month);
            
            // Get amount configuration
            $amountConfig = AmountConfiguration::where('user_id', $user->id)
                ->first();
            
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
                
                // Calculate amounts
                $primaryAmount = $servedPrimary * $amountConfig->total_daily_primary;
                $middleAmount = $servedMiddle * $amountConfig->total_daily_middle;
                $totalAmount = $primaryAmount + $middleAmount;
                
                // Component breakdown
                $pulses = ($servedPrimary * $amountConfig->daily_pulses_primary) +
                         ($servedMiddle * $amountConfig->daily_pulses_middle);
                
                $vegetables = ($servedPrimary * $amountConfig->daily_vegetables_primary) +
                             ($servedMiddle * $amountConfig->daily_vegetables_middle);
                
                $oil = ($servedPrimary * $amountConfig->daily_oil_primary) +
                      ($servedMiddle * $amountConfig->daily_oil_middle);
                
                $salt = ($servedPrimary * $amountConfig->daily_salt_primary) +
                       ($servedMiddle * $amountConfig->daily_salt_middle);
                
                $fuel = ($servedPrimary * $amountConfig->daily_fuel_primary) +
                       ($servedMiddle * $amountConfig->daily_fuel_middle);
                
                $data[] = [
                    'date' => $consumption->date->format('Y-m-d'),
                    'day' => $consumption->date->format('l'),
                    'total_amount' => round($totalAmount, 2),
                    'primary_amount' => round($primaryAmount, 2),
                    'middle_amount' => round($middleAmount, 2),
                    'pulses' => round($pulses, 2),
                    'vegetables' => round($vegetables, 2),
                    'oil' => round($oil, 2),
                    'salt' => round($salt, 2),
                    'fuel' => round($fuel, 2),
                ];
            }
            
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard getAmountHistory error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch amount history'], 500);
        }
    }
    
    /**
     * Get recent consumption records
     * For activity feed or recent records table
     */
    public function getRecentConsumptions(Request $request)
    {
        try {
            $user = $request->user();
            $limit = (int) $request->input('limit', 5);
            
            // Get current month's rice configuration for rates
            $now = now();
            $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
                ->where('month', $now->month)
                ->where('year', $now->year)
                ->first();
            
            if (!$riceConfig) {
                return response()->json([]);
            }
            
            $primaryRate = $riceConfig->daily_consumption_primary / 1000;
            $middleRate = $riceConfig->daily_consumption_upper_primary / 1000;
            
            $consumptions = DailyConsumption::where('user_id', $user->id)
                ->orderBy('date', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($consumption) use ($primaryRate, $middleRate) {
                    $totalRice = (($consumption->served_primary ?? 0) * $primaryRate) +
                                (($consumption->served_middle ?? 0) * $middleRate);
                    
                    return [
                        'id' => $consumption->id,
                        'date' => $consumption->date->format('Y-m-d'),
                        'day' => $consumption->date->format('l'),
                        'served_primary' => $consumption->served_primary ?? 0,
                        'served_middle' => $consumption->served_middle ?? 0,
                        'total_rice' => round($totalRice, 2),
                        'total_students' => ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0),
                        'created_at' => $consumption->created_at->diffForHumans(),
                    ];
                });
            
            return response()->json($consumptions);
        } catch (\Exception $e) {
            Log::error('Dashboard getRecentConsumptions error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch recent consumptions'], 500);
        }
    }
}