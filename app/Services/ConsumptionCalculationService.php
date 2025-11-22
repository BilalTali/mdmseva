<?php

namespace App\Services;

use App\Models\AmountConfiguration;
use App\Models\DailyConsumption;
use App\Models\MonthlyRiceConfiguration;
use App\Models\User;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * ✅ UPDATED: ConsumptionCalculationService - Includes Rice Arranged + Supports Negative Balances
 * 
 * Changes Made:
 * 1. Added rice_arranged fields in opening balance calculations
 * 2. Removed all max(0, ...) constraints on balance calculations
 * 3. Balance calculations now support negative values
 * 4. Formula: Total Available = Opening + Lifted + Arranged
 * 5. Updated to use MonthlyRiceConfiguration instead of RiceConfiguration
 */
class ConsumptionCalculationService
{
    /**
     * Get CURRENT configured rates from MonthlyRiceConfiguration
     */
    private function getRatesFromConfig(User $user): array
    {
        $config = MonthlyRiceConfiguration::where('user_id', $user->id)->latest()->first();
        
        if (!$config) {
            return [
                'primary' => 0.1,
                'middle' => 0.15,
            ];
        }
        
        return [
            'primary' => ($config->daily_consumption_primary ?? 100) / 1000,
            'middle' => ($config->daily_consumption_upper_primary ?? 150) / 1000,
        ];
    }

    /**
     * ✅ UPDATED: Get opening balance including rice arranged
     * Formula: Opening + Lifted + Arranged
     */
    private function getCurrentOpeningBalance(User $user, MonthlyRiceConfiguration $riceConfig): float
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $configMonth = $riceConfig->month ?? $currentMonth;
        $configYear = $riceConfig->year ?? $currentYear;

        $isSameMonth = ($currentMonth == $configMonth && $currentYear == $configYear);

