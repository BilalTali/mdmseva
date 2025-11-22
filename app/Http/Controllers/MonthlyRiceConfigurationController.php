<?php

namespace App\Http\Controllers;

use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Models\RiceInventoryActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MonthlyRiceConfigurationController extends Controller
{
    /**
     * Display rice configuration dashboard
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $now = now();
        
        // Get requested month/year or use current
        $month = (int) ($request->month ?? $now->month);
        $year = (int) ($request->year ?? $now->year);

        // Get configuration for specified period
        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->with(['previousMonth', 'completedBy'])
            ->first();

        // Get recent activities
        $activities = RiceInventoryActivity::where('user_id', $user->id)
            ->where('month', $month)
            ->where('year', $year)
            ->with('creator')
            ->latest()
            ->limit(10)
            ->get();

        // Get completed months for navigation
        $completedMonths = MonthlyRiceConfiguration::forUser($user->id)
            ->completed()
            ->select('month', 'year')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Check amount configuration status
        $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();

        return Inertia::render('MonthlyRiceConfiguration/Index', [
            'config' => $config,
            'currentMonth' => $month,
            'currentYear' => $year,
            'activities' => $activities,
            'completedMonths' => $completedMonths,
            'amountConfig' => $amountConfig,
            'canEnterConsumption' => $config?->is_completed && $amountConfig?->is_completed && !$config?->is_locked,
            'schoolTypes' => [
                'primary' => 'Primary',
                'middle' => 'Middle',
                'secondary' => 'Secondary',
                'senior_secondary' => 'Senior Secondary'
            ]
        ]);
    }

    /**
     * Show create form for new month
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        $now = now();
        
        $month = (int) ($request->month ?? $now->month);
        $year = (int) ($request->year ?? $now->year);

        // Check if config already exists
        $existing = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->first();

        if ($existing) {
            return redirect()->route('monthly-rice-config.index', [
                'month' => $month,
                'year' => $year
            ])->with('info', 'Configuration already exists for this month.');
        }

        // Get previous month for carryforward suggestion
        $prevMonth = $month == 1 ? 12 : $month - 1;
        $prevYear = $month == 1 ? $year - 1 : $year;
        
        $previousConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($prevMonth, $prevYear)
            ->completed()
            ->first();

        return Inertia::render('MonthlyRiceConfiguration/Create', [
            'month' => $month,
            'year' => $year,
            'previousConfig' => $previousConfig,
            'suggestedOpening' => [
                'primary' => $previousConfig?->closing_balance_primary ?? 0,
                'upper_primary' => $previousConfig?->closing_balance_upper_primary ?? 0
            ],
            'schoolTypes' => [
                'primary' => 'Primary',
                'middle' => 'Middle',
                'secondary' => 'Secondary',
                'senior_secondary' => 'Senior Secondary'
            ]
        ]);
    }

    /**
     * Store new monthly rice configuration
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'school_type' => 'required|in:primary,middle,secondary,senior_secondary',
            'daily_consumption_primary' => 'required|integer|min:0|max:500',
            'daily_consumption_upper_primary' => 'required|integer|min:0|max:500',
            'opening_balance_primary' => 'required|numeric|min:-10000|max:100000',
            'opening_balance_upper_primary' => 'required|numeric|min:-10000|max:100000',
            'rice_lifted_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_lifted_upper_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_upper_primary' => 'nullable|numeric|min:0|max:100000',
        ]);

        $user = Auth::user();

        // Check for duplicate
        $existing = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->first();

        if ($existing) {
            return back()->withErrors(['month' => 'Configuration already exists for this month.']);
        }

        DB::beginTransaction();
        try {
            $config = MonthlyRiceConfiguration::create([
                'user_id' => $user->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
                'school_type' => $validated['school_type'],
                'daily_consumption_primary' => $validated['daily_consumption_primary'],
                'daily_consumption_upper_primary' => $validated['daily_consumption_upper_primary'],
                'opening_balance_primary' => $validated['opening_balance_primary'],
                'opening_balance_upper_primary' => $validated['opening_balance_upper_primary'],
                'rice_lifted_primary' => $validated['rice_lifted_primary'] ?? 0,
                'rice_lifted_upper_primary' => $validated['rice_lifted_upper_primary'] ?? 0,
                'rice_arranged_primary' => $validated['rice_arranged_primary'] ?? 0,
                'rice_arranged_upper_primary' => $validated['rice_arranged_upper_primary'] ?? 0,
            ]);

            $config->recomputeTotals();
            $config->save();

            // Log activity
            RiceInventoryActivity::create([
                'user_id' => $user->id,
                'config_id' => $config->id,
                'month' => $config->month,
                'year' => $config->year,
                'action' => RiceInventoryActivity::ACTION_OPENED,
                'amount_primary' => $config->opening_balance_primary,
                'amount_upper_primary' => $config->opening_balance_upper_primary,
                'notes' => 'Monthly rice configuration created',
                'created_by' => $user->id
            ]);

            DB::commit();

            return redirect()->route('monthly-rice-config.index', [
                'month' => $config->month,
                'year' => $config->year
            ])->with('success', 'Rice configuration created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create monthly rice configuration', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['error' => 'Failed to create configuration.']);
        }
    }

    /**
     * Show edit form
     */
    public function edit(Request $request): Response
    {
        $user = Auth::user();
        $month = (int) ($request->month ?? now()->month);
        $year = (int) ($request->year ?? now()->year);

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($month, $year)
            ->firstOrFail();

        if (!$config->canBeEdited()) {
            return redirect()->route('monthly-rice-config.index', [
                'month' => $month,
                'year' => $year
            ])->with('error', 'This configuration is locked and cannot be edited.');
        }

        return Inertia::render('MonthlyRiceConfiguration/Edit', [
            'config' => $config,
            'schoolTypes' => [
                'primary' => 'Primary',
                'middle' => 'Middle',
                'secondary' => 'Secondary',
                'senior_secondary' => 'Senior Secondary'
            ]
        ]);
    }

    /**
     * Update configuration
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'school_type' => 'required|in:primary,middle,secondary,senior_secondary',
            'daily_consumption_primary' => 'required|integer|min:0|max:500',
            'daily_consumption_upper_primary' => 'required|integer|min:0|max:500',
            'opening_balance_primary' => 'required|numeric|min:-10000|max:100000',
            'opening_balance_upper_primary' => 'required|numeric|min:-10000|max:100000',
            'rice_lifted_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_lifted_upper_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_upper_primary' => 'nullable|numeric|min:0|max:100000',
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->firstOrFail();

        if (!$config->canBeEdited()) {
            return back()->withErrors(['error' => 'Configuration is locked.']);
        }

        DB::beginTransaction();
        try {
            $config->update([
                'school_type' => $validated['school_type'],
                'daily_consumption_primary' => $validated['daily_consumption_primary'],
                'daily_consumption_upper_primary' => $validated['daily_consumption_upper_primary'],
                'opening_balance_primary' => $validated['opening_balance_primary'],
                'opening_balance_upper_primary' => $validated['opening_balance_upper_primary'],
                'rice_lifted_primary' => $validated['rice_lifted_primary'] ?? 0,
                'rice_lifted_upper_primary' => $validated['rice_lifted_upper_primary'] ?? 0,
                'rice_arranged_primary' => $validated['rice_arranged_primary'] ?? 0,
                'rice_arranged_upper_primary' => $validated['rice_arranged_upper_primary'] ?? 0,
            ]);

            $config->recomputeTotals();
            $config->save();

            // Log activity
            RiceInventoryActivity::create([
                'user_id' => $user->id,
                'config_id' => $config->id,
                'month' => $config->month,
                'year' => $config->year,
                'action' => RiceInventoryActivity::ACTION_EDITED,
                'amount_primary' => 0,
                'amount_upper_primary' => 0,
                'notes' => 'Configuration updated',
                'created_by' => $user->id
            ]);

            DB::commit();

            return redirect()->route('monthly-rice-config.index', [
                'month' => $config->month,
                'year' => $config->year
            ])->with('success', 'Configuration updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update configuration.']);
        }
    }

    /**
     * Add rice lifted (government supply)
     */
    public function addRiceLifted(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_primary' => 'required|numeric|min:0|max:100000',
            'amount_upper_primary' => 'required|numeric|min:0|max:100000',
            'notes' => 'nullable|string|max:1000'
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->lockForUpdate()
            ->firstOrFail();

        if (!$config->canBeEdited()) {
            return back()->withErrors(['error' => 'Configuration is locked.']);
        }

        DB::beginTransaction();
        try {
            $config->rice_lifted_primary += $validated['amount_primary'];
            $config->rice_lifted_upper_primary += $validated['amount_upper_primary'];
            $config->recomputeTotals();
            $config->save();

            // Log activity
            RiceInventoryActivity::create([
                'user_id' => $user->id,
                'config_id' => $config->id,
                'month' => $config->month,
                'year' => $config->year,
                'action' => RiceInventoryActivity::ACTION_LIFTED,
                'amount_primary' => $validated['amount_primary'],
                'amount_upper_primary' => $validated['amount_upper_primary'],
                'notes' => $validated['notes'] ?? 'Rice lifted from government',
                'created_by' => $user->id
            ]);

            DB::commit();

            return back()->with('success', 'Rice lifted added successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to add rice lifted.']);
        }
    }

    /**
     * Add rice arranged (alternative sources)
     */
    public function addRiceArranged(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_primary' => 'required|numeric|min:0|max:100000',
            'amount_upper_primary' => 'required|numeric|min:0|max:100000',
            'notes' => 'nullable|string|max:1000'
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->lockForUpdate()
            ->firstOrFail();

        if (!$config->canBeEdited()) {
            return back()->withErrors(['error' => 'Configuration is locked.']);
        }

        DB::beginTransaction();
        try {
            $config->rice_arranged_primary += $validated['amount_primary'];
            $config->rice_arranged_upper_primary += $validated['amount_upper_primary'];
            $config->recomputeTotals();
            $config->save();

            // Log activity
            RiceInventoryActivity::create([
                'user_id' => $user->id,
                'config_id' => $config->id,
                'month' => $config->month,
                'year' => $config->year,
                'action' => RiceInventoryActivity::ACTION_ARRANGED,
                'amount_primary' => $validated['amount_primary'],
                'amount_upper_primary' => $validated['amount_upper_primary'],
                'notes' => $validated['notes'] ?? 'Rice arranged from alternative sources',
                'created_by' => $user->id
            ]);

            DB::commit();

            return back()->with('success', 'Rice arranged added successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to add rice arranged.']);
        }
    }

    /**
     * Sync consumed amounts from daily consumption
     */
    public function syncConsumed(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->firstOrFail();

        $config->syncConsumedFromDaily();
        $config->save();

        return back()->with('success', 'Consumed amounts synced successfully!');
    }

    /**
     * Toggle lock status for a configuration
     */
    public function toggleLock(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'lock' => 'required|boolean',
            'reason' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->firstOrFail();

        $config->is_locked = (bool) $validated['lock'];
        $config->locked_reason = $config->is_locked ? ($validated['reason'] ?? null) : null;
        $config->save();

        return back()->with(
            'success',
            $config->is_locked
                ? 'Configuration locked. Editing has been disabled.'
                : 'Configuration unlocked. Editing is enabled.'
        );
    }

    /**
     * Complete current month
     */
    public function completeMonth(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string|max:2000'
        ]);

        $user = Auth::user();

        $config = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($validated['month'], $validated['year'])
            ->firstOrFail();

        if (!$config->canBeCompleted()) {
            return back()->withErrors(['error' => 'Month cannot be completed.']);
        }

        try {
            $config->completeMonth($user->id, $validated['notes'] ?? null);

            return redirect()->route('monthly-rice-config.create-next')
                ->with('success', 'Month completed successfully! Create next month configuration.');

        } catch (\Exception $e) {
            Log::error('Failed to complete month', [
                'user_id' => $user->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['error' => 'Failed to complete month.']);
        }
    }

    /**
     * Show create next month page
     */
    public function createNext(): Response
    {
        $user = Auth::user();

        // Get the most recent completed month
        $lastCompleted = MonthlyRiceConfiguration::forUser($user->id)
            ->completed()
            ->latestFirst()
            ->first();

        if (!$lastCompleted) {
            return redirect()->route('monthly-rice-config.create')
                ->with('info', 'Please create your first month configuration.');
        }

        // Calculate next month
        $nextMonth = $lastCompleted->month == 12 ? 1 : $lastCompleted->month + 1;
        $nextYear = $lastCompleted->month == 12 ? $lastCompleted->year + 1 : $lastCompleted->year;

        // Check if already exists
        $existing = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($nextMonth, $nextYear)
            ->first();

        if ($existing) {
            return redirect()->route('monthly-rice-config.index', [
                'month' => $nextMonth,
                'year' => $nextYear
            ])->with('info', 'Next month configuration already exists.');
        }

        return Inertia::render('MonthlyRiceConfiguration/CreateNext', [
            'lastCompleted' => $lastCompleted,
            'nextMonth' => $nextMonth,
            'nextYear' => $nextYear,
            'carriedBalance' => [
                'primary' => $lastCompleted->closing_balance_primary,
                'upper_primary' => $lastCompleted->closing_balance_upper_primary
            ]
        ]);
    }

    /**
     * Store next month configuration
     */
    public function storeNext(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'opening_balance_primary' => 'required|numeric|min:-10000|max:100000',
            'opening_balance_upper_primary' => 'required|numeric|min:-10000|max:100000',
            'rice_lifted_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_lifted_upper_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_primary' => 'nullable|numeric|min:0|max:100000',
            'rice_arranged_upper_primary' => 'nullable|numeric|min:0|max:100000',
        ]);

        $user = Auth::user();

        // Get previous month
        $prevMonth = $validated['month'] == 1 ? 12 : $validated['month'] - 1;
        $prevYear = $validated['month'] == 1 ? $validated['year'] - 1 : $validated['year'];

        $previousConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($prevMonth, $prevYear)
            ->completed()
            ->firstOrFail();

        try {
            $config = MonthlyRiceConfiguration::createNextMonth(
                $user->id,
                $previousConfig,
                [
                    'opening_balance_primary' => $validated['opening_balance_primary'],
                    'opening_balance_upper_primary' => $validated['opening_balance_upper_primary'],
                    'rice_lifted_primary' => $validated['rice_lifted_primary'] ?? 0,
                    'rice_lifted_upper_primary' => $validated['rice_lifted_upper_primary'] ?? 0,
                    'rice_arranged_primary' => $validated['rice_arranged_primary'] ?? 0,
                    'rice_arranged_upper_primary' => $validated['rice_arranged_upper_primary'] ?? 0,
                ]
            );

            return redirect()->route('monthly-rice-config.index', [
                'month' => $config->month,
                'year' => $config->year
            ])->with('success', 'Next month configuration created successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to create next month', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['error' => 'Failed to create next month.']);
        }
    }
}
