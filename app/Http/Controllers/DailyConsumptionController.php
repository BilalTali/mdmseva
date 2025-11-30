<?php

namespace App\Http\Controllers;

use App\Models\DailyConsumption;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Services\ConsumptionCalculationService;
use App\Http\Requests\DailyConsumptionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

/**
 * ✅ UPDATED: DailyConsumptionController - Month-Based Calculations + Configuration Enforcement
 * 
 * Recent Changes:
 * 1. Migrated to MonthlyRiceConfiguration system
 * 2. Implemented month-based filtering for all calculations
 * 3. Added automatic redirection to configuration workflow if not completed
 * 4. Updated balance calculations to use only current month's data
 * 5. ✅ UPDATED: Uses MonthlyAmountConfiguration instead of AmountConfiguration
 */
class DailyConsumptionController extends Controller
{
    protected ConsumptionCalculationService $calculationService;

    public function __construct(ConsumptionCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * Check if monthly configurations are completed for current month
     * Returns redirect response if not completed, null if all good
     */
    private function checkMonthlyConfigurationStatus($user, int $month, int $year): ?RedirectResponse
    {
        $monthName = Carbon::create($year, $month, 1)->format('F');

        // Check Rice Configuration
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();

        if (!$riceConfig) {
            return redirect()
                ->route('monthly-rice-config.create', ['month' => $month, 'year' => $year])
                ->with('warning', sprintf(
                    'Please create rice configuration for %s %d before entering daily consumption.',
                    $monthName,
                    $year
                ));
        }

        // Check Amount Configuration
        $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();

        if (!$amountConfig || !$amountConfig->is_completed) {
            $message = !$amountConfig 
                ? "Amount configuration for {$monthName} {$year} is missing." 
                : "Amount configuration for {$monthName} {$year} is pending confirmation.";
                
            return redirect()->route('amount-config.index', ['month' => $month, 'year' => $year])
                ->with('warning', $message . ' Please review and update/confirm it before proceeding.');
        }

        return null; // All configurations completed
    }

    /**
     * Get current active month and year for daily consumption
     * ✅ UPDATED: Intelligently finds the most recent configured month
     */
    private function getCurrentPeriod($user, ?Request $request = null): array
    {
        // First, check if month/year are provided in the request (user selection)
        if ($request && $request->has('month') && $request->has('year')) {
            return [
                'month' => (int) $request->input('month'),
                'year' => (int) $request->input('year'),
            ];
        }
        
        // Second, use latest consumption date if it exists
        $latestConsumption = DailyConsumption::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->first();

        if ($latestConsumption) {
            return [
                'month' => $latestConsumption->date->month,
                'year' => $latestConsumption->date->year,
            ];
        }

        // Third, find the most recent month with configured rice
        $latestConfigured = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();
            
        if ($latestConfigured) {
            return [
                'month' => $latestConfigured->month,
                'year' => $latestConfigured->year,
            ];
        }

        // Finally, fall back to current month
        return [
            'month' => now()->month,
            'year' => now()->year,
        ];
    }

    /**
     * ✅ NEW: Show month selector as landing page
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get available months with configuration status
        // We'll base this on Rice Configuration existence
        $availableMonths = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($config) use ($user) {
                $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
                    ->forPeriod($config->month, $config->year)
                    ->first();

                return [
                    'month' => $config->month,
                    'year' => $config->year,
                    'rice_config_completed' => true, // If it exists, it's "configured" enough to start
                    'amount_config_completed' => $amountConfig ? true : false,
                ];
            });

        return Inertia::render('DailyConsumption/MonthSelector', [
            'availableMonths' => $availableMonths,
        ]);
    }

    /**
     * ✅ NEW: Handle month selection and redirect to appropriate page
     */
    public function selectMonth(Request $request): RedirectResponse
    {
        $month = (int) $request->input('month');
        $year = (int) $request->input('year');
        $user = Auth::user();
        
        // Check configuration status
        $configCheck = $this->checkMonthlyConfigurationStatus($user, $month, $year);
        if ($configCheck) {
            return $configCheck;
        }
        
        // Both configurations completed - redirect to daily consumption list
        return redirect()
            ->route('daily-consumptions.list', ['month' => $month, 'year' => $year])
            ->with('success', sprintf(
                'Daily Consumption for %s %d',
                Carbon::create($year, $month, 1)->format('F'),
                $year
            ));
    }

    /**
     * ✅ NEW: Display daily consumption list for selected month
     */
    public function list(Request $request): Response|RedirectResponse
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $user = Auth::user();
        $schoolType = $user->school_type;
        
        // Check if monthly configuration is completed
        $configCheck = $this->checkMonthlyConfigurationStatus($user, $month, $year);
        if ($configCheck) {
            return $configCheck;
        }

        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();

        if (!$riceConfig) {
            return Inertia::render('DailyConsumption/Index', [
                'consumptions' => [],
                'schoolType' => $schoolType,
                'sections' => $user->getRequiredSections(),
                'enrollment' => $user->getEnrollmentData(),
                'currentMonth' => $month,
                'currentYear' => $year,
                'monthName' => Carbon::create($year, $month, 1)->format('F'),
                'error' => 'Please configure rice stock first.',
            ]);
        }

        // Fetch all daily consumptions for the selected month
        $consumptions = DailyConsumption::where('user_id', $user->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'asc')
            ->get();

        // Get configurations
        $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();
        
        // Calculate rice rates
        $primaryRiceRate = ($riceConfig->daily_consumption_primary ?? 100) / 1000;
        $middleRiceRate = ($riceConfig->daily_consumption_upper_primary ?? 150) / 1000;

        // Prepare detailed consumption data with running balances
        // For monthly system, opening balance is fixed from config
        $openingBalance = $riceConfig->opening_balance_primary + 
                          $riceConfig->opening_balance_upper_primary +
                          $riceConfig->rice_lifted_primary +
                          $riceConfig->rice_lifted_upper_primary +
                          $riceConfig->rice_arranged_primary +
                          $riceConfig->rice_arranged_upper_primary;
        
        $runningBalance = $openingBalance;
        $consumptionDetails = [];
        
        foreach ($consumptions as $consumption) {
            // Calculate rice consumed on-the-fly
            $servedPrimary = $consumption->served_primary ?? 0;
            $servedMiddle = $consumption->served_middle ?? 0;
            $ricePrimary = $servedPrimary * $primaryRiceRate;
            $riceMiddle = $servedMiddle * $middleRiceRate;
            $riceConsumed = $ricePrimary + $riceMiddle;

            $primaryAmount = 0;
            $middleAmount = 0;
            if ($amountConfig) {
                $primaryAmount = $servedPrimary * ($amountConfig->daily_amount_per_student_primary ?? 0);
                $middleAmount = $servedMiddle * ($amountConfig->daily_amount_per_student_upper_primary ?? 0);
            }

            $runningBalance -= $riceConsumed;

            $consumptionDetails[] = [
                'id' => $consumption->id,
                'date' => $consumption->date->format('Y-m-d'),
                'day' => $consumption->date->format('d'),
                'dayName' => $consumption->date->format('l'),
                'served_primary' => $servedPrimary,
                'served_middle' => $servedMiddle,
                'total_served' => $servedPrimary + $servedMiddle,
                'rice_primary' => round($ricePrimary, 2),
                'rice_middle' => round($riceMiddle, 2),
                'rice_consumed' => round($riceConsumed, 2),
                'rice_balance' => round($runningBalance, 2),
                'amount_consumed' => $consumption->amount_consumed ?? 0,
                'amount_primary' => round($primaryAmount, 2),
                'amount_middle' => round($middleAmount, 2),
                'remarks' => $consumption->remarks,
            ];
        }

        // Calculate totals from the processed data
        $totalPrimaryStudents = $consumptions->sum('served_primary');
        $totalMiddleStudents = $consumptions->sum('served_middle');
        $totalRiceConsumed = collect($consumptionDetails)->sum('rice_consumed');
        $totalAmountPrimary = collect($consumptionDetails)->sum('amount_primary');
        $totalAmountMiddle = collect($consumptionDetails)->sum('amount_middle');
        $totalAmountConsumed = $totalAmountPrimary + $totalAmountMiddle;
        $closingBalance = $openingBalance - $totalRiceConsumed;

        return Inertia::render('DailyConsumption/Index', [
            'consumptions' => $consumptionDetails,
            'schoolType' => $schoolType,
            'sections' => $user->getRequiredSections(),
            'enrollment' => $user->getEnrollmentData(),
            'currentMonth' => $month,
            'currentYear' => $year,
            'monthName' => Carbon::create($year, $month, 1)->format('F'),
            'openingBalance' => round($openingBalance, 2),
            'closingBalance' => round($closingBalance, 2),
            'totalPrimaryStudents' => $totalPrimaryStudents,
            'totalMiddleStudents' => $totalMiddleStudents,
            'totalStudents' => $totalPrimaryStudents + $totalMiddleStudents,
            'totalRiceConsumed' => round($totalRiceConsumed, 2),
            'totalAmountPrimary' => round($totalAmountPrimary, 2),
            'totalAmountMiddle' => round($totalAmountMiddle, 2),
            'totalAmountConsumed' => round($totalAmountConsumed, 2),
            'totalDays' => $consumptions->count(),
            'primaryRiceRate' => $primaryRiceRate,
            'middleRiceRate' => $middleRiceRate,
            'primaryAmountRate' => optional($amountConfig)->daily_amount_per_student_primary ?? 0,
            'middleAmountRate' => optional($amountConfig)->daily_amount_per_student_upper_primary ?? 0,
            'riceConfig' => $riceConfig ? [
                'is_completed' => (bool) $riceConfig->is_completed,
                'is_locked' => (bool) $riceConfig->is_locked,
                'completed_at' => optional($riceConfig->completed_at)?->toIso8601String(),
            ] : null,
            'amountConfig' => $amountConfig ? [
                'is_completed' => (bool) $amountConfig->is_completed,
            ] : null,
        ]);
    }

