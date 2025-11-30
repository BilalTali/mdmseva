<?php

namespace App\Services;

use App\Models\User;
use App\Models\DailyConsumption;
use App\Models\RiceReport;
use App\Models\AmountReport;
use App\Models\MonthlyRiceConfiguration;
use App\Models\Bill;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * School Data Context Service
 * 
 * Provides school-specific data context for AI chatbot
 * All data is filtered by user_id / UDISE code for security
 */
class SchoolDataContextService
{
    /**
     * Get formatted context for AI about user's school data
     * 
     * @param int $userId
     * @return string Formatted context string for AI
     */
    public function formatContextForAI(int $userId): string
    {
        // Cache for 5 minutes to improve performance
        return Cache::remember("school_ai_context_{$userId}", 300, function () use ($userId) {
            return $this->buildContext($userId);
        });
    }

    /**
     * Build the complete context
     */
    protected function buildContext(int $userId): string
    {
        $user = User::findOrFail($userId);
        
        $context = [];
        
        // School Information Section
        $context[] = "# User's School Information";
        $context[] = "School Name: {$user->school_name}";
        $context[] = "UDISE Code: {$user->udise_code}";
        $context[] = "School Type: " . $user->getSchoolTypeLabel();
        $context[] = "District: {$user->district}";
        $context[] = "Zone: {$user->zone}";
        $context[] = "State: {$user->state}";
        $context[] = "Current Date: " . now()->format('F d, Y (l)');
        $context[] = "Current Month: " . now()->format('F Y');
        $context[] = "";
        
        // Enrollment Data
        $enrollmentData = $user->getEnrollmentData();
        $context[] = "# Student Enrollment (Latest Roll Statement)";
        if ($enrollmentData['total'] > 0) {
            $context[] = "Total Students: {$enrollmentData['total']}";
            if ($user->hasPrimaryStudents()) {
                $context[] = "- Primary (I-V): {$enrollmentData['primary']} students";
            }
            if ($user->hasMiddleStudents()) {
                $context[] = "- Middle (VI-VIII): {$enrollmentData['middle']} students";
            }
        } else {
            $context[] = "No roll statement data available yet. Please ask the user to create a roll statement.";
        }
        $context[] = "";
        
        // Rice Balance & Configuration
        $context[] = "# Rice Inventory Status";
        $riceConfig = MonthlyRiceConfiguration::forUser($userId)
            ->latestFirst()
            ->first();
        
        if ($riceConfig) {
            $context[] = "Period: {$riceConfig->period}";
            $context[] = "Current Rice Balance: {$riceConfig->total_closing_balance} kg";
            $context[] = "- Primary Section: {$riceConfig->closing_balance_primary} kg";
            $context[] = "- Middle Section: {$riceConfig->closing_balance_upper_primary} kg";
            $context[] = "Total Rice Lifted: {$riceConfig->total_rice_lifted} kg";
            $context[] = "Total Rice Consumed: {$riceConfig->total_consumed} kg";
            $context[] = "Rice Consumption Rates:";
            $context[] = "- Primary: {$riceConfig->daily_consumption_primary} grams per student per day";
            $context[] = "- Middle: {$riceConfig->daily_consumption_upper_primary} grams per student per day";
        } else {
            $context[] = "No rice configuration found. Please ask the user to set up their monthly rice configuration first.";
        }
        $context[] = "";
        
        // Recent Consumption Summary (Last 3 months)
        $context[] = "# Recent Daily Consumption Summary";
        $recentMonths = $this->getRecentConsumptionSummary($userId, 3);
        
        if (!empty($recentMonths)) {
            foreach ($recentMonths as $monthData) {
                $context[] = "• {$monthData['month']}:";
               $context[] = "  - Total Students Served: {$monthData['students']} students";
                $context[] = "  - School Days: {$monthData['days']} days";
                $context[] = "  - Rice Consumed: {$monthData['rice']} kg";
                if ($monthData['avg_students'] > 0) {
                    $context[] = "  - Average Students/Day: {$monthData['avg_students']}";
                }
            }
        } else {
            $context[] = "No daily consumption records found yet. Please ask the user to start recording daily consumption.";
        }
        $context[] = "";
        
        // Reports & Bills Status
        $context[] = "# Reports and Bills Status";
        $reportsInfo = $this->getReportsStatus($userId);
        $context[] = $reportsInfo;
        $context[] = "";
        
        // Quick Stats
        $context[] = "# Quick Statistics";
        $totalConsumptions = DailyConsumption::forUser($userId)->count();
        $context[] = "Total Consumption Records: {$totalConsumptions}";
        
        $totalRiceReports = RiceReport::where('user_id', $userId)->count();
        $context[] = "Total Rice Reports Generated: {$totalRiceReports}";
        
        $totalAmountReports = AmountReport::where('user_id', $userId)->count();
        $context[] = "Total Amount Reports Generated: {$totalAmountReports}";
        
        return implode("\n", $context);
    }
    
