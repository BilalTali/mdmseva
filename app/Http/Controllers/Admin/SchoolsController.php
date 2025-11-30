<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\District;
use App\Models\Zone;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Models\DailyConsumption;
use App\Models\RiceReport;
use App\Models\AmountReport;
use App\Models\Bill;
use App\Models\RollStatement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as FacadeResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use App\Services\ConsumptionCalculationService;

class SchoolsController extends Controller
{
    /**
     * Display paginated list of all schools with filters.
     * 
     * GET /admin/schools
     */
    public function index(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'is_active' => 'nullable|in:all,active,inactive',
            'school_type' => 'nullable|in:primary,middle,secondary,all',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|in:name,district,zone,school_type,created_at',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        // Build query
        $query = User::schools()
            ->with(['district', 'zone', 'roles']);

        // Apply district filter
        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }

        // Apply zone filter
        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        // Apply status filter
        if ($request->filled('is_active') && $request->is_active !== 'all') {
            $isActive = $request->is_active === 'active';
            $query->where('is_active', $isActive);
        }

        // Apply school type filter
        if ($request->filled('school_type') && $request->school_type !== 'all') {
            $query->where('school_type', $request->school_type);
        }

        // Apply search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('udise_code', 'like', "%{$search}%")
                  ->orWhere('school_name', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->sort_by ?? 'name';
        $sortDirection = $request->sort_direction ?? 'asc';

        switch ($sortBy) {
            case 'district':
                $query->join('districts', 'users.district_id', '=', 'districts.id')
                      ->orderBy('districts.name', $sortDirection)
                      ->select('users.*');
                break;
            case 'zone':
                $query->join('zones', 'users.zone_id', '=', 'zones.id')
                      ->orderBy('zones.name', $sortDirection)
                      ->select('users.*');
                break;
            default:
                $query->orderBy($sortBy, $sortDirection);
                break;
        }

        // Add last activity subquery and eager load relationships
        $query->withCount([
            'dailyConsumptions as last_activity' => function($q) {
                $q->select(\DB::raw('MAX(date)'));
            }
        ])->with(['district', 'zone']); // Fix N+1 query by eager loading relationships

        // Paginate results
        $schools = $query->paginate(15)->withQueryString();

        // Get all districts and zones for filters
        $districts = District::with('zones')->orderBy('state')->orderBy('name')->get();
        $zones = [];
        
        if ($request->filled('district_id')) {
            $zones = Zone::where('district_id', $request->district_id)
                        ->orderBy('name')
                        ->get();
        }

        return Inertia::render('Admin/Schools/Index', [
            'schools' => $schools,
            'districts' => $districts,
            'zones' => $zones,
            'filters' => [
                'district_id' => $request->district_id,
                'zone_id' => $request->zone_id,
                'is_active' => $request->is_active ?? 'all',
                'school_type' => $request->school_type ?? 'all',
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show editable profile form for a single school (admin-only).
     *
     * GET /admin/schools/{userId}/profile
     */
    public function profile(int $userId): Response
    {
        $school = User::schools()
            ->with(['district', 'zone'])
            ->findOrFail($userId);

        return Inertia::render('Admin/Schools/Profile', [
            'school' => $school,
        ]);
    }

    /**
     * Display detailed view of a single school (READ-ONLY).
     * 
     * GET /admin/schools/{userId}
     */
    public function show(Request $request, int $userId): Response
    {
        // Find school user with relationships
        $school = User::schools()
            ->with(['district', 'zone', 'roles'])
            ->findOrFail($userId);

        // Get latest rice configuration
        $riceConfiguration = MonthlyRiceConfiguration::where('user_id', $userId)
            ->latest()
            ->first();

        // Default date range for daily consumptions (last 30 days)
        $dateFrom = $request->date_from ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        // Get daily consumptions with pagination (basic list)
        $dailyConsumptions = DailyConsumption::where('user_id', $userId)
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->orderBy('date', 'desc')
            ->paginate(10, ['*'], 'consumptions_page')
            ->withQueryString();

        // Compute detailed calculated consumptions for read-only tables
        /** @var ConsumptionCalculationService $calc */
        $calc = app(ConsumptionCalculationService::class);

        // Opening balance at the start of the selected period
        $openingBalance = $calc->getOpeningBalanceForDate($school, Carbon::parse($dateFrom));

        // Fetch filtered records ascending for correct running balance
        $filteredRecordsAsc = DailyConsumption::where('user_id', $userId)
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->orderBy('date', 'asc')
            ->get();

        // Latest monthly amount configuration for ingredient breakdown
        $amountConfig = MonthlyAmountConfiguration::where('user_id', $userId)
            ->latest('year')
            ->latest('month')
            ->first();

        // Apply cumulative rice balance and amount breakdowns using current config
        $recordsWithCalculations = $calc->getCumulativeBalances(
            $filteredRecordsAsc,
            $openingBalance,
            $amountConfig,
            $school
        )->map(function ($record) {
            return [
                'id' => $record->id,
                'date' => $record->date ? $record->date->format('Y-m-d') : null,
                'day' => $record->day,
                'served_primary' => $record->served_primary ?? 0,
                'served_middle' => $record->served_middle ?? 0,
                // Rice calculations
                'primary_rice' => $record->primary_rice ?? 0,
                'middle_rice' => $record->middle_rice ?? 0,
                'total_rice' => $record->total_rice ?? 0,
                'rice_balance_after' => $record->rice_balance_after ?? 0,
                // Amount breakdown (primary)
                'primary_pulses' => $record->primary_pulses ?? 0,
                'primary_vegetables' => $record->primary_vegetables ?? 0,
                'primary_oil' => $record->primary_oil ?? 0,
                'primary_salt' => $record->primary_salt ?? 0,
                'primary_fuel' => $record->primary_fuel ?? 0,
                'primary_total' => $record->primary_total ?? 0,
                // Amount breakdown (middle)
                'middle_pulses' => $record->middle_pulses ?? 0,
                'middle_vegetables' => $record->middle_vegetables ?? 0,
                'middle_oil' => $record->middle_oil ?? 0,
                'middle_salt' => $record->middle_salt ?? 0,
                'middle_fuel' => $record->middle_fuel ?? 0,
                'middle_total' => $record->middle_total ?? 0,
                // Cumulative amount total
                'cumulative_amount' => $record->cumulative_amount ?? 0,
                // Optional
                'remarks' => $record->remarks ?? '',
            ];
        });

        // Calculate consumption summary
        $consumptionSummary = DailyConsumption::where('user_id', $userId)
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->selectRaw('
                COUNT(*) as total_days,
                SUM(served_primary + served_middle) as total_students,
                SUM(rice_consumed) as total_rice,
                SUM(amount_consumed) as total_amount
            ')
            ->first();

        // Get rice reports
        $riceReportsYear = $request->rice_year ?? Carbon::now()->year;
        $riceReportsMonth = $request->rice_month;

        $riceReportsQuery = RiceReport::where('user_id', $userId)
            ->where('year', $riceReportsYear);

        if ($riceReportsMonth) {
            $riceReportsQuery->where('month', $riceReportsMonth);
        }

        $riceReports = $riceReportsQuery->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate(10, ['*'], 'rice_reports_page')
            ->withQueryString();

        // Get amount reports
        $amountReportsYear = $request->amount_year ?? Carbon::now()->year;
        $amountReportsMonth = $request->amount_month;

        $amountReportsQuery = AmountReport::where('user_id', $userId)
            ->where('year', $amountReportsYear);

        if ($amountReportsMonth) {
            $amountReportsQuery->where('month', $amountReportsMonth);
        }

        $amountReports = $amountReportsQuery->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate(10, ['*'], 'amount_reports_page')
            ->withQueryString();

        // Get bills
        $billsYear = $request->bills_year ?? Carbon::now()->year;
        $billsMonth = $request->bills_month;
        $billsType = $request->bills_type;

        // Bills are linked to AmountReport, which holds user/month/year.
        // Filter bills via their related report for the current school and period.
        $billsQuery = Bill::whereHas('report', function ($q) use ($userId, $billsYear, $billsMonth) {
                $q->where('user_id', $userId)
                  ->where('year', $billsYear);
                if ($billsMonth) {
                    $q->where('month', $billsMonth);
                }
            });

        // Month filter moved into the report relation above

        if ($billsType && $billsType !== 'all') {
            $billsQuery->where('type', $billsType);
        }

        $bills = $billsQuery->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'bills_page')
            ->withQueryString();

        // Get latest roll statement
        $rollStatement = RollStatement::where('user_id', $userId)
            ->latest()
            ->first();

        // Calculate school statistics for date range
        $statsDateFrom = $request->stats_date_from ?? Carbon::now()->subMonths(3)->format('Y-m-d');
        $statsDateTo = $request->stats_date_to ?? Carbon::now()->format('Y-m-d');

        $schoolStats = DailyConsumption::where('user_id', $userId)
            ->whereBetween('date', [$statsDateFrom, $statsDateTo])
            ->selectRaw('
                COUNT(DISTINCT date) as total_serving_days,
                SUM(served_primary + served_middle) as total_students_served,
                SUM(rice_consumed) as total_rice_consumed,
                SUM(amount_consumed) as total_amount_spent,
                AVG(rice_consumed) as avg_daily_consumption
            ')
            ->first();

        return Inertia::render('Admin/Schools/Show', [
            'school' => $school,
            'riceConfiguration' => $riceConfiguration,
            'dailyConsumptions' => $dailyConsumptions,
            // Detailed, calculated entries for read-only tables
            'consumptionsWithCalculations' => $recordsWithCalculations,
            'consumptionSummary' => $consumptionSummary,
            'riceReports' => $riceReports,
            'amountReports' => $amountReports,
            'bills' => $bills,
            'rollStatement' => $rollStatement,
            'schoolStats' => $schoolStats,
            // Extra context for rendering read-only tables
            'schoolType' => $school->school_type,
            'sections' => $school->getRequiredSections(),
            'openingBalance' => $openingBalance,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'rice_year' => $riceReportsYear,
                'rice_month' => $riceReportsMonth,
                'amount_year' => $amountReportsYear,
                'amount_month' => $amountReportsMonth,
                'bills_year' => $billsYear,
                'bills_month' => $billsMonth,
                'bills_type' => $billsType ?? 'all',
                'stats_date_from' => $statsDateFrom,
                'stats_date_to' => $statsDateTo,
            ],
        ]);
    }

    /**
     * Update a school's user profile (admin-only).
     * Allows editing registration fields and optional password reset.
     */
    public function update(Request $request, int $userId)
    {
        $user = User::schools()->findOrFail($userId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],

            'state' => ['nullable', 'string', 'max:255'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'zone_id' => ['nullable', 'exists:zones,id'],

            'udise_code' => ['required', 'string', 'max:20', 'unique:users,udise_code,' . $user->id],
            'school_name' => ['required', 'string', 'max:255'],
            'school_type' => ['required', 'in:primary,middle,secondary'],
            'institute_address' => ['nullable', 'string'],
            'school_pincode' => ['nullable', 'string', 'max:10'],

            'password' => ['nullable', 'confirmed', 'min:8'],
        ]);

        // Handle optional password reset
        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }
        unset($validated['password'], $validated['password_confirmation']);

        // Map udise_code to model field name if different
        if (isset($validated['udise_code'])) {
            $validated['udise_code'] = $validated['udise_code'];
        }

        $user->fill($validated);

        // If email changed, reset verification
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()
            ->route('admin.schools.show', $userId)
            ->with('success', 'School profile updated successfully.');
    }

    /**
     * Activate a school account.
     * 
     * POST /admin/schools/{userId}/activate
     */
    public function activate(int $userId)
    {
        try {
            // Find user
            $user = User::findOrFail($userId);

            // Verify user is a school (not admin)
            if ($user->isAdmin()) {
                return back()->with('error', 'Cannot activate admin accounts.');
            }

            // Check if already active
            if ($user->status === 'active') {
                return back()->with('info', 'School account is already active.');
            }

            // Activate
            $user->status = 'active';
            $user->save();

            return back()->with('success', 'School account activated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error activating school account: ' . $e->getMessage());
            return back()->with('error', 'Failed to activate school account. Please try again.');
        }
    }

    /**
     * Deactivate a school account.
     * 
     * POST /admin/schools/{userId}/deactivate
     */
    public function deactivate(int $userId)
    {
        try {
            // Find user
            $user = User::findOrFail($userId);

            // Verify user is a school (not admin)
            if ($user->isAdmin()) {
                return back()->with('error', 'Cannot deactivate admin accounts.');
            }

            // Prevent self-deactivation
            if ($user->id === auth()->id()) {
                return back()->with('error', 'You cannot deactivate your own account.');
            }

            // Check if already inactive
            if ($user->status === 'inactive') {
                return back()->with('info', 'School account is already inactive.');
            }

            // Deactivate
            $user->status = 'inactive';
            $user->save();

            return back()->with('success', 'School account deactivated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Error deactivating school account: ' . $e->getMessage());
            return back()->with('error', 'Failed to deactivate school account. Please try again.');
        }
    }

    /**
     * Permanently delete a school account and all associated data.
     * 
     * DELETE /admin/schools/{userId}
     */
    public function destroy(int $userId)
    {
        // Find user
        $user = User::findOrFail($userId);

        // Verify user is a school (not admin)
        if ($user->isAdmin()) {
            return redirect()->route('admin.schools.index')->with('error', 'Cannot delete admin accounts.');
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.schools.index')->with('error', 'You cannot delete your own account.');
        }

        // Store school name for flash message
        $schoolName = $user->school_name;

        try {
            // Manually delete all related records to avoid foreign key constraint errors
            \DB::transaction(function () use ($user) {
                // 1. Delete daily consumptions
                \DB::table('daily_consumptions')->where('user_id', $user->id)->delete();
                
                // 2. Delete rice reports
                \DB::table('rice_reports')->where('user_id', $user->id)->delete();
                
                // 3. Delete amount reports (and related bills will cascade)
                \DB::table('amount_reports')->where('user_id', $user->id)->delete();
                
                // 4. Delete bills directly if they don't cascade
                \DB::table('bills')->where('user_id', $user->id)->delete();
                
                // 5. Delete monthly rice configurations
                \DB::table('monthly_rice_configurations')->where('user_id', $user->id)->delete();
                
                // 6. Delete monthly amount configurations
                \DB::table('monthly_amount_configurations')->where('user_id', $user->id)->delete();
                
                // 6b. Delete monthly configurations (General)
                \DB::table('monthly_configurations')->where('user_id', $user->id)->delete();
                
                // 7. Delete roll statements (Fixed table name)
                \DB::table('roll_statements')->where('user_id', $user->id)->delete();
                
                // 8. Delete Rice Inventory Activities (New)
                \DB::table('rice_inventory_activities')->where('user_id', $user->id)->delete();
                
                // 9. Delete Month Completions (New)
                \DB::table('month_completions')->where('user_id', $user->id)->delete();
                
                // 10. Delete Support System Data (Comprehensive)
                // Get all chat IDs for this user
                $chatIds = \DB::table('support_chats')->where('user_id', $user->id)->pluck('id');
                
                if ($chatIds->isNotEmpty()) {
                    // Get all message IDs in these chats
                    $messageIds = \DB::table('support_messages')->whereIn('support_chat_id', $chatIds)->pluck('id');
                    
                    if ($messageIds->isNotEmpty()) {
                        // Delete attachments
                        \DB::table('message_attachments')->whereIn('support_message_id', $messageIds)->delete();
                        
                        // Delete messages
                        \DB::table('support_messages')->whereIn('id', $messageIds)->delete();
                    }
                    
                    // Delete typing indicators
                    \DB::table('chat_typing_indicators')->whereIn('support_chat_id', $chatIds)->delete();
                    
                    // Delete chats
                    \DB::table('support_chats')->whereIn('id', $chatIds)->delete();
                }
                
                // 11. Delete feedback
                \DB::table('feedback')->where('user_id', $user->id)->delete();
                
                // 12. Delete user tokens (Check if table exists first)
                if (\Illuminate\Support\Facades\Schema::hasTable('personal_access_tokens')) {
                    \DB::table('personal_access_tokens')->where('tokenable_id', $user->id)
                        ->where('tokenable_type', 'App\\Models\\User')
                        ->delete();
                }
                
                // 13. Finally, delete the user
                $user->delete();
            });

            return redirect()->route('admin.schools.index')->with('success', "School \"{$schoolName}\" and all associated data have been permanently deleted.");
            
        } catch (\Exception $e) {
            \Log::error('Failed to delete user', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            
            // Write to a specific file for easier debugging
            file_put_contents(storage_path('logs/delete_error.log'), $e->getMessage() . "\n" . $e->getTraceAsString());
            
            return redirect()->route('admin.schools.index')->with('error', 'Failed to delete school. Error: ' . $e->getMessage());
        }
    }

    /**
     * Export filtered schools list to CSV.
     * 
     * GET /admin/export/schools
     */
    public function export(Request $request)
    {
        // Validate filters (same as index)
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'is_active' => 'nullable|in:all,active,inactive',
            'school_type' => 'nullable|in:primary,middle,secondary,all',
            'search' => 'nullable|string|max:255',
        ]);

        // Build query (same logic as index)
        $query = User::schools()
            ->with(['district', 'zone']);

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }

        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        if ($request->filled('is_active') && $request->is_active !== 'all') {
            $isActive = $request->is_active === 'active';
            $query->where('is_active', $isActive);
        }

        if ($request->filled('school_type') && $request->school_type !== 'all') {
            $query->where('school_type', $request->school_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('udise', 'like', "%{$search}%")
                  ->orWhere('school_name', 'like', "%{$search}%");
            });
        }