        if ($isSameMonth) {
            // ✅ UPDATED: Include rice_arranged in calculation
            return round(
                ($riceConfig->opening_balance_primary ?? 0) + 
                ($riceConfig->rice_lifted_primary ?? 0) +
                ($riceConfig->rice_arranged_primary ?? 0) +  // ✅ NEW
                ($riceConfig->opening_balance_upper_primary ?? 0) + 
                ($riceConfig->rice_lifted_upper_primary ?? 0) +
                ($riceConfig->rice_arranged_upper_primary ?? 0),  // ✅ NEW
                2
            );
        } else {
            return round(
                ($riceConfig->closing_balance_primary ?? 0) + 
                ($riceConfig->closing_balance_upper_primary ?? 0),
                2
            );
        }
    }

    /**
     * Calculate rice consumption using CURRENT configured rates
     */
    public function calculateRiceConsumption(int $servedPrimary, int $servedMiddle, ?User $user = null): array
    {
        if (!$user) {
            $primaryRate = 0.1;
            $middleRate = 0.15;
        } else {
            $rates = $this->getRatesFromConfig($user);
            $primaryRate = $rates['primary'];
            $middleRate = $rates['middle'];
        }

        $primaryRice = ($servedPrimary ?? 0) * $primaryRate;
        $middleRice = ($servedMiddle ?? 0) * $middleRate;
        $totalRice = $primaryRice + $middleRice;

        return [
            'primary' => round($primaryRice, 2),
            'middle' => round($middleRice, 2),
            'total' => round($totalRice, 2),
        ];
    }

    /**
     * Calculate amount/cost consumption with ingredient breakdown
     */
    public function calculateAmountConsumption(
        int $servedPrimary, 
        int $servedMiddle, 
        AmountConfiguration $config
    ): array {
        $primaryBreakdown = [
            'pulses' => $servedPrimary * $config->daily_pulses_primary,
            'vegetables' => $servedPrimary * $config->daily_vegetables_primary,
            'oil' => $servedPrimary * $config->daily_oil_primary,
            'salt' => $servedPrimary * $config->daily_salt_primary,
            'fuel' => $servedPrimary * $config->daily_fuel_primary,
        ];
        $primaryBreakdown['total'] = array_sum($primaryBreakdown);

        $middleBreakdown = [
            'pulses' => $servedMiddle * $config->daily_pulses_middle,
            'vegetables' => $servedMiddle * $config->daily_vegetables_middle,
            'oil' => $servedMiddle * $config->daily_oil_middle,
            'salt' => $servedMiddle * $config->daily_salt_middle,
            'fuel' => $servedMiddle * $config->daily_fuel_middle,
        ];
        $middleBreakdown['total'] = array_sum($middleBreakdown);

        $primaryBreakdown = array_map(fn($val) => round($val, 2), $primaryBreakdown);
        $middleBreakdown = array_map(fn($val) => round($val, 2), $middleBreakdown);

        return [
            'primary' => $primaryBreakdown,
            'middle' => $middleBreakdown,
            'grandTotal' => round($primaryBreakdown['total'] + $middleBreakdown['total'], 2),
        ];
    }

    /**
     * Get consumptions with calculations using CURRENT rates
     */
    public function getConsumptionsWithCalculations(User $user, int $perPage = 15)
    {
        $rates = $this->getRatesFromConfig($user);
        
        Log::info('Getting consumptions with current rates:', [
            'user_id' => $user->id,
            'primary_rate' => $rates['primary'],
            'middle_rate' => $rates['middle'],
        ]);

        $paginatedConsumptions = DailyConsumption::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate($perPage);

        $allRecords = DailyConsumption::where('user_id', $user->id)
            ->orderBy('date', 'asc')
            ->get();

        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        $amountConfig = AmountConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        $openingBalance = $riceConfig 
            ? $this->getCurrentOpeningBalance($user, $riceConfig)
            : 0;

        Log::info('Calculating balances:', [
            'opening_balance' => $openingBalance,
            'total_records' => $allRecords->count(),
        ]);

        $recordsWithCalculations = $this->getCumulativeBalances(
            $allRecords, 
            $openingBalance,
            $amountConfig,
            $user
        );

        $calculationMap = $recordsWithCalculations->keyBy('id');

        $paginatedConsumptions->getCollection()->transform(function ($record) use ($calculationMap) {
            $calculatedRecord = $calculationMap->get($record->id);
            
            if ($calculatedRecord) {
                $record->primary_rice = $calculatedRecord->primary_rice;
                $record->middle_rice = $calculatedRecord->middle_rice;
                $record->total_rice = $calculatedRecord->total_rice;
                $record->rice_balance_after = $calculatedRecord->rice_balance_after;
                $record->cumulative_amount = $calculatedRecord->cumulative_amount;
                
                $record->primary_pulses = $calculatedRecord->primary_pulses ?? 0;
                $record->primary_vegetables = $calculatedRecord->primary_vegetables ?? 0;
                $record->primary_oil = $calculatedRecord->primary_oil ?? 0;
                $record->primary_salt = $calculatedRecord->primary_salt ?? 0;
                $record->primary_fuel = $calculatedRecord->primary_fuel ?? 0;
                $record->primary_total = $calculatedRecord->primary_total ?? 0;
                $record->middle_pulses = $calculatedRecord->middle_pulses ?? 0;
                $record->middle_vegetables = $calculatedRecord->middle_vegetables ?? 0;
                $record->middle_oil = $calculatedRecord->middle_oil ?? 0;
                $record->middle_salt = $calculatedRecord->middle_salt ?? 0;
                $record->middle_fuel = $calculatedRecord->middle_fuel ?? 0;
                $record->middle_total = $calculatedRecord->middle_total ?? 0;
            }
            
            return $record;
        });

        return $paginatedConsumptions;
    }

    /**
     * ✅ UPDATED: Calculate cumulative balances - Allow negative values
     */
    public function getCumulativeBalances(
        Collection $records, 
        float $openingBalance,
        ?AmountConfiguration $amountConfig = null,
        ?User $user = null
    ): Collection {
        $runningRiceBalance = $openingBalance;
        $runningAmountTotal = 0;

        return $records->map(function ($record) use (&$runningRiceBalance, &$runningAmountTotal, $amountConfig, $user) {
            $riceCalc = $this->calculateRiceConsumption(
                $record->served_primary ?? 0,
                $record->served_middle ?? 0,
                $user
            );

            // ✅ UPDATED: No max(0, ...) - Allow negative balance
            $runningRiceBalance -= $riceCalc['total'];

            $amountBreakdown = null;
            if ($amountConfig) {
                $amountBreakdown = $this->calculateAmountConsumption(
                    $record->served_primary ?? 0,
                    $record->served_middle ?? 0,
                    $amountConfig
                );

                $runningAmountTotal += $record->amount_consumed ?? $amountBreakdown['grandTotal'];
            }

            $record->primary_rice = $riceCalc['primary'];
            $record->middle_rice = $riceCalc['middle'];
            $record->total_rice = $riceCalc['total'];
            $record->rice_balance_after = round($runningRiceBalance, 2); // Can be negative
            $record->cumulative_amount = round($runningAmountTotal, 2);

            if ($amountBreakdown) {
                $record->primary_pulses = $amountBreakdown['primary']['pulses'];
                $record->primary_vegetables = $amountBreakdown['primary']['vegetables'];
                $record->primary_oil = $amountBreakdown['primary']['oil'];
                $record->primary_salt = $amountBreakdown['primary']['salt'];
                $record->primary_fuel = $amountBreakdown['primary']['fuel'];
                $record->primary_total = $amountBreakdown['primary']['total'];

                $record->middle_pulses = $amountBreakdown['middle']['pulses'];
                $record->middle_vegetables = $amountBreakdown['middle']['vegetables'];
                $record->middle_oil = $amountBreakdown['middle']['oil'];
                $record->middle_salt = $amountBreakdown['middle']['salt'];
                $record->middle_fuel = $amountBreakdown['middle']['fuel'];
                $record->middle_total = $amountBreakdown['middle']['total'];
            }

            return $record;
        });
    }

    /**
     * ✅ UPDATED: Get summary statistics - Allow negative current balance
     */
    public function getSummary(User $user): array
    {
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        $openingBalance = $riceConfig 
            ? $this->getCurrentOpeningBalance($user, $riceConfig)
            : 0;

        $allRecords = DailyConsumption::where('user_id', $user->id)
            ->orderBy('date', 'asc')
            ->get();

        $totalRiceConsumed = 0;
        $totalAmountSpent = 0;

        foreach ($allRecords as $record) {
            $riceCalc = $this->calculateRiceConsumption(
                $record->served_primary ?? 0,
                $record->served_middle ?? 0,
                $user
            );
            $totalRiceConsumed += $riceCalc['total'];
            $totalAmountSpent += $record->amount_consumed ?? 0;
        }

        // ✅ UPDATED: No max(0, ...) - Allow negative current balance
        $currentBalance = $openingBalance - $totalRiceConsumed;
        $totalDays = $allRecords->count();
        $averageDailyConsumption = $totalDays > 0
            ? round($totalRiceConsumed / $totalDays, 2)
            : 0;

        $openingBalanceRounded = round($openingBalance, 2);
        $totalRiceConsumedRounded = round($totalRiceConsumed, 2);
        $currentBalanceRounded = round($currentBalance, 2);
        $totalAmountSpentRounded = round($totalAmountSpent, 2);

        return [
            // snake_case keys (new format)
            'opening_balance' => $openingBalanceRounded,
            'total_consumed' => $totalRiceConsumedRounded,
            'current_balance' => $currentBalanceRounded, // Can be negative
            'total_amount_spent' => $totalAmountSpentRounded,
            'total_records' => $totalDays,
            'average_daily_consumption' => $averageDailyConsumption,

            // legacy camelCase keys consumed by existing UI
            'openingBalance' => $openingBalanceRounded,
            'totalRiceConsumed' => $totalRiceConsumedRounded,
            'currentBalance' => $currentBalanceRounded,
            'totalAmountSpent' => $totalAmountSpentRounded,
            'totalDays' => $totalDays,
            'avgDailyConsumption' => $averageDailyConsumption,
        ];
    }

    /**
     * Get current available stock (closing balance from MonthlyRiceConfiguration)
     */
    public function getAvailableStock(User $user): float
    {
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$riceConfig) {
            return 0;
        }

        // ✅ UPDATED: No max(0, ...) - Allow negative balance
        return round(
            ($riceConfig->closing_balance_primary ?? 0) + 
            ($riceConfig->closing_balance_upper_primary ?? 0),
            2
        );
    }

    /**
     * ✅ UPDATED: Calculate available stock at a specific date - Allow negative
     */
    public function getAvailableStockAtDate(User $user, string $beforeDate, bool $includeDate = false): float
    {
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$riceConfig) {
            return 0;
        }

        $openingBalance = $this->getCurrentOpeningBalance($user, $riceConfig);

        $operator = $includeDate ? '<=' : '<';
        
        $consumedRecords = DailyConsumption::where('user_id', $user->id)
            ->where('date', $operator, $beforeDate)
            ->orderBy('date', 'asc')
            ->get();

        $totalConsumed = 0;
        foreach ($consumedRecords as $record) {
            $riceCalc = $this->calculateRiceConsumption(
                $record->served_primary ?? 0,
                $record->served_middle ?? 0,
                $user
            );
            $totalConsumed += $riceCalc['total'];
        }

        // ✅ UPDATED: No max(0, ...) - Allow negative balance
        return round($openingBalance - $totalConsumed, 2);
    }

    /**
     * Get all consumptions for a specific month
     */
    public function getConsumptionsForMonth(User $user, int $month, int $year): Collection
    {
        return DailyConsumption::where('user_id', $user->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get();
    }

    /**
     * Calculate monthly totals using CURRENT rates
     */
    public function calculateMonthlyTotals(Collection $consumptions, User $user): array
    {
        $totalServedPrimary = 0;
        $totalServedMiddle = 0;
        $totalRiceConsumed = 0;
        $totalPrimaryRice = 0;
        $totalMiddleRice = 0;
        $totalAmountSpent = 0;

        foreach ($consumptions as $consumption) {
            $totalServedPrimary += $consumption->served_primary ?? 0;
            $totalServedMiddle += $consumption->served_middle ?? 0;

            $riceCalc = $this->calculateRiceConsumption(
                $consumption->served_primary ?? 0,
                $consumption->served_middle ?? 0,
                $user
            );
            $totalPrimaryRice += $riceCalc['primary'];
            $totalMiddleRice += $riceCalc['middle'];
            $totalRiceConsumed += $riceCalc['total'];
            $totalAmountSpent += $consumption->amount_consumed ?? 0;
        }

        $totalDays = $consumptions->count();
        $averageDaily = $totalDays > 0
            ? round($totalRiceConsumed / $totalDays, 2)
            : 0;

        $totalPrimaryRice = round($totalPrimaryRice, 2);
        $totalMiddleRice = round($totalMiddleRice, 2);
        $totalRiceConsumed = round($totalRiceConsumed, 2);
        $totalAmountSpent = round($totalAmountSpent, 2);

        return [
            // snake_case keys
            'total_served_primary' => $totalServedPrimary,
            'total_served_middle' => $totalServedMiddle,
            'total_served' => $totalServedPrimary + $totalServedMiddle,
            'total_primary_students' => $totalServedPrimary,
            'total_middle_students' => $totalServedMiddle,
            'total_rice_consumed' => $totalRiceConsumed,
            'total_primary_rice' => $totalPrimaryRice,
            'total_middle_rice' => $totalMiddleRice,
            'total_amount_spent' => $totalAmountSpent,
            'total_days' => $totalDays,
            'total_serving_days' => $totalDays,
            'average_daily' => $averageDaily,

            // camelCase / legacy keys
            'totalPrimaryStudents' => $totalServedPrimary,
            'totalMiddleStudents' => $totalServedMiddle,
            'totalPrimaryRice' => $totalPrimaryRice,
            'totalMiddleRice' => $totalMiddleRice,
            'totalRiceConsumed' => $totalRiceConsumed,
            'totalAmountSpent' => $totalAmountSpent,
            'totalDays' => $totalDays,
            'averageDailyConsumption' => $averageDaily,
        ];
    }

    /**
     * Get opening balance for a specific date
     */
    public function getOpeningBalanceForDate(User $user, Carbon $date): float
    {
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$riceConfig) {
            return 0;
        }

        $openingBalance = $this->getCurrentOpeningBalance($user, $riceConfig);

        $consumedBefore = DailyConsumption::where('user_id', $user->id)
            ->where('date', '<', $date->format('Y-m-d'))
            ->orderBy('date', 'asc')
            ->get();

        $totalConsumed = 0;
        foreach ($consumedBefore as $record) {
            $riceCalc = $this->calculateRiceConsumption(
                $record->served_primary ?? 0,
                $record->served_middle ?? 0,
                $user
            );
            $totalConsumed += $riceCalc['total'];
        }

        // ✅ UPDATED: No max(0, ...) - Allow negative balance
        return round($openingBalance - $totalConsumed, 2);
    }

    /**
     * ✅ UPDATED: Format daily records for report - Allow negative balances
     */
    public function formatDailyRecordsForReport(Collection $consumptions, float $openingBalance, User $user): array
    {
        $runningBalance = $openingBalance;
        $records = [];

        foreach ($consumptions as $consumption) {
            $riceCalc = $this->calculateRiceConsumption(
                $consumption->served_primary ?? 0,
                $consumption->served_middle ?? 0,
                $user
            );

            // ✅ UPDATED: No max(0, ...) - Allow negative balance
            $runningBalance -= $riceCalc['total'];

            $records[] = [
                'date' => $consumption->date->format('Y-m-d'),
                'day' => $consumption->day,
                'served_primary' => $consumption->served_primary ?? 0,
                'served_middle' => $consumption->served_middle ?? 0,
                'total_served' => ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0),
                'primary_rice' => $riceCalc['primary'],
                'middle_rice' => $riceCalc['middle'],
                'total_rice' => $riceCalc['total'],
                'rice_consumed' => $riceCalc['total'],
                'balance_after' => round($runningBalance, 2), // Can be negative
            ];
        }

        return $records;
    }

    /**
     * Get rice consumption rate for a specific section
     */
    public function getRiceRate(string $section, ?User $user = null): float
    {
        if (!$user) {
            return $section === 'primary' ? 0.1 : 0.15;
        }

        $rates = $this->getRatesFromConfig($user);
        return $rates[$section] ?? 0;
    }

    

    public function calculateAmountConsumptionWithSaltBreakdown(
        int $servedPrimary, 
        int $servedMiddle, 
        AmountConfiguration $config
    ): array {
        $primaryBreakdown = [
            'pulses' => $servedPrimary * $config->daily_pulses_primary,
            'vegetables' => $servedPrimary * $config->daily_vegetables_primary,
            'oil' => $servedPrimary * $config->daily_oil_primary,
            'salt_iodized' => $servedPrimary * $config->daily_salt_iodized_primary,
            'salt_non_iodized' => $servedPrimary * $config->daily_salt_non_iodized_primary,
            'fuel' => $servedPrimary * $config->daily_fuel_primary,
        ];
        $primaryBreakdown['total'] = array_sum($primaryBreakdown);

        $middleBreakdown = [
            'pulses' => $servedMiddle * $config->daily_pulses_middle,
            'vegetables' => $servedMiddle * $config->daily_vegetables_middle,
            'oil' => $servedMiddle * $config->daily_oil_middle,
            'salt_iodized' => $servedMiddle * $config->daily_salt_iodized_middle,
            'salt_non_iodized' => $servedMiddle * $config->daily_salt_non_iodized_middle,
            'fuel' => $servedMiddle * $config->daily_fuel_middle,
        ];
        $middleBreakdown['total'] = array_sum($middleBreakdown);

        $primaryBreakdown = array_map(fn($val) => round($val, 2), $primaryBreakdown);
        $middleBreakdown = array_map(fn($val) => round($val, 2), $middleBreakdown);

        return [
            'primary' => $primaryBreakdown,
            'middle' => $middleBreakdown,
            'grandTotal' => round($primaryBreakdown['total'] + $middleBreakdown['total'], 2),
        ];
    }

    public function calculateMonthlyAmountTotals(
        Collection $consumptions, 
        AmountConfiguration $config, 
        User $user
    ): array {
        $totalServedPrimary = 0;
        $totalServedMiddle = 0;
        
        $totalPulses = 0;
        $totalVegetables = 0;
        $totalOil = 0;
        $totalSaltIodized = 0;
        $totalSaltNonIodized = 0;
        $totalFuel = 0;

        $totalPrimaryPulses = 0;
        $totalPrimaryVegetables = 0;
        $totalPrimaryOil = 0;
        $totalPrimarySaltIodized = 0;
        $totalPrimarySaltNonIodized = 0;
        $totalPrimaryFuel = 0;

        $totalMiddlePulses = 0;
        $totalMiddleVegetables = 0;
        $totalMiddleOil = 0;
        $totalMiddleSaltIodized = 0;
        $totalMiddleSaltNonIodized = 0;
        $totalMiddleFuel = 0;

        $saltPercentages = [
            'common' => $config->salt_percentage_common ?? 0,
            'chilli' => $config->salt_percentage_chilli ?? 0,
            'turmeric' => $config->salt_percentage_turmeric ?? 0,
            'coriander' => $config->salt_percentage_coriander ?? 0,
            'other' => $config->salt_percentage_other ?? 0,
        ];

        $saltPercentages = $this->normalizeSaltPercentages($saltPercentages);

        foreach ($consumptions as $consumption) {
            $servedPrimary = $consumption->served_primary ?? 0;
            $servedMiddle = $consumption->served_middle ?? 0;

            $totalServedPrimary += $servedPrimary;
            $totalServedMiddle += $servedMiddle;

            $breakdown = $this->calculateAmountConsumptionWithSaltBreakdown(
                $servedPrimary,
                $servedMiddle,
                $config
            );

            $primary = $breakdown['primary'];
            $middle = $breakdown['middle'];

            $totalPrimaryPulses += $primary['pulses'];
            $totalPrimaryVegetables += $primary['vegetables'];
            $totalPrimaryOil += $primary['oil'];
            $totalPrimarySaltIodized += $primary['salt_iodized'];
            $totalPrimarySaltNonIodized += $primary['salt_non_iodized'];
            $totalPrimaryFuel += $primary['fuel'];

            $totalMiddlePulses += $middle['pulses'];
            $totalMiddleVegetables += $middle['vegetables'];
            $totalMiddleOil += $middle['oil'];
            $totalMiddleSaltIodized += $middle['salt_iodized'];
            $totalMiddleSaltNonIodized += $middle['salt_non_iodized'];
            $totalMiddleFuel += $middle['fuel'];

            $totalPulses += $primary['pulses'] + $middle['pulses'];
            $totalVegetables += $primary['vegetables'] + $middle['vegetables'];
            $totalOil += $primary['oil'] + $middle['oil'];
            $totalSaltIodized += $primary['salt_iodized'] + $middle['salt_iodized'];
            $totalSaltNonIodized += $primary['salt_non_iodized'] + $middle['salt_non_iodized'];
            $totalFuel += $primary['fuel'] + $middle['fuel'];
        }

        $totalPrimarySalt = $totalPrimarySaltIodized + $totalPrimarySaltNonIodized;
        $totalMiddleSalt = $totalMiddleSaltIodized + $totalMiddleSaltNonIodized;

        $primarySaltBreakdown = $this->calculateSaltBreakdownFromPercentages($totalPrimarySalt, $saltPercentages);
        $middleSaltBreakdown = $this->calculateSaltBreakdownFromPercentages($totalMiddleSalt, $saltPercentages);

        $grandTotalPrimary = $totalPrimaryPulses + $totalPrimaryVegetables + $totalPrimaryOil + $totalPrimarySalt + $totalPrimaryFuel;
        $grandTotalMiddle = $totalMiddlePulses + $totalMiddleVegetables + $totalMiddleOil + $totalMiddleSalt + $totalMiddleFuel;
        $grandTotalAmount = $grandTotalPrimary + $grandTotalMiddle;

        $totalDays = $consumptions->count();
        $averageDailyAmount = $totalDays > 0 ? round($grandTotalAmount / $totalDays, 2) : 0;

        return [
            'total_served_primary' => $totalServedPrimary,
            'total_served_middle' => $totalServedMiddle,
            'total_served' => $totalServedPrimary + $totalServedMiddle,
            'total_pulses' => round($totalPulses, 2),
            'total_vegetables' => round($totalVegetables, 2),
            'total_oil' => round($totalOil, 2),
            'total_salt_iodized' => round($totalSaltIodized, 2),
            'total_salt_non_iodized' => round($totalSaltNonIodized, 2),
            'total_fuel' => round($totalFuel, 2),
            'grand_total' => round($grandTotalAmount, 2),
            'total_days' => $totalDays,

            'total_primary_students' => $totalServedPrimary,
            'total_primary_pulses' => round($totalPrimaryPulses, 2),
            'total_primary_vegetables' => round($totalPrimaryVegetables, 2),
            'total_primary_oil' => round($totalPrimaryOil, 2),
            'total_primary_salt' => round($totalPrimarySalt, 2),
            'total_primary_common_salt' => round($primarySaltBreakdown['common_salt'], 2),
            'total_primary_chilli_powder' => round($primarySaltBreakdown['chilli_powder'], 2),
            'total_primary_turmeric' => round($primarySaltBreakdown['turmeric'], 2),
            'total_primary_coriander' => round($primarySaltBreakdown['coriander'], 2),
            'total_primary_other_condiments' => round($primarySaltBreakdown['other_condiments'], 2),
            'total_primary_fuel' => round($totalPrimaryFuel, 2),
            'total_primary_amount' => round($grandTotalPrimary, 2),

            'total_middle_students' => $totalServedMiddle,
            'total_middle_pulses' => round($totalMiddlePulses, 2),
            'total_middle_vegetables' => round($totalMiddleVegetables, 2),
            'total_middle_oil' => round($totalMiddleOil, 2),
            'total_middle_salt' => round($totalMiddleSalt, 2),
            'total_middle_common_salt' => round($middleSaltBreakdown['common_salt'], 2),
            'total_middle_chilli_powder' => round($middleSaltBreakdown['chilli_powder'], 2),
            'total_middle_turmeric' => round($middleSaltBreakdown['turmeric'], 2),
            'total_middle_coriander' => round($middleSaltBreakdown['coriander'], 2),
            'total_middle_other_condiments' => round($middleSaltBreakdown['other_condiments'], 2),
            'total_middle_fuel' => round($totalMiddleFuel, 2),
            'total_middle_amount' => round($grandTotalMiddle, 2),

            'total_serving_days' => $totalDays,
            'grand_total_amount' => round($grandTotalAmount, 2),
            'average_daily_amount' => $averageDailyAmount,
        ];
    }

    public function formatDailyRecordsForAmountReport(
        Collection $consumptions, 
        AmountConfiguration $config
    ): array {
        $records = [];

        foreach ($consumptions as $consumption) {
            $breakdown = $this->calculateAmountConsumptionWithSaltBreakdown(
                $consumption->served_primary ?? 0,
                $consumption->served_middle ?? 0,
                $config
            );

            $records[] = [
                'date' => $consumption->date->format('Y-m-d'),
                'day' => $consumption->day,
                'served_primary' => $consumption->served_primary ?? 0,
                'served_middle' => $consumption->served_middle ?? 0,
                'total_served' => ($consumption->served_primary ?? 0) + ($consumption->served_middle ?? 0),
                'pulses' => $breakdown['primary']['pulses'] + $breakdown['middle']['pulses'],
                'vegetables' => $breakdown['primary']['vegetables'] + $breakdown['middle']['vegetables'],
                'oil' => $breakdown['primary']['oil'] + $breakdown['middle']['oil'],
                'salt_iodized' => $breakdown['primary']['salt_iodized'] + $breakdown['middle']['salt_iodized'],
                'salt_non_iodized' => $breakdown['primary']['salt_non_iodized'] + $breakdown['middle']['salt_non_iodized'],
                'fuel' => $breakdown['primary']['fuel'] + $breakdown['middle']['fuel'],
                'total' => $breakdown['grandTotal'],
            ];
        }

        return $records;
    }

    protected function calculateSaltBreakdownFromPercentages(float $totalSalt, array $percentages): array
    {
        if ($totalSalt <= 0) {
            return [
                'common_salt' => 0,
                'chilli_powder' => 0,
                'turmeric' => 0,
                'coriander' => 0,
                'other_condiments' => 0,
            ];
        }

        $percentages = $this->normalizeSaltPercentages($percentages);

        $common = ($totalSalt * $percentages['common']) / 100;
        $chilli = ($totalSalt * $percentages['chilli']) / 100;
        $turmeric = ($totalSalt * $percentages['turmeric']) / 100;
        $coriander = ($totalSalt * $percentages['coriander']) / 100;
        $other = ($totalSalt * $percentages['other']) / 100;

        return [
            'common_salt' => round($common, 4),
            'chilli_powder' => round($chilli, 4),
            'turmeric' => round($turmeric, 4),
            'coriander' => round($coriander, 4),
            'other_condiments' => round($other, 4),
        ];
    }

    protected function normalizeSaltPercentages(?array $percentages): array
    {
        $defaults = [
            'common' => 30,
            'chilli' => 20,
            'turmeric' => 20,
            'coriander' => 15,
            'other' => 15,
        ];

        if (!$percentages) {
            return $defaults;
        }

        return [
            'common' => (float) ($percentages['common'] ?? $percentages['common_salt'] ?? $defaults['common']),
            'chilli' => (float) ($percentages['chilli'] ?? $percentages['chilli_powder'] ?? $defaults['chilli']),
            'turmeric' => (float) ($percentages['turmeric'] ?? $defaults['turmeric']),
            'coriander' => (float) ($percentages['coriander'] ?? $defaults['coriander']),
            'other' => (float) ($percentages['other'] ?? $percentages['other_condiments'] ?? $defaults['other']),
        ];
    }
}