    /**
     * ✅ UPDATED: Create form - Added configuration check
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $period = $this->getCurrentPeriod($user, $request);
        
        // Check if monthly configuration is completed
        $configCheck = $this->checkMonthlyConfigurationStatus($user, $period['month'], $period['year']);
        if ($configCheck) {
            return $configCheck;
        }
        
        $sections = $user->getRequiredSections();
        $enrollment = $user->getEnrollmentData();

        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($period['month'], $period['year'])
            ->first();

        if (!$riceConfig) {
            return Inertia::render('DailyConsumption/Create', [
                'sections' => $sections,
                'enrollment' => $enrollment,
                'availableStock' => 0,
                'previousDate' => null,
                'amountRates' => null,
                'riceRates' => [
                    'primary' => 0.1,
                    'middle' => 0.15,
                ],
                'error' => 'Please configure rice stock first before adding consumption records.',
                'schoolType' => $user->school_type,
            ]);
        }

        // Calculate available stock based on monthly config
        $availableStock = $riceConfig->opening_balance_primary + 
                          $riceConfig->opening_balance_upper_primary +
                          $riceConfig->rice_lifted_primary +
                          $riceConfig->rice_lifted_upper_primary +
                          $riceConfig->rice_arranged_primary +
                          $riceConfig->rice_arranged_upper_primary -
                          $riceConfig->consumed_primary -
                          $riceConfig->consumed_upper_primary;

        $lastConsumption = DailyConsumption::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->first();

        $previousDate = $lastConsumption ? $lastConsumption->date->format('Y-m-d') : null;

        // Fetch MonthlyAmountConfiguration for detailed rates
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
            ->where('month', $period['month'])
            ->where('year', $period['year'])
            ->first();
            
        // Fallback to latest if specific month not found
        if (!$amountConfig) {
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)->latest()->first();
        }

        $amountRates = $this->getAmountRatesArray($amountConfig);

        // Fetch existing consumption dates for this month to highlight in calendar
        $existingDates = DailyConsumption::where('user_id', $user->id)
            ->whereMonth('date', $period['month'])
            ->whereYear('date', $period['year'])
            ->pluck('date')
            ->map(function ($date) {
                return $date->format('j'); // Return just the day number (1-31)
            })
            ->toArray();

        return Inertia::render('DailyConsumption/Create', [
            'sections' => $sections,
            'enrollment' => $enrollment,
            'availableStock' => round($availableStock, 2),
            'previousDate' => $previousDate,
            'amountRates' => $amountRates,
            'schoolType' => $user->school_type,
            'riceRates' => [
                'primary' => $riceConfig->daily_consumption_primary / 1000,
                'middle' => $riceConfig->daily_consumption_upper_primary / 1000,
            ],
            'currentMonth' => $period['month'],
            'currentYear' => $period['year'],
            'existingDates' => $existingDates, // Pass existing dates to view
        ]);
    }

    /**
     * ✅ UPDATED: Store - Added configuration check and month validation
     */
    public function store(DailyConsumptionRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $validated = $request->validated();
        
        // Validate that date is in current configured month
        $consumptionDate = Carbon::parse($validated['date']);
        
        // Check if monthly configuration is completed for the consumption date's month
        $configCheck = $this->checkMonthlyConfigurationStatus(
            $user, 
            $consumptionDate->month, 
            $consumptionDate->year
        );
        if ($configCheck) {
            return $configCheck;
        }

        $existingRecord = DailyConsumption::where('user_id', $user->id)
            ->where('date', $validated['date'])
            ->exists();

        if ($existingRecord) {
            throw ValidationException::withMessages([
                'date' => 'A consumption record for this date already exists.'
            ]);
        }

        $servedPrimary = $validated['served_primary'] ?? 0;
        $servedMiddle = $validated['served_middle'] ?? 0;

        $riceCalc = $this->calculateRiceConsumptionWithConfig($user, $servedPrimary, $servedMiddle, $consumptionDate);

        $availableStock = $this->calculationService->getAvailableStockAtDate($user, $validated['date']);
        $riceBalanceAfter = !is_null($availableStock)
            ? round($availableStock - $riceCalc['total'], 2)
            : null;
        
        // Fetch MonthlyAmountConfiguration for detailed calculation
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
            ->where('month', $consumptionDate->month)
            ->where('year', $consumptionDate->year)
            ->first();
            
        if (!$amountConfig) {
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)->latest()->first();
        }

