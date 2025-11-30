<?php

namespace App\Services;

use App\Models\AmountReport;
use App\Models\DailyConsumption;
use App\Models\User;
use App\Models\MonthlyAmountConfiguration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\ConsumptionCalculationService;

/**
 * AmountReportService
 * 
 * Handles business logic for amount report generation, validation, and management.
 * ✅ UPDATED: Uses UNIFIED salt percentages from MonthlyAmountConfiguration
 */
class AmountReportService
{
    /**
     * Generate a new amount report for a specific period.
     * ✅ UPDATED: Accepts unified salt percentages that apply to both Primary and Middle
     * 
     * @param User $user
     * @param int $month
     * @param int $year
     * @param array|null $saltPercentages ['primary' => [...], 'middle' => [...]] (both use same percentages)
     * @return AmountReport
     * @throws \Exception
     */
    public function generateReport(
        User $user, 
        int $month, 
        int $year,
        ?array $saltPercentages = null
    ): AmountReport {
        try {
            DB::beginTransaction();

            // Get amount configuration for this specific month
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();
            
            if (!$amountConfig) {
                throw new \Exception('Amount configuration not found for this month. Please create configuration first.');
            }

            // ✅ Use unified salt percentages from configuration if not provided
            if (!$saltPercentages) {
                $unifiedPercentages = [
                    'common' => $amountConfig->salt_percentage_common ?? 5,
                    'chilli' => $amountConfig->salt_percentage_chilli ?? 35,
                    'turmeric' => $amountConfig->salt_percentage_turmeric ?? 20,
                    'coriander' => $amountConfig->salt_percentage_coriander ?? 15,
                    'other' => $amountConfig->salt_percentage_other ?? 25,
                ];

                // Apply same percentages to both sections
                $saltPercentages = [
                    'primary' => $user->hasPrimaryStudents() ? $unifiedPercentages : null,
                    'middle' => $user->hasMiddleStudents() ? $unifiedPercentages : null,
                ];
            }

            // Get daily consumption records for the period
            $records = DailyConsumption::where('user_id', $user->id)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date')
                ->get();

            if ($records->isEmpty()) {
                throw new \Exception('No consumption records found for this period.');
            }

            // Calculate totals using configuration + served students so amounts are not zero
            /** @var ConsumptionCalculationService $calculationService */
            $calculationService = app(ConsumptionCalculationService::class);

            $monthlyTotals = $calculationService->calculateMonthlyAmountTotals(
                $records,
                $amountConfig,
                $user
            );

            // Map monthly totals into the structure expected by the report
            $primaryTotals = [
                'total_students' => $monthlyTotals['total_primary_students'],
                'pulses' => $monthlyTotals['total_primary_pulses'],
                'vegetables' => $monthlyTotals['total_primary_vegetables'],
                'oil' => $monthlyTotals['total_primary_oil'],
                'salt' => $monthlyTotals['total_primary_salt'],
                'fuel' => $monthlyTotals['total_primary_fuel'],
                'total_amount' => $monthlyTotals['total_primary_amount'],
                'salt_breakdown' => [
                    'common_salt' => $monthlyTotals['total_primary_common_salt'],
                    'chilli_powder' => $monthlyTotals['total_primary_chilli_powder'],
                    'turmeric' => $monthlyTotals['total_primary_turmeric'],
                    'coriander' => $monthlyTotals['total_primary_coriander'],
                    'other_condiments' => $monthlyTotals['total_primary_other_condiments'],
                ],
            ];

            $middleTotals = [
                'total_students' => $monthlyTotals['total_middle_students'],
                'pulses' => $monthlyTotals['total_middle_pulses'],
                'vegetables' => $monthlyTotals['total_middle_vegetables'],
                'oil' => $monthlyTotals['total_middle_oil'],
                'salt' => $monthlyTotals['total_middle_salt'],
                'fuel' => $monthlyTotals['total_middle_fuel'],
                'total_amount' => $monthlyTotals['total_middle_amount'],
                'salt_breakdown' => [
                    'common_salt' => $monthlyTotals['total_middle_common_salt'],
                    'chilli_powder' => $monthlyTotals['total_middle_chilli_powder'],
                    'turmeric' => $monthlyTotals['total_middle_turmeric'],
                    'coriander' => $monthlyTotals['total_middle_coriander'],
                    'other_condiments' => $monthlyTotals['total_middle_other_condiments'],
                ],
            ];

            // Grand totals and averages from monthly totals
            $totalServingDays = $monthlyTotals['total_serving_days'];
            $grandTotalAmount = $monthlyTotals['grand_total'];
            $averageDailyAmount = $monthlyTotals['average_daily_amount'];

            // Get opening/closing balances (from first/last records or config)
            $openingBalancePrimary = $records->first()->opening_balance_primary ?? 0;
            $openingBalanceMiddle = $records->first()->opening_balance_middle ?? 0;
            $closingBalancePrimary = $records->last()->closing_balance_primary ?? 0;
            $closingBalanceMiddle = $records->last()->closing_balance_middle ?? 0;

            // Prepare daily records array
            $dailyRecords = $records->map(function ($record) use ($saltPercentages, $amountConfig, $calculationService) {
                // Calculate amounts dynamically using the service
                $amounts = $calculationService->calculateAmountConsumption(
                    $record->served_primary ?? 0,
                    $record->served_middle ?? 0,
                    $amountConfig
                );

                return [
                    'date' => $record->date->format('Y-m-d'),
                    'day' => $record->date->format('l'),
                    'served_primary' => $record->served_primary,
                    'served_middle' => $record->served_middle,
                    'primary' => [
                        'pulses' => (float) $amounts['primary']['pulses'],
                        'vegetables' => (float) $amounts['primary']['vegetables'],
                        'oil' => (float) $amounts['primary']['oil'],
                        'salt' => (float) $amounts['primary']['salt'],
                        'fuel' => (float) $amounts['primary']['fuel'],
                        'total' => (float) $amounts['primary']['total'],
                    ],
                    'middle' => [
                        'pulses' => (float) $amounts['middle']['pulses'],
                        'vegetables' => (float) $amounts['middle']['vegetables'],
                        'oil' => (float) $amounts['middle']['oil'],
                        'salt' => (float) $amounts['middle']['salt'],
                        'fuel' => (float) $amounts['middle']['fuel'],
                        'total' => (float) $amounts['middle']['total'],
                    ],
                    'grand_total' => (float) ($amounts['primary']['total'] + $amounts['middle']['total']),
                ];
            })->toArray();

            // ✅ Store unified salt percentages (extract from either primary or middle, they're the same)
            $storedSaltPercentages = $saltPercentages['primary'] ?? $saltPercentages['middle'] ?? [
                'common' => 30,
                'chilli' => 20,
                'turmeric' => 20,
                'coriander' => 15,
                'other' => 15,
            ];

            // Create the report
            $report = AmountReport::create([
                'user_id' => $user->id,
                'year' => $year,
                'month' => $month,
                'school_type' => $user->school_type,
                
                // Balances
                'opening_balance_primary' => $openingBalancePrimary,
                'opening_balance_middle' => $openingBalanceMiddle,
                'closing_balance_primary' => $closingBalancePrimary,
                'closing_balance_middle' => $closingBalanceMiddle,
                
                // Primary section totals
                'total_primary_students' => $primaryTotals['total_students'],
                'total_primary_pulses' => $primaryTotals['pulses'],
                'total_primary_vegetables' => $primaryTotals['vegetables'],
                'total_primary_oil' => $primaryTotals['oil'],
                'total_primary_salt' => $primaryTotals['salt'],
                'total_primary_common_salt' => $primaryTotals['salt_breakdown']['common_salt'],
                'total_primary_chilli_powder' => $primaryTotals['salt_breakdown']['chilli_powder'],
                'total_primary_turmeric' => $primaryTotals['salt_breakdown']['turmeric'],
                'total_primary_coriander' => $primaryTotals['salt_breakdown']['coriander'],
                'total_primary_other_condiments' => $primaryTotals['salt_breakdown']['other_condiments'],
                'total_primary_fuel' => $primaryTotals['fuel'],
                'total_primary_amount' => $primaryTotals['total_amount'],
                
                // Middle section totals
                'total_middle_students' => $middleTotals['total_students'],
                'total_middle_pulses' => $middleTotals['pulses'],
                'total_middle_vegetables' => $middleTotals['vegetables'],
                'total_middle_oil' => $middleTotals['oil'],
                'total_middle_salt' => $middleTotals['salt'],
                'total_middle_common_salt' => $middleTotals['salt_breakdown']['common_salt'],
                'total_middle_chilli_powder' => $middleTotals['salt_breakdown']['chilli_powder'],
                'total_middle_turmeric' => $middleTotals['salt_breakdown']['turmeric'],
                'total_middle_coriander' => $middleTotals['salt_breakdown']['coriander'],
                'total_middle_other_condiments' => $middleTotals['salt_breakdown']['other_condiments'],
                'total_middle_fuel' => $middleTotals['fuel'],
                'total_middle_amount' => $middleTotals['total_amount'],
                
                // Grand totals
                'total_serving_days' => $totalServingDays,
                'grand_total_amount' => $grandTotalAmount,
                'average_daily_amount' => $averageDailyAmount,
                
                // Daily records and unified salt percentages
                'daily_records' => $dailyRecords,
                'salt_percentages_used' => $storedSaltPercentages, // ✅ Store unified percentages
            ]);

            DB::commit();

            Log::info('Amount report generated successfully with unified salt breakdown', [
                'report_id' => $report->id,
                'user_id' => $user->id,
                'period' => "{$year}-{$month}",
                'grand_total' => $grandTotalAmount,
                'salt_percentages' => $storedSaltPercentages,
            ]);

            return $report;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to generate amount report', [
                'user_id' => $user->id,
                'period' => "{$year}-{$month}",
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Calculate totals for a section (primary or middle).
     * ✅ UPDATED: Uses unified salt percentages for breakdown
     * 
     * @param \Illuminate\Database\Eloquent\Collection $records
     * @param string $section 'primary' or 'middle'
     * @param array|null $saltPercentages Unified percentages for salt breakdown
     * @return array
     */
    protected function calculateSectionTotals($records, string $section, ?array $saltPercentages): array
    {
        $totals = [
            'total_students' => 0,
            'pulses' => 0,
            'vegetables' => 0,
            'oil' => 0,
            'salt' => 0,
            'fuel' => 0,
            'total_amount' => 0,
            'salt_breakdown' => [
                'common_salt' => 0,
                'chilli_powder' => 0,
                'turmeric' => 0,
                'coriander' => 0,
                'other_condiments' => 0,
            ],
        ];

        // If no salt percentages provided, use defaults
        if (!$saltPercentages) {
            $saltPercentages = [
                'common' => 30,
                'chilli' => 20,
                'turmeric' => 20,
                'coriander' => 15,
                'other' => 15,
            ];
        }

        foreach ($records as $record) {
            $totals['total_students'] += $record->{"served_{$section}"} ?? 0;
            $totals['pulses'] += $record->{"amount_pulses_{$section}"} ?? 0;
            $totals['vegetables'] += $record->{"amount_vegetables_{$section}"} ?? 0;
            $totals['oil'] += $record->{"amount_oil_{$section}"} ?? 0;
            $totals['salt'] += $record->{"amount_salt_{$section}"} ?? 0;
            $totals['fuel'] += $record->{"amount_fuel_{$section}"} ?? 0;
            $totals['total_amount'] += $record->{"total_amount_{$section}"} ?? 0;
        }

        // ✅ Calculate salt breakdown using UNIFIED percentages
        $totalSalt = $totals['salt'];
        $totals['salt_breakdown'] = [
            'common_salt' => ($totalSalt * $saltPercentages['common']) / 100,
            'chilli_powder' => ($totalSalt * $saltPercentages['chilli']) / 100,
            'turmeric' => ($totalSalt * $saltPercentages['turmeric']) / 100,
            'coriander' => ($totalSalt * $saltPercentages['coriander']) / 100,
            'other_condiments' => ($totalSalt * $saltPercentages['other']) / 100,
        ];

        return $totals;
    }

    /**
     * Validate if a report can be generated for a period.
     * 
     * @param User $user
     * @param int $month
     * @param int $year
     * @return array ['can_generate' => bool, 'errors' => array]
     */
    public function validateReportGeneration(User $user, int $month, int $year): array
    {
        $errors = [];

        // Check if amount configuration exists for this month
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();
            
        if (!$amountConfig) {
            $errors[] = 'Amount configuration not found for this month. Please create configuration first.';
        }

        // Check if report already exists
        if ($this->reportExists($user->id, $month, $year)) {
            $errors[] = 'Report already exists for this period. Delete existing report or choose a different period.';
        }

        // Check if consumption records exist
        $recordCount = DailyConsumption::where('user_id', $user->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->count();

        if ($recordCount === 0) {
            $errors[] = 'No consumption records found for this period. Add consumption records first.';
        }

        // ✅ Validate unified salt percentages sum to 100%
        if ($amountConfig) {
            $saltTotal = 
                ($amountConfig->salt_percentage_common ?? 0) +
                ($amountConfig->salt_percentage_chilli ?? 0) +
                ($amountConfig->salt_percentage_turmeric ?? 0) +
                ($amountConfig->salt_percentage_coriander ?? 0) +
                ($amountConfig->salt_percentage_other ?? 0);

            if (abs($saltTotal - 100) > 0.01) {
                $errors[] = "Salt percentages must sum to 100%. Current total: {$saltTotal}%";
            }
        }

        return [
            'can_generate' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Check if a report exists for a specific period.
     */
    public function reportExists(int $userId, int $month, int $year): bool
    {
        return AmountReport::where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->exists();
    }

    /**
     * Find a report for a specific period.
     */
    public function findReport(int $userId, int $month, int $year): ?AmountReport
    {
        return AmountReport::where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();
    }

    /**
     * Get paginated reports for a user.
     * ✅ OPTIMIZED: Added nested eager loading to prevent N+1 queries
     */
    public function getPaginatedReports(int $userId, int $perPage = 15)
    {
        return AmountReport::where('user_id', $userId)
            ->with(['bills.items'])  // ✅ Load bills AND their items upfront
            ->latestPeriod()
            ->paginate($perPage);
    }

    /**
     * Get available months for report generation.
     */
    public function getAvailableMonthsForReports(int $userId): array
    {
        $months = [];
        $consumptionMonths = DailyConsumption::where('user_id', $userId)
            ->selectRaw('YEAR(date) as year, MONTH(date) as month, COUNT(*) as record_count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        foreach ($consumptionMonths as $record) {
            $hasReport = $this->reportExists($userId, $record->month, $record->year);
            
            $months[] = [
                'year' => $record->year,
                'month' => $record->month,
                'period' => Carbon::createFromDate($record->year, $record->month, 1)->format('F Y'),
                'record_count' => $record->record_count,
                'has_report' => $hasReport,
                'can_generate' => !$hasReport && $record->record_count > 0,
            ];
        }

        return $months;
    }

    /**
     * Get report statistics for a user.
     */
    public function getReportStatistics(int $userId): array
    {
        $reports = AmountReport::where('user_id', $userId)->get();

        return [
            'total_reports' => $reports->count(),
            'total_amount_consumed' => $reports->sum('grand_total_amount'),
            'average_monthly_amount' => $reports->avg('grand_total_amount') ?? 0,
            'total_serving_days' => $reports->sum('total_serving_days'),
        ];
    }

    /**
     * Regenerate an existing report with fresh data.
     */
    public function regenerateReport(int $userId, int $month, int $year): AmountReport
    {
        // Delete existing report
        $existingReport = $this->findReport($userId, $month, $year);
        
        if ($existingReport) {
            $existingReport->delete();
        }

        // Generate new report
        $user = User::findOrFail($userId);
        return $this->generateReport($user, $month, $year);
    }

    /**
     * Delete a report.
     */
    public function deleteReport(int $reportId): bool
    {
        try {
            DB::beginTransaction();

            $report = AmountReport::findOrFail($reportId);
            
            // Delete associated bills first
            $report->bills()->delete();
            
            // Delete report
            $report->delete();

            DB::commit();

            Log::info('Amount report deleted successfully', [
                'report_id' => $reportId,
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to delete amount report', [
                'report_id' => $reportId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}