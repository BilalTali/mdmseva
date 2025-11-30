<?php

namespace App\Services;

use App\Models\RiceReport;
use App\Models\MonthlyRiceConfiguration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Exceptions\NoConsumptionDataException;
use App\Exceptions\RiceConfigurationMissingException;

/**
 * ✅ UPDATED: RiceReportService - Supports Negative Balances
 * 
 * Changes Made:
 * 1. Removed max(0, ...) constraint on closing balance calculation
 * 2. Closing balance in reports can now be negative
 */
class RiceReportService
{
    protected ConsumptionCalculationService $calculationService;

    public function __construct(ConsumptionCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * ✅ UPDATED: Generate report using month-specific configuration
     * Uses MonthlyRiceConfiguration for the specific month (like Amount Report workflow)
     */
    public function generateReport(User $user, int $month, int $year): RiceReport
    {
        $existing = RiceReport::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();
        
        if ($existing) {
            return $existing;
        }
        
        // ✅ Get month-specific rice configuration
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();
            
        if (!$riceConfig) {
            $monthName = date('F', mktime(0, 0, 0, $month, 1));
            throw new RiceConfigurationMissingException(
                "Rice configuration not found for {$monthName} {$year}. Please create configuration first."
            );
        }
        
        $consumptions = $this->calculationService
            ->getConsumptionsForMonth($user, $month, $year);
        
        if ($consumptions->isEmpty()) {
            $monthName = date('F', mktime(0, 0, 0, $month, 1));
            throw new NoConsumptionDataException(
                "No consumption records found for {$monthName} {$year}. Please add daily consumption entries first."
            );
        }
        
        // ✅ Opening balance comes from THIS month's configuration
        // Formula: Opening + Lifted + Arranged
        $openingBalance = round(
            ($riceConfig->opening_balance_primary ?? 0) +
            ($riceConfig->opening_balance_upper_primary ?? 0) +
            ($riceConfig->rice_lifted_primary ?? 0) +
            ($riceConfig->rice_lifted_upper_primary ?? 0) +
            ($riceConfig->rice_arranged_primary ?? 0) +
            ($riceConfig->rice_arranged_upper_primary ?? 0),
            2
        );
        
        $totals = $this->calculationService
            ->calculateMonthlyTotals($consumptions, $user);
        
        // ✅ Closing balance calculated from opening and consumed
        $closingBalance = $openingBalance - $totals['total_rice_consumed'];
        
        $dailyRecords = $this->calculationService
            ->formatDailyRecordsForReport($consumptions, $openingBalance, $user);
        
        return RiceReport::create([
            'user_id' => $user->id,
            'month' => $month,
            'year' => $year,
            'school_type' => $user->school_type,
            'opening_balance' => round($openingBalance, 2),
            'closing_balance' => round($closingBalance, 2),
            'total_primary_students' => $totals['total_primary_students'],
            'total_primary_rice' => $totals['total_primary_rice'],
            'total_middle_students' => $totals['total_middle_students'],
            'total_middle_rice' => $totals['total_middle_rice'],
            'total_rice_consumed' => $totals['total_rice_consumed'],
            'total_serving_days' => $totals['total_serving_days'],
            'average_daily_consumption' => $totals['average_daily'],
            'daily_records' => $dailyRecords,
        ]);
    }

    public function reportExists(User $user, int $month, int $year): bool
    {
        return RiceReport::forUser($user->id)
            ->forPeriod($month, $year)
            ->exists();
    }

    public function findReport(User $user, int $month, int $year): ?RiceReport
    {
        return RiceReport::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();
    }

    public function getAllReports(User $user, int $perPage = 12): LengthAwarePaginator
    {
        // ✅ OPTIMIZED: Added eager loading to prevent N+1 queries
        return RiceReport::with('user')  // Load user relationship upfront
            ->forUser($user->id)
            ->latest()
            ->paginate($perPage);
    }

    public function deleteReport(RiceReport $report): bool
    {
        return $report->delete();
    }

    public function regenerateReport(User $user, int $month, int $year): RiceReport
    {
        $existing = $this->findReport($user, $month, $year);
        if ($existing) {
            $this->deleteReport($existing);
        }
        
        return $this->generateReport($user, $month, $year);
    }

    public function getAvailableMonthsForReports(User $user): array
    {
        $consumptionMonths = DB::table('daily_consumptions')
            ->where('user_id', $user->id)
            ->select(
                DB::raw('MONTH(date) as month'),
                DB::raw('YEAR(date) as year')
            )
            ->distinct()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        $reportMonths = RiceReport::where('user_id', $user->id)
            ->select('month', 'year')
            ->get()
            ->map(fn($r) => "{$r->year}-{$r->month}")
            ->toArray();

        return $consumptionMonths
            ->filter(function($item) use ($reportMonths) {
                return !in_array("{$item->year}-{$item->month}", $reportMonths);
            })
            ->map(function($item) {
                return [
                    'month' => (int) $item->month,
                    'year' => (int) $item->year,
                    'label' => date('F Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                ];
            })
            ->values()
            ->toArray();
    }

    public function getReportsForYear(User $user, int $year)
    {
        return RiceReport::forUser($user->id)
            ->where('year', $year)
            ->orderBy('month', 'desc')
            ->get();
    }

    public function getOverallStatistics(User $user): array
    {
        $reports = RiceReport::forUser($user->id)->get();

        if ($reports->isEmpty()) {
            return [
                'total_reports' => 0,
                'total_rice_consumed' => 0,
                'total_serving_days' => 0,
                'average_daily_consumption' => 0,
                'earliest_report' => null,
                'latest_report' => null,
            ];
        }

        return [
            'total_reports' => $reports->count(),
            'total_rice_consumed' => round($reports->sum('total_rice_consumed'), 2),
            'total_serving_days' => $reports->sum('total_serving_days'),
            'average_daily_consumption' => round(
                $reports->sum('total_rice_consumed') / max($reports->sum('total_serving_days'), 1),
                2
            ),
            'earliest_report' => $reports->sortBy('year')->sortBy('month')->first()->period ?? null,
            'latest_report' => $reports->sortByDesc('year')->sortByDesc('month')->first()->period ?? null,
        ];
    }

    protected function hasRiceConfiguration(User $user): bool
    {
        return MonthlyRiceConfiguration::where('user_id', $user->id)->exists();
    }

    public function getLatestReport(User $user): ?RiceReport
    {
        return RiceReport::forUser($user->id)
            ->latest()
            ->first();
    }

    public function canGenerateReport(User $user, int $month, int $year): bool
    {
        if (!$this->hasRiceConfiguration($user)) {
            return false;
        }

        $consumptions = $this->calculationService
            ->getConsumptionsForMonth($user, $month, $year);

        return $consumptions->isNotEmpty();
    }

    public function getMonthsWithConsumptionData(User $user): array
    {
        return DB::table('daily_consumptions')
            ->where('user_id', $user->id)
            ->select(
                DB::raw('MONTH(date) as month'),
                DB::raw('YEAR(date) as year'),
                DB::raw('COUNT(*) as record_count')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'month' => (int) $item->month,
                    'year' => (int) $item->year,
                    'label' => date('F Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
                    'record_count' => $item->record_count,
                ];
            })
            ->toArray();
    }

    public function validateReportGeneration(User $user, int $month, int $year): array
    {
        if (!$this->hasRiceConfiguration($user)) {
            return [
                'valid' => false,
                'message' => 'Rice configuration is required. Please set up your rice stock first.',
            ];
        }

        $consumptions = $this->calculationService
            ->getConsumptionsForMonth($user, $month, $year);

        if ($consumptions->isEmpty()) {
            $monthName = date('F', mktime(0, 0, 0, $month, 1));
            return [
                'valid' => false,
                'message' => "No consumption records found for {$monthName} {$year}.",
            ];
        }

        if ($this->reportExists($user, $month, $year)) {
            $monthName = date('F', mktime(0, 0, 0, $month, 1));
            return [
                'valid' => false,
                'message' => "A report already exists for {$monthName} {$year}.",
            ];
        }

        return [
            'valid' => true,
            'message' => 'Report can be generated.',
        ];
    }
}