        $amountBreakdown = $amountConfig 
            ? $this->calculationService->calculateAmountConsumption($servedPrimary, $servedMiddle, $amountConfig)
            : null;

        DailyConsumption::create([
            'user_id' => $user->id,
            'date' => $validated['date'],
            'day' => $consumptionDate->format('l'),
            'served_primary' => $servedPrimary,
            'served_middle' => $servedMiddle,
            'rice_consumed' => $riceCalc['total'],
            'rice_balance_after' => $riceBalanceAfter,
            'amount_consumed' => $amountBreakdown['grandTotal'] ?? 0,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        // ✅ Sync consumed amounts to rice configuration
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($consumptionDate->month, $consumptionDate->year)
            ->first();
        if ($riceConfig) {
            $riceConfig->syncConsumedFromDaily();
            $riceConfig->save();
        }
        $this->recalculateSubsequentBalances($user, \Carbon\Carbon::parse($validated['date']));

        return redirect()
            ->route('daily-consumptions.create', ['month' => $consumptionDate->month, 'year' => $consumptionDate->year])
            ->with('success', 'Daily consumption record created successfully!');
    }

    /**
     * Edit form
     */
    public function edit(DailyConsumption $dailyConsumption): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($dailyConsumption->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $sections = $user->getRequiredSections();
        $enrollment = $user->getEnrollmentData();

        $availableStock = $this->calculationService->getAvailableStockAtDate(
            $user, 
            $dailyConsumption->date->format('Y-m-d'), 
            false
        );

        $previousConsumption = DailyConsumption::where('user_id', $user->id)
            ->where('date', '<', $dailyConsumption->date)
            ->orderBy('date', 'desc')
            ->first();

        $previousDate = $previousConsumption ? $previousConsumption->date->format('Y-m-d') : null;

        // Fetch MonthlyAmountConfiguration for detailed rates
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
            ->where('month', $dailyConsumption->date->month)
            ->where('year', $dailyConsumption->date->year)
            ->first();
            
        if (!$amountConfig) {
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)->latest()->first();
        }
            
        $amountRates = $this->getAmountRatesArray($amountConfig);

        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($dailyConsumption->date->month, $dailyConsumption->date->year)
            ->first();

        return Inertia::render('DailyConsumption/Create', [
            'sections' => $sections,
            'enrollment' => $enrollment,
            'availableStock' => $availableStock,
            'previousDate' => $previousDate,
            'consumption' => [
                'id' => $dailyConsumption->id,
                'date' => $dailyConsumption->date->format('Y-m-d'),
                'served_primary' => $dailyConsumption->served_primary,
                'served_middle' => $dailyConsumption->served_middle,
                'remarks' => $dailyConsumption->remarks,
            ],
            'amountRates' => $amountRates,
            'schoolType' => $user->school_type,
            'riceRates' => [
                'primary' => $riceConfig ? $riceConfig->daily_consumption_primary / 1000 : 0.1,
                'middle' => $riceConfig ? $riceConfig->daily_consumption_upper_primary / 1000 : 0.15,
            ],
            'currentMonth' => $dailyConsumption->date->month,
            'currentYear' => $dailyConsumption->date->year,
        ]);
    }

