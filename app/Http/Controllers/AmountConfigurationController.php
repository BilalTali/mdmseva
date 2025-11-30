<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAmountConfigurationRequest;
use App\Http\Requests\UpdateAmountConfigurationRequest;
use App\Models\MonthlyAmountConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AmountConfigurationController extends Controller
{
    /**
     * Display the configuration for a specific month/year.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;
        
        // Default to current month/year if not provided
        $month = (int) ($request->month ?? now()->month);
        $year = (int) ($request->year ?? now()->year);

        // Get or create configuration for this specific period
        // This will auto-create from previous month if it exists
        $configuration = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);

        $configData = [
            'id' => $configuration->id,
            'year' => $configuration->year,
            'month' => $configuration->month,
            'month_name' => $configuration->month_name,
            'formatted_period' => $configuration->period,
            'created_at' => $configuration->created_at->format('M d, Y'),
            'updated_at' => $configuration->updated_at->format('M d, Y h:i A'),
        ];

        // Include primary section data if user has primary students
        if ($user->hasPrimaryStudents()) {
            $configData['total_daily_primary'] = (float)$configuration->daily_amount_per_student_primary;
            $configData['daily_pulses_primary'] = (float)$configuration->daily_pulses_primary;
            $configData['daily_vegetables_primary'] = (float)$configuration->daily_vegetables_primary;
            $configData['daily_oil_primary'] = (float)$configuration->daily_oil_primary;
            $configData['daily_salt_primary'] = (float)$configuration->daily_salt_primary;
            $configData['daily_fuel_primary'] = (float)$configuration->daily_fuel_primary;
        }

        // Include middle section data if user has middle students
        if ($user->hasMiddleStudents()) {
            $configData['total_daily_middle'] = (float)$configuration->daily_amount_per_student_upper_primary;
            $configData['daily_pulses_middle'] = (float)$configuration->daily_pulses_middle;
            $configData['daily_vegetables_middle'] = (float)$configuration->daily_vegetables_middle;
            $configData['daily_oil_middle'] = (float)$configuration->daily_oil_middle;
            $configData['daily_salt_middle'] = (float)$configuration->daily_salt_middle;
            $configData['daily_fuel_middle'] = (float)$configuration->daily_fuel_middle;
        }

        // Include unified salt percentages
        // If not set, use defaults
        $configData['salt_percentage_common'] = (float)($configuration->salt_percentage_common ?? 30);
        $configData['salt_percentage_chilli'] = (float)($configuration->salt_percentage_chilli ?? 20);
        $configData['salt_percentage_turmeric'] = (float)($configuration->salt_percentage_turmeric ?? 20);
        $configData['salt_percentage_coriander'] = (float)($configuration->salt_percentage_coriander ?? 15);
        $configData['salt_percentage_other'] = (float)($configuration->salt_percentage_other ?? 15);

        return Inertia::render('AmountConfiguration/Index', [
            'configuration' => $configData,
            'currentMonth' => $month,
            'currentYear' => $year,
            'isCompleted' => $configuration->is_completed,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Show the form for creating or editing a configuration.
     */
    public function form(Request $request, ?int $id = null)
    {
        $user = Auth::user();
        $userId = $user->id;

        if ($id) {
            $config = MonthlyAmountConfiguration::forUser($userId)->findOrFail($id);
        } else {
            $month = (int) ($request->query('month') ?? now()->month);
            $year = (int) ($request->query('year') ?? now()->year);
            $config = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);
        }

        // Check if locked
        if ($config->is_locked || $config->is_completed) {
            // If completed, maybe allow edit but show warning? Or redirect to index?
            // For now, let's allow editing if just completed, but if locked, no.
            if ($config->is_locked) {
                return redirect()->route('amount-config.index', ['month' => $config->month, 'year' => $config->year])
                    ->with('error', 'Configuration is locked and cannot be edited.');
            }
        }

        $configData = [
            'id' => $config->id,
            'year' => $config->year,
            'month' => $config->month,
        ];

        if ($user->hasPrimaryStudents()) {
            $configData['daily_pulses_primary'] = (float)$config->daily_pulses_primary;
            $configData['daily_vegetables_primary'] = (float)$config->daily_vegetables_primary;
            $configData['daily_oil_primary'] = (float)$config->daily_oil_primary;
            $configData['daily_salt_primary'] = (float)$config->daily_salt_primary;
            $configData['daily_fuel_primary'] = (float)$config->daily_fuel_primary;
        }

        if ($user->hasMiddleStudents()) {
            $configData['daily_pulses_middle'] = (float)$config->daily_pulses_middle;
            $configData['daily_vegetables_middle'] = (float)$config->daily_vegetables_middle;
            $configData['daily_oil_middle'] = (float)$config->daily_oil_middle;
            $configData['daily_salt_middle'] = (float)$config->daily_salt_middle;
            $configData['daily_fuel_middle'] = (float)$config->daily_fuel_middle;
        }

        $configData['salt_percentage_common'] = (float)($config->salt_percentage_common ?? 30);
        $configData['salt_percentage_chilli'] = (float)($config->salt_percentage_chilli ?? 20);
        $configData['salt_percentage_turmeric'] = (float)($config->salt_percentage_turmeric ?? 20);
        $configData['salt_percentage_coriander'] = (float)($config->salt_percentage_coriander ?? 15);
        $configData['salt_percentage_other'] = (float)($config->salt_percentage_other ?? 15);

        return Inertia::render('AmountConfiguration/Form', [
            'config' => $configData,
            'currentMonth' => $config->month,
            'currentYear' => $config->year,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Store a new configuration (or update existing monthly config).
     */
    public function store(StoreAmountConfigurationRequest $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            DB::beginTransaction();

            $validated = $request->validated();
            
            $month = $validated['month'] ?? now()->month;
            $year = $validated['year'] ?? now()->year;

            $config = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);

            // Update fields
            $config->fill($validated);
            $config->calculateTotals(); // Calculate daily totals
            
            // Sync totals to monthly config fields
            $config->daily_amount_per_student_primary = $config->daily_amount_per_student_primary;
            $config->daily_amount_per_student_upper_primary = $config->daily_amount_per_student_upper_primary;
            
            $config->is_completed = true;
            $config->completed_at = now();
            $config->completed_by = $userId;
            $config->save();

            DB::commit();

            Log::info('Amount configuration updated/created', [
                'user_id' => $userId,
                'period' => "$month-$year",
            ]);

            return redirect()->route('amount-config.index', ['month' => $month, 'year' => $year])
                ->with('success', 'Configuration saved and confirmed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save configuration', ['error' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Failed to save configuration.');
        }
    }

    /**
     * Update a configuration.
     */
    public function update(UpdateAmountConfigurationRequest $request, $id)
    {
        $user = Auth::user();
        $userId = $user->id;
        $config = MonthlyAmountConfiguration::forUser($userId)->findOrFail($id);

        try {
            DB::beginTransaction();

            $validated = $request->validated();

            $config->fill($validated);
            $config->calculateTotals();
            
            $config->is_completed = true;
            $config->completed_at = now();
            $config->completed_by = $userId;
            $config->save();

            DB::commit();

            Log::info('Amount configuration updated', [
                'user_id' => $userId,
                'period' => "{$config->month}-{$config->year}",
            ]);

            return redirect()->route('amount-config.index', ['month' => $config->month, 'year' => $config->year])
                ->with('success', 'Configuration updated and confirmed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update configuration', ['error' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Failed to update configuration.');
        }
    }

    /**
     * Delete a configuration (reset it).
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        $config = MonthlyAmountConfiguration::forUser($userId)->findOrFail($id);

        try {
            DB::beginTransaction();

            // We don't actually delete the record because it might have opening balances etc.
            // Instead, we reset the rates and completion status.
            $config->daily_pulses_primary = null;
            $config->daily_vegetables_primary = null;
            $config->daily_oil_primary = null;
            $config->daily_salt_primary = null;
            $config->daily_fuel_primary = null;
            $config->daily_pulses_middle = null;
            $config->daily_vegetables_middle = null;
            $config->daily_oil_middle = null;
            $config->daily_salt_middle = null;
            $config->daily_fuel_middle = null;
            
            $config->daily_amount_per_student_primary = 0;
            $config->daily_amount_per_student_upper_primary = 0;
            
            $config->is_completed = false;
            $config->completed_at = null;
            $config->completed_by = null;
            
            $config->save();

            DB::commit();

            return redirect()->route('amount-config.index', ['month' => $config->month, 'year' => $config->year])
                ->with('success', 'Configuration reset successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reset configuration.');
        }
    }

    /**
     * Confirm monthly amount configuration and redirect to daily consumption.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $user = Auth::user();
        $userId = $user->id;
        $month = (int) $validated['month'];
        $year = (int) $validated['year'];

        $config = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);

        try {
            $config->is_completed = true;
            $config->completed_at = now();
            $config->completed_by = $userId;
            $config->save();

            return redirect()->route('daily-consumptions.list', ['month' => $month, 'year' => $year])
                ->with('success', 'Amount configuration confirmed. You can now proceed to daily consumption entries.');
        } catch (\Exception $e) {
            Log::error('Failed to confirm amount configuration', [
                'user_id' => $userId,
                'month' => $month,
                'year' => $year,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to confirm amount configuration. Please try again.');
        }
    }
}