        // Add last activity and eager load relationships
        $query->withCount([
            'dailyConsumptions as last_activity' => function($q) {
                $q->select(\DB::raw('MAX(date)'));
            }
        ])->with(['district', 'zone']); // Fix N+1 query by eager loading relationships

        // Sort by district, then name
        $query->join('districts', 'users.district_id', '=', 'districts.id')
              ->orderBy('districts.name')
              ->orderBy('users.name')
              ->select('users.*');

        $schools = $query->get();

        // Generate CSV
        $filename = 'schools_export_' . date('Y-m-d') . '.csv';

        return FacadeResponse::streamDownload(function() use ($schools) {
            $handle = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($handle, [
                'Serial No.',
                'School Name',
                'User Name',
                'Email',
                'Phone',
                'UDISE Code',
                'District',
                'Zone',
                'State',
                'School Type',
                'Status',
                'Registration Date',
                'Last Activity Date',
            ]);

            // CSV Rows
            foreach ($schools as $index => $school) {
                fputcsv($handle, [
                    $index + 1,
                    $school->school_name ?? '',
                    $school->name ?? '',
                    $school->email ?? '',
                    $school->phone ?? '',
                    $school->udise ?? '',
                    $school->district->name ?? '',
                    $school->zone->name ?? '',
                    $school->district->state ?? '',
                    ucfirst($school->school_type ?? ''),
                    $school->is_active ? 'Active' : 'Inactive',
                    $school->created_at ? $school->created_at->format('d M Y') : '',
                    $school->last_activity ?? 'No activity',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }


}