    /**
     * ✅ UPDATED: Update - Removed insufficient stock validation
     * and moved validation rules into DailyConsumptionRequest
     */
    public function update(DailyConsumptionRequest $request, DailyConsumption $dailyConsumption): RedirectResponse
    {
        $user = Auth::user();

        if ($dailyConsumption->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $sections = $user->getRequiredSections();
        $validated = $request->validated();

        $existingRecord = DailyConsumption::where('user_id', $user->id)
            ->where('date', $validated['date'])
            ->where('id', '!=', $dailyConsumption->id)
            ->exists();

        if ($existingRecord) {
            throw ValidationException::withMessages([
                'date' => 'A consumption record for this date already exists.'
            ]);
        }

        $servedPrimary = $validated['served_primary'] ?? 0;
        $servedMiddle = $validated['served_middle'] ?? 0;
        $consumptionDate = Carbon::parse($validated['date']);

        $riceCalc = $this->calculateRiceConsumptionWithConfig($user, $servedPrimary, $servedMiddle, $consumptionDate);

        $availableStockBefore = $this->calculationService->getAvailableStockAtDate(
            $user, 
            $dailyConsumption->date->format('Y-m-d'), 
            false
        );

        // Fetch MonthlyAmountConfiguration for detailed calculation
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)
            ->where('month', $consumptionDate->month)
            ->where('year', $consumptionDate->year)
            ->first();
            
        if (!$amountConfig) {
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $user->id)->latest()->first();
        }
            
