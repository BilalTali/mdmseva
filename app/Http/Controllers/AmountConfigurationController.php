<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAmountConfigurationRequest;
use App\Http\Requests\UpdateAmountConfigurationRequest;
use App\Models\AmountConfiguration;
use App\Models\MonthlyAmountConfiguration;
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

        // Get configuration for this specific period
        $configuration = AmountConfiguration::forUser($userId)
            ->forPeriod($year, $month)
            ->first();

        // If not found, try to auto-create from previous month
        if (!$configuration) {
            $prevConfig = AmountConfiguration::forUser($userId)
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->first();

            if ($prevConfig) {
                // Replicate previous config for this month
                $configuration = $prevConfig->replicate();
                $configuration->month = $month;
                $configuration->year = $year;
                $configuration->save();
                
                // Note: We do NOT mark it as completed yet. User must confirm.
            }
        }

        // Ensure MonthlyAmountConfiguration exists (for status tracking)
        // This tracks if the user has explicitly "Updated/Confirmed" the config for this month
        $monthlyConfig = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);

        $configData = null;
        if ($configuration) {
            $configData = [
                'id' => $configuration->id,
                'year' => $configuration->year,
                'month' => $configuration->month,
                'month_name' => $configuration->month_name,
                'formatted_period' => $configuration->formatted_period,
                'created_at' => $configuration->created_at->format('M d, Y'),
                'updated_at' => $configuration->updated_at->format('M d, Y h:i A'),
            ];

            // Include primary section data if user has primary students
            if ($user->hasPrimaryStudents()) {
                $configData['total_daily_primary'] = (float)$configuration->total_daily_primary;
                $configData['daily_pulses_primary'] = (float)$configuration->daily_pulses_primary;
                $configData['daily_vegetables_primary'] = (float)$configuration->daily_vegetables_primary;
                $configData['daily_oil_primary'] = (float)$configuration->daily_oil_primary;
                $configData['daily_salt_primary'] = (float)$configuration->daily_salt_primary;
                $configData['daily_fuel_primary'] = (float)$configuration->daily_fuel_primary;
            }

            // Include middle section data if user has middle students
            if ($user->hasMiddleStudents()) {
                $configData['total_daily_middle'] = (float)$configuration->total_daily_middle;
                $configData['daily_pulses_middle'] = (float)$configuration->daily_pulses_middle;
                $configData['daily_vegetables_middle'] = (float)$configuration->daily_vegetables_middle;
                $configData['daily_oil_middle'] = (float)$configuration->daily_oil_middle;
                $configData['daily_salt_middle'] = (float)$configuration->daily_salt_middle;
                $configData['daily_fuel_middle'] = (float)$configuration->daily_fuel_middle;
            }

            // Include unified salt percentages
            $configData['salt_percentage_common'] = (float)$configuration->salt_percentage_common;
            $configData['salt_percentage_chilli'] = (float)$configuration->salt_percentage_chilli;
            $configData['salt_percentage_turmeric'] = (float)$configuration->salt_percentage_turmeric;
            $configData['salt_percentage_coriander'] = (float)$configuration->salt_percentage_coriander;
            $configData['salt_percentage_other'] = (float)$configuration->salt_percentage_other;
        }

        return Inertia::render('AmountConfiguration/Index', [
            'configuration' => $configData,
            'currentMonth' => $month,
            'currentYear' => $year,
            'isCompleted' => $monthlyConfig->is_completed,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Show the form for creating or editing a configuration.
     */
    public function form(Request $request, ?AmountConfiguration $config = null)
    {
        $user = Auth::user();
        $userId = $user->id;

        // If creating new (no config passed), use request params or defaults
        if (!$config) {
            $month = (int) ($request->query('month') ?? now()->month);
            $year = (int) ($request->query('year') ?? now()->year);
            
            // Check if already exists
            $existingConfig = AmountConfiguration::forUser($userId)
                ->forPeriod($year, $month)
                ->first();
                
            if ($existingConfig) {
                return redirect()->route('amount-config.edit', $existingConfig->id);
            }
        } else {
            // Editing existing
            if ($config->user_id !== $userId) {
                abort(403, 'Unauthorized');
            }
            $month = $config->month;
            $year = $config->year;
        }

        $configData = null;
        if ($config) {
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

            $configData['salt_percentage_common'] = (float)$config->salt_percentage_common;
            $configData['salt_percentage_chilli'] = (float)$config->salt_percentage_chilli;
            $configData['salt_percentage_turmeric'] = (float)$config->salt_percentage_turmeric;
            $configData['salt_percentage_coriander'] = (float)$config->salt_percentage_coriander;
            $configData['salt_percentage_other'] = (float)$config->salt_percentage_other;
        }

        return Inertia::render('AmountConfiguration/Form', [
            'config' => $configData,
            'currentMonth' => $month,
            'currentYear' => $year,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Store a new configuration.
     */
    public function store(StoreAmountConfigurationRequest $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            DB::beginTransaction();

            $validated = $request->validated();
            
            // Ensure month/year are set
            $month = $validated['month'] ?? now()->month;
            $year = $validated['year'] ?? now()->year;

            // Check if user already has a configuration for this period
            $exists = AmountConfiguration::forUser($userId)
                ->forPeriod($year, $month)
                ->first();

            if ($exists) {
                DB::rollBack();
                return redirect()->route('amount-config.index', ['month' => $month, 'year' => $year])
                    ->with('error', 'Configuration for this month already exists. Please edit the existing one.');
            }

            // Validate unified salt percentages sum to 100%
            $saltTotal = 
                ($validated['salt_percentage_common'] ?? 0) +
                ($validated['salt_percentage_chilli'] ?? 0) +
                ($validated['salt_percentage_turmeric'] ?? 0) +
                ($validated['salt_percentage_coriander'] ?? 0) +
                ($validated['salt_percentage_other'] ?? 0);
            
            if (abs($saltTotal - 100) > 0.01) {
                DB::rollBack();
                return back()->withErrors([
                    'salt_percentage_common' => 'Salt percentages must sum to exactly 100%. Current total: ' . number_format($saltTotal, 2) . '%',
                ])->withInput();
            }

            $config = new AmountConfiguration($validated);
            $config->user_id = $userId;
            $config->calculateTotals();
            $config->save();
            
            // Sync with MonthlyAmountConfiguration and mark as completed
            $monthlyConfig = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $month, $year);
            $monthlyConfig->daily_amount_per_student_primary = $config->total_daily_primary;
            $monthlyConfig->daily_amount_per_student_upper_primary = $config->total_daily_middle;
            $monthlyConfig->is_completed = true;
            $monthlyConfig->completed_at = now();
            $monthlyConfig->completed_by = $userId;
            $monthlyConfig->save();

            DB::commit();

            Log::info('Amount configuration created', [
                'user_id' => $userId,
                'period' => "$month-$year",
            ]);

            return redirect()->route('amount-config.index', ['month' => $month, 'year' => $year])
                ->with('success', 'Configuration created and confirmed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create configuration', ['error' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Failed to create configuration.');
        }
    }

    /**
     * Update a configuration.
     */
    public function update(UpdateAmountConfigurationRequest $request, $id)
    {
        $user = Auth::user();
        $userId = $user->id;
        $config = AmountConfiguration::forUser($userId)->findOrFail($id);

        try {
            DB::beginTransaction();

            $validated = $request->validated();

            // Validate unified salt percentages sum to 100%
            $saltTotal = 
                ($validated['salt_percentage_common'] ?? 0) +
                ($validated['salt_percentage_chilli'] ?? 0) +
                ($validated['salt_percentage_turmeric'] ?? 0) +
                ($validated['salt_percentage_coriander'] ?? 0) +
                ($validated['salt_percentage_other'] ?? 0);
            
            if (abs($saltTotal - 100) > 0.01) {
                DB::rollBack();
                return back()->withErrors([
                    'salt_percentage_common' => 'Salt percentages must sum to exactly 100%. Current total: ' . number_format($saltTotal, 2) . '%',
                ])->withInput();
            }

            $config->fill($validated);
            $config->calculateTotals();
            $config->save();
            
            // Sync with MonthlyAmountConfiguration and mark as completed
            $monthlyConfig = MonthlyAmountConfiguration::getOrCreateForPeriod($userId, $config->month, $config->year);
            $monthlyConfig->daily_amount_per_student_primary = $config->total_daily_primary;
            $monthlyConfig->daily_amount_per_student_upper_primary = $config->total_daily_middle;
            $monthlyConfig->is_completed = true;
            $monthlyConfig->completed_at = now();
            $monthlyConfig->completed_by = $userId;
            $monthlyConfig->save();

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
     * Delete a configuration.
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        $config = AmountConfiguration::forUser($userId)->findOrFail($id);

        try {
            DB::beginTransaction();

            $month = $config->month;
            $year = $config->year;
            $config->delete();
            
            // Also reset MonthlyAmountConfiguration status?
            // Maybe set is_completed = false?
            $monthlyConfig = MonthlyAmountConfiguration::forUser($userId)
                ->forPeriod($month, $year)
                ->first();
            
            if ($monthlyConfig) {
                $monthlyConfig->is_completed = false;
                $monthlyConfig->save();
            }

            DB::commit();

            return redirect()->route('amount-config.index', ['month' => $month, 'year' => $year])
                ->with('success', 'Configuration deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete configuration.');
        }
    }
}