    /**
     * Get recent consumption summary by month
     * 
     * @param int $userId
     * @param int $months Number of recent months to include
     * @return array
     */
    protected function getRecentConsumptionSummary(int $userId, int $months = 3): array
    {
        $result = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('m');
            $year = $date->format('Y');
            
            $consumptions = DailyConsumption::where('user_id', $userId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();
            
            if ($consumptions->isNotEmpty()) {
                $totalStudents = $consumptions->sum(function($c) {
                    return ($c->served_primary ?? 0) + ($c->served_middle ?? 0);
                });
                
                $result[] = [
                    'month' => $date->format('F Y'),
                    'students' => $totalStudents,
                    'days' => $consumptions->count(),
                    'rice' => round($consumptions->sum('rice_consumed'), 2),
                    'avg_students' => round($totalStudents / max($consumptions->count(), 1), 0),
                ];
            }
        }
        
        return $result;
    }
    
    /**
     * Get reports and bills status for current month
     * 
     * @param int $userId
     * @return string
     */
    protected function getReportsStatus(int $userId): string
    {
        $currentMonth = now()->format('m');
        $currentYear = now()->format('Y');
        $currentMonthName = now()->format('F Y');
        
        $riceReport = RiceReport::where('user_id', $userId)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();
        
        $amountReport = AmountReport::where('user_id', $userId)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();
        
        $info = [];
        $info[] = "Current Month ({$currentMonthName}):";
        
        // Rice Report Status
        if ($riceReport) {
            $generatedDate = Carbon::parse($riceReport->created_at)->format('M d, Y');
            $info[] = "- Rice Report: ✓ Generated on {$generatedDate}";
        } else {
            $info[] = "- Rice Report: ✗ Not generated yet";
        }
        
        // Amount Report Status
        if ($amountReport) {
            $generatedDate = Carbon::parse($amountReport->created_at)->format('M d, Y');
            $info[] = "- Amount Report: ✓ Generated on {$generatedDate}";
            
            // Check bills
            $kiryanaCount = Bill::where('amount_report_id', $amountReport->id)
                ->where('bill_type', 'kiryana')
                ->count();
            $fuelCount = Bill::where('amount_report_id', $amountReport->id)
                ->where('bill_type', 'fuel')
                ->count();
            
            if ($kiryanaCount > 0) {
                $info[] = "  • Kiryana Bills: {$kiryanaCount} created";
            } else {
                $info[] = "  • Kiryana Bills: ✗ Pending (User needs to create)";
            }
            
            if ($fuelCount > 0) {
                $info[] = "  • Fuel Bills: {$fuelCount} created";
            } else {
                $info[] = "  • Fuel Bills: ✗ Pending (User needs to create)";
            }
        } else {
            $info[] = "- Amount Report: ✗ Not generated yet";
            $info[] = "  • Kiryana Bills: Pending (Amount report required first)";
            $info[] = "  • Fuel Bills: Pending (Amount report required first)";
        }
        
        // Check if consumption data exists for current month
        $hasConsumption = DailyConsumption::where('user_id', $userId)
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->exists();
        
        if (!$hasConsumption && !$riceReport && !$amountReport) {
            $info[] = "";
            $info[] = "Note: No daily consumption data recorded for this month yet.";
            $info[] = "User should add daily consumption entries before generating reports.";
        }
        
        return implode("\n", $info);
    }
    
    /**
     * Get consumption data for specific month
     * 
     * @param int $userId
     * @param string $month Month name or number
     * @param int|null $year
     * @return array|null
     */
    public function getMonthConsumption(int $userId, string $month, ?int $year = null): ?array
    {
        $year = $year ?? now()->year;
        $monthNum = is_numeric($month) ? (int)$month : Carbon::parse($month)->month;
        
        $consumptions = DailyConsumption::where('user_id', $userId)
            ->whereMonth('date', $monthNum)
            ->whereYear('date', $year)
            ->get();
        
        if ($consumptions->isEmpty()) {
            return null;
        }
        
        $totalStudents = $consumptions->sum(function($c) {
            return ($c->served_primary ?? 0) + ($c->served_middle ?? 0);
        });
        
        return [
            'month' => Carbon::create($year, $monthNum)->format('F Y'),
            'total_students' => $totalStudents,
            'total_days' => $consumptions->count(),
            'total_rice' => round($consumptions->sum('rice_consumed'), 2),
            'avg_students_per_day' => round($totalStudents / max($consumptions->count(), 1), 0),
            'avg_rice_per_day' => round($consumptions->avg('rice_consumed'), 2),
        ];
    }
    
    /**
     * Clear the cached context for a user
     * 
     * @param int $userId
     */
    public function clearCache(int $userId): void
    {
        Cache::forget("school_ai_context_{$userId}");
    }
}