        $amountBreakdown = $amountConfig 
            ? $this->calculationService->calculateAmountConsumption($servedPrimary, $servedMiddle, $amountConfig)
            : null;

        // ✅ UPDATED: Allow negative balance
        $riceBalanceAfter = $availableStockBefore - $riceCalc['total'];

        $dailyConsumption->update([
            'date' => $validated['date'],
            'day' => \Carbon\Carbon::parse($validated['date'])->format('l'),
            'served_primary' => $servedPrimary,
            'served_middle' => $servedMiddle,
            'rice_consumed' => $riceCalc['total'],
            'rice_balance_after' => $riceBalanceAfter, // Can be negative
            'amount_consumed' => $amountBreakdown ? $amountBreakdown['grandTotal'] : 0,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        // ✅ Sync consumed amounts to rice configuration
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($consumptionDate->month, $consumptionDate->year)
            ->first();
        if ($riceConfig) {
            $riceConfig->syncConsumedFromDaily();
            $riceConfig->save();
        }
        $this->recalculateSubsequentBalances($user, $dailyConsumption->date);

        return redirect()
            ->route('daily-consumptions.list', ['month' => $consumptionDate->month, 'year' => $consumptionDate->year])
            ->with('success', 'Daily consumption record updated successfully.');
    }

    /**
     * Remove a consumption record
     */
    public function destroy(DailyConsumption $dailyConsumption): RedirectResponse
    {
        $user = Auth::user();

        if ($dailyConsumption->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $deletedDate = $dailyConsumption->date;

        $dailyConsumption->delete();

        // ✅ Sync consumed amounts to rice configuration
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($deletedDate->month, $deletedDate->year)
            ->first();
        if ($riceConfig) {
            $riceConfig->syncConsumedFromDaily();
            $riceConfig->save();
        }
        $this->recalculateSubsequentBalances($user, $deletedDate);

        return redirect()
            ->route('daily-consumptions.list', ['month' => $deletedDate->month, 'year' => $deletedDate->year])
            ->with('success', 'Daily consumption record deleted successfully.');
    }



    /**
     * ✅ UPDATED: Recalculate balances - Allow negative values
     */
    protected function recalculateSubsequentBalances($user, $fromDate): void
    {
        $subsequentRecords = DailyConsumption::where('user_id', $user->id)
            ->where('date', '>=', $fromDate)
            ->orderBy('date', 'asc')
            ->get();

        foreach ($subsequentRecords as $record) {
            $availableStockBefore = $this->calculationService->getAvailableStockAtDate(
                $user, 
                $record->date->format('Y-m-d'), 
                false
            );

            $riceCalc = $this->calculateRiceConsumptionWithConfig(
                $user,
                $record->served_primary ?? 0,
                $record->served_middle ?? 0
            );

            // ✅ UPDATED: Removed max(0, ...) - Allow negative balances
            $record->update([
                'rice_balance_after' => round($availableStockBefore - $riceCalc['total'], 2)
            ]);
        }
    }

    /**
     * Calculate rice consumption using configured rates
     */
    protected function calculateRiceConsumptionWithConfig($user, int $servedPrimary, int $servedMiddle, ?Carbon $date = null): array
    {
        if (!$date) {
            $date = now();
        }

        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($date->month, $date->year)
            ->first();

        if (!$riceConfig) {
            return $this->calculationService->calculateRiceConsumption($servedPrimary, $servedMiddle);
        }

        $primaryRate = $riceConfig->daily_consumption_primary / 1000;
        $middleRate = $riceConfig->daily_consumption_upper_primary / 1000;

        $primaryRice = round($servedPrimary * $primaryRate, 2);
        $middleRice = round($servedMiddle * $middleRate, 2);
        $total = round($primaryRice + $middleRice, 2);

        return [
            'primary' => $primaryRice,
            'middle' => $middleRice,
            'total' => $total,
        ];
    }

    /**
     * Get amount rates array from configuration
     */
    protected function getAmountRatesArray(?MonthlyAmountConfiguration $amountConfig): ?array
    {
        if (!$amountConfig) {
            return null;
        }

        // Calculate salt sub-rates based on percentages
        $saltPrimary = $amountConfig->daily_salt_primary ?? 0;
        $saltMiddle = $amountConfig->daily_salt_middle ?? 0;

        // Helper to safely get percentage
        $getPercent = fn($key) => ($amountConfig->{$key} ?? 0) / 100;

        return [
            'primary' => [
                'pulses' => $amountConfig->daily_pulses_primary,
                'vegetables' => $amountConfig->daily_vegetables_primary,
                'oil' => $amountConfig->daily_oil_primary,
                'salt' => $saltPrimary,
                'fuel' => $amountConfig->daily_fuel_primary,
                'total' => $amountConfig->daily_amount_per_student_primary,
                // Salt breakdown
                'salt_breakdown' => [
                    'common' => round($saltPrimary * $getPercent('salt_percentage_common'), 3),
                    'chilli' => round($saltPrimary * $getPercent('salt_percentage_chilli'), 3),
                    'turmeric' => round($saltPrimary * $getPercent('salt_percentage_turmeric'), 3),
                    'coriander' => round($saltPrimary * $getPercent('salt_percentage_coriander'), 3),
                    'other' => round($saltPrimary * $getPercent('salt_percentage_other'), 3),
                ]
            ],
            'middle' => [
                'pulses' => $amountConfig->daily_pulses_middle,
                'vegetables' => $amountConfig->daily_vegetables_middle,
                'oil' => $amountConfig->daily_oil_middle,
                'salt' => $saltMiddle,
                'fuel' => $amountConfig->daily_fuel_middle,
                'total' => $amountConfig->daily_amount_per_student_upper_primary,
                // Salt breakdown
                'salt_breakdown' => [
                    'common' => round($saltMiddle * $getPercent('salt_percentage_common'), 3),
                    'chilli' => round($saltMiddle * $getPercent('salt_percentage_chilli'), 3),
                    'turmeric' => round($saltMiddle * $getPercent('salt_percentage_turmeric'), 3),
                    'coriander' => round($saltMiddle * $getPercent('salt_percentage_coriander'), 3),
                    'other' => round($saltMiddle * $getPercent('salt_percentage_other'), 3),
                ]
            ]
        ];
    }
}