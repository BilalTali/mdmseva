<?php

namespace App\Http\Controllers;

use App\Models\RiceReport;
use App\Models\RollStatement;
use App\Models\MonthlyRiceConfiguration;
use App\Models\RiceInventoryActivity;
use App\Services\RiceReportService;
use App\Services\ConsumptionCalculationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exceptions\NoConsumptionDataException;
use App\Exceptions\RiceConfigurationMissingException;

/**
 * Rice Report Controller - Delegates business logic to services
 * 
 * This controller coordinates between:
 * - RiceReportService: Report generation, retrieval, and management
 * - ConsumptionCalculationService: All calculation logic
 * - Views: Rendering reports with proper data
 * 
 * Pattern: Thin controller, fat service
 */
class RiceReportController extends Controller
{
    protected RiceReportService $reportService;
    protected ConsumptionCalculationService $calculationService;

    public function __construct(
        RiceReportService $reportService,
        ConsumptionCalculationService $calculationService
    ) {
        $this->reportService = $reportService;
        $this->calculationService = $calculationService;
    }

    /**
     * Ensure each daily record includes calculated rice values for primary/middle sections.
     */
    private function ensureDailyRiceValues(RiceReport $report, $user): array
    {
        $records = $report->daily_records ?? [];

        return collect($records)->map(function ($day) use ($user) {
            $servedPrimary = $day['served_primary'] ?? 0;
            $servedMiddle = $day['served_middle'] ?? 0;

            if (!array_key_exists('primary_rice', $day) || !array_key_exists('middle_rice', $day)) {
                $rice = $this->calculationService->calculateRiceConsumption($servedPrimary, $servedMiddle, $user);
                $day['primary_rice'] = $rice['primary'];
                $day['middle_rice'] = $rice['middle'];
                $day['total_rice'] = $rice['total'];
            } else {
                $day['primary_rice'] = round($day['primary_rice'] ?? 0, 2);
                $day['middle_rice'] = round($day['middle_rice'] ?? 0, 2);
                $day['total_rice'] = round($day['total_rice'] ?? ($day['primary_rice'] + $day['middle_rice']), 2);
            }

            return $day;
        })->toArray();
    }

    /**
     * Display list of all generated reports
     * 
     * GET /rice-reports
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Get month/year from query params or default to current month
        $selectedMonth = (int) ($request->query('month') ?? now()->month);
        $selectedYear = (int) ($request->query('year') ?? now()->year);
        
        // Verify the selected month has a rice configuration
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->where('month', $selectedMonth)
            ->where('year', $selectedYear)
            ->first();
        
        // If no config for selected month, fall back to most recent month with data
        if (!$riceConfig) {
            $latestConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
                ->whereHas('dailyConsumptions') // Only months with consumption data
                ->latest('year')
                ->latest('month')
                ->first();
            
            if ($latestConfig) {
                $selectedMonth = $latestConfig->month;
                $selectedYear = $latestConfig->year;
                $riceConfig = $latestConfig;
            }
        }
        
        // Get list of available months for selector
        $availableMonths = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->select('month', 'year')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($config) {
                return [
                    'month' => $config->month,
                    'year' => $config->year,
                    'label' => date('F Y', mktime(0, 0, 0, $config->month, 1, $config->year))
                ];
            });
        
        // Use RiceReportService for report data
        $reports = $this->reportService->getAllReports($user);
        $overallStats = $this->reportService->getOverallStatistics($user);
        
        // Use getMonthSummary for selected month
        $summary = $this->calculationService->getMonthSummary($user, $selectedMonth, $selectedYear);
        
        // Calculate available stock for selected month
        $availableStock = $riceConfig 
            ? round(
                ($riceConfig->closing_balance_primary ?? 0) + 
                ($riceConfig->closing_balance_upper_primary ?? 0),
                2
            )
            : 0;
        
        // Get required sections and enrollment
        $sections = $user->getRequiredSections();
        $enrollment = $user->getEnrollmentData();
        
        // Get roll statements
        $rollStatements = $this->getLatestRollStatements($user);
        
        return Inertia::render('RiceReport/Index', [
            'reports' => $reports,
            'schoolType' => $user->school_type,
            'sections' => $sections,
            'enrollment' => $enrollment,
            'availableStock' => $availableStock,
            'rollStatements' => $rollStatements,
            'availableMonths' => $availableMonths, // NEW
            
            // Merged statistics from both services
            'statistics' => [
                'total_reports' => $overallStats['total_reports'],
                'latest_period' => $overallStats['latest_report'],
                'earliest_period' => $overallStats['earliest_report'],
                'total_rice_consumed' => $summary['totalRiceConsumed'],
                'average_daily_consumption' => $summary['avgDailyConsumption'],
                'total_serving_days' => $summary['totalDays'],
                'current_balance' => $summary['currentBalance'],
            ],
            
            // Rice configuration details (always return structure with explicit float casting)
            'riceConfig' => $riceConfig ? [
                'opening_balance_primary' => (float) ($riceConfig->opening_balance_primary ?? 0),
                'opening_balance_upper_primary' => (float) ($riceConfig->opening_balance_upper_primary ?? 0),
                'rice_lifted_primary' => (float) ($riceConfig->rice_lifted_primary ?? 0),
                'rice_lifted_upper_primary' => (float) ($riceConfig->rice_lifted_upper_primary ?? 0),
                'rice_arranged_primary' => (float) ($riceConfig->rice_arranged_primary ?? 0),
                'rice_arranged_upper_primary' => (float) ($riceConfig->rice_arranged_upper_primary ?? 0),
                'consumed_primary' => (float) ($riceConfig->consumed_primary ?? 0),
                'consumed_upper_primary' => (float) ($riceConfig->consumed_upper_primary ?? 0),
                'closing_balance_primary' => (float) ($riceConfig->closing_balance_primary ?? 0),
                'closing_balance_upper_primary' => (float) ($riceConfig->closing_balance_upper_primary ?? 0),
                'total_opening_balance' => (float) (($riceConfig->opening_balance_primary ?? 0) + ($riceConfig->opening_balance_upper_primary ?? 0)),
                'total_rice_lifted' => (float) (($riceConfig->rice_lifted_primary ?? 0) + ($riceConfig->rice_lifted_upper_primary ?? 0)),
                'total_rice_arranged' => (float) (($riceConfig->rice_arranged_primary ?? 0) + ($riceConfig->rice_arranged_upper_primary ?? 0)),
                'total_consumed' => (float) (($riceConfig->consumed_primary ?? 0) + ($riceConfig->consumed_upper_primary ?? 0)),
                'total_closing_balance' => (float) (($riceConfig->closing_balance_primary ?? 0) + ($riceConfig->closing_balance_upper_primary ?? 0)),
            ] : [
                'opening_balance_primary' => 0.0,
                'opening_balance_upper_primary' => 0.0,
                'rice_lifted_primary' => 0.0,
                'rice_lifted_upper_primary' => 0.0,
                'rice_arranged_primary' => 0.0,
                'rice_arranged_upper_primary' => 0.0,
                'consumed_primary' => 0.0,
                'consumed_upper_primary' => 0.0,
                'closing_balance_primary' => 0.0,
                'closing_balance_upper_primary' => 0.0,
                'total_opening_balance' => 0.0,
                'total_rice_lifted' => 0.0,
                'total_rice_arranged' => 0.0,
                'total_consumed' => 0.0,
                'total_closing_balance' => 0.0,
            ],
            
            // Rice rates per student (in kg)
            'riceRates' => $riceConfig ? [
                'primary' => $riceConfig->daily_consumption_primary / 1000,
                'middle' => $riceConfig->daily_consumption_upper_primary / 1000,
            ] : [
                'primary' => 0.1,
                'middle' => 0.15,
            ],
            
            // Selected month/year for context (latest month with data)
            'currentMonth' => $selectedMonth,
            'currentYear' => $selectedYear,
        ]);
    }

    /**
     * Show form for creating new report
     * 
     * GET /rice-reports/create
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        
        // Get month/year from query params or default to current month
        $selectedMonth = (int) ($request->query('month') ?? now()->month);
        $selectedYear = (int) ($request->query('year') ?? now()->year);
        
        // Check rice configuration
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)->latest()->first();
        
        // Use ConsumptionCalculationService for available stock
        $availableStock = $this->calculationService->getAvailableStock($user);
        
        // Use RiceReportService to get available months for report generation
        $availableMonths = $this->reportService->getAvailableMonthsForReports($user);
        
        // Also get all months with consumption data (for informational purposes)
        $monthsWithData = $this->reportService->getMonthsWithConsumptionData($user);
        
        return Inertia::render('RiceReport/Create', [
            'currentMonth' => $selectedMonth,
            'currentYear' => $selectedYear,
            'schoolType' => $user->school_type,
            'availableMonths' => $availableMonths,
            'monthsWithData' => $monthsWithData,
            'currentAvailableStock' => $availableStock,
            'hasRiceConfig' => !is_null($riceConfig),
            
            // Rice configuration details (always return structure with explicit float casting)
            'riceConfig' => $riceConfig ? [
                'opening_balance_primary' => (float) ($riceConfig->opening_balance_primary ?? 0),
                'opening_balance_upper_primary' => (float) ($riceConfig->opening_balance_upper_primary ?? 0),
                'rice_lifted_primary' => (float) ($riceConfig->rice_lifted_primary ?? 0),
                'rice_lifted_upper_primary' => (float) ($riceConfig->rice_lifted_upper_primary ?? 0),
                'consumed_primary' => (float) ($riceConfig->consumed_primary ?? 0),
                'consumed_upper_primary' => (float) ($riceConfig->consumed_upper_primary ?? 0),
                'closing_balance_primary' => (float) ($riceConfig->closing_balance_primary ?? 0),
                'closing_balance_upper_primary' => (float) ($riceConfig->closing_balance_upper_primary ?? 0),
                'total_closing_balance' => (float) (($riceConfig->closing_balance_primary ?? 0) + ($riceConfig->closing_balance_upper_primary ?? 0)),
            ] : [
                'opening_balance_primary' => 0.0,
                'opening_balance_upper_primary' => 0.0,
                'rice_lifted_primary' => 0.0,
                'rice_lifted_upper_primary' => 0.0,
                'consumed_primary' => 0.0,
                'consumed_upper_primary' => 0.0,
                'closing_balance_primary' => 0.0,
                'closing_balance_upper_primary' => 0.0,
                'total_closing_balance' => 0.0,
            ],
            
            // Rice rates per student (explicit float casting)
            'riceRates' => $riceConfig ? [
                'primary' => (float) (($riceConfig->daily_consumption_primary ?? 100) / 1000),
                'middle' => (float) (($riceConfig->daily_consumption_upper_primary ?? 150) / 1000),
            ] : [
                'primary' => 0.1,
                'middle' => 0.15,
            ],
        ]);
    }

    /**
     * Generate new report
     * 
     * POST /rice-reports
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
        ]);
        
        $user = Auth::user();
        
        try {
            // Delegate report generation to RiceReportService
            $report = $this->reportService->generateReport(
                $user,
                $validated['month'],
                $validated['year']
            );
            
            // Get rice configuration for this month
            $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
                ->forPeriod($validated['month'], $validated['year'])
                ->first();
            
            if ($riceConfig) {
                // Calculate next month
                $nextMonth = $validated['month'] == 12 ? 1 : $validated['month'] + 1;
                $nextYear = $validated['month'] == 12 ? $validated['year'] + 1 : $validated['year'];
                
                // Check if next month config exists
                $nextMonthExists = MonthlyRiceConfiguration::forUser($user->id)
                    ->forPeriod($nextMonth, $nextYear)
                    ->exists();
                
                // Pass carryforward information to frontend
                if (!$nextMonthExists) {
                    return redirect()
                        ->route('rice-reports.view-pdf', $report->id)
                        ->with('success', "Report generated successfully for {$report->period}")
                        ->with('can_carryforward', true)
                        ->with('closing_balance', [
                            'primary' => $riceConfig->closing_balance_primary,
                            'upper_primary' => $riceConfig->closing_balance_upper_primary,
                            'total' => $riceConfig->closing_balance_primary + $riceConfig->closing_balance_upper_primary
                        ])
                        ->with('next_month_info', [
                            'month' => $nextMonth,
                            'year' => $nextYear,
                            'current_month' => $validated['month'],
                            'current_year' => $validated['year']
                        ])
                        ->with('report_id', $report->id);
                }
            }
            
            return redirect()
                ->route('rice-reports.view-pdf', $report->id)
                ->with('success', "Report generated successfully for {$report->period}");
                
        } catch (NoConsumptionDataException $e) {
            return back()->with('error', $e->getMessage());
            
        } catch (RiceConfigurationMissingException $e) {
            return redirect()
                ->route('monthly-rice-config.index')
                ->with('error', $e->getMessage());
                
        } catch (\Exception $e) {
            Log::error('Report generation failed', [
                'user_id' => $user->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'Failed to generate report: ' . $e->getMessage());
        }
    }

    /**
     * Show PDF preview with theme selector
     * 
     * GET /rice-reports/{report}/view-pdf
     */
    public function viewPdf(RiceReport $report): Response
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $user = Auth::user();
        
        // ✅ FIX: Use getMonthSummary for THIS REPORT'S month, not ->latest()
        $summary = $this->calculationService->getMonthSummary($user, $report->month, $report->year);
        
        // Get rice configuration for THIS report's month
        $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
            ->forPeriod($report->month, $report->year)
            ->first();
        
        // Calculate available stock for THIS report's month
        $availableStock = $riceConfig 
            ? round(
                ($riceConfig->closing_balance_primary ?? 0) + 
                ($riceConfig->closing_balance_upper_primary ?? 0),
                2
            )
            : 0;
        
        // Get all reports for navigation dropdown
        $allReports = RiceReport::forUser($user->id)
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'month' => $r->month,
                    'year' => $r->year,
                    'label' => $r->period,
                ];
            });
        
        $dailyRecords = $this->ensureDailyRiceValues($report, $user);

        // CHECK FOR CARRYFORWARD AVAILABILITY (always, not just from flash)
        $canCarryforward = false;
        $closingBalance = null;
        $nextMonthInfo = null;
        
        if ($riceConfig) {
            // Calculate next month
            $nextMonth = $report->month == 12 ? 1 : $report->month + 1;
            $nextYear = $report->month == 12 ? $report->year + 1 : $report->year;
            
            // Check if next month config exists
            $nextMonthExists = MonthlyRiceConfiguration::forUser($user->id)
                ->forPeriod($nextMonth, $nextYear)
                ->exists();
            
            // Only show carryforward if next month doesn't exist
            if (!$nextMonthExists) {
                $canCarryforward = true;
                $closingBalance = [
                    'primary' => (float) $riceConfig->closing_balance_primary,
                    'upper_primary' => (float) $riceConfig->closing_balance_upper_primary,
                    'total' => (float) ($riceConfig->closing_balance_primary + $riceConfig->closing_balance_upper_primary)
                ];
                $nextMonthInfo = [
                    'month' => $nextMonth,
                    'year' => $nextYear,
                    'current_month' => $report->month,
                    'current_year' => $report->year
                ];
            }
        }

        return Inertia::render('RiceReport/ViewPdf', [
            'report' => [
                'id' => $report->id,
                'month' => $report->month,
                'year' => $report->year,
                'month_name' => $report->month_name,
                'period' => $report->period,
                'school_type' => $report->school_type,
                'opening_balance' => $report->opening_balance,
                'closing_balance' => $report->closing_balance,
                'total_rice_consumed' => $report->total_rice_consumed,
                'total_serving_days' => $report->total_serving_days,
                'average_daily_consumption' => $report->average_daily_consumption,
                'totals_by_section' => $report->getTotalsBySection(),
                'daily_records' => $dailyRecords,
                'created_at' => $report->created_at->toDateTimeString(),
            ],
            'allReports' => $allReports,
            'schoolType' => $user->school_type,
            'schoolInfo' => [
                'name' => $user->school_name ?? 'School',
                'udise' => $user->udise ?? '',
            ],
            'currentAvailableStock' => $availableStock,
            
            // Live statistics from ConsumptionCalculationService
            'statistics' => [
                'total_rice_consumed' => $summary['totalRiceConsumed'],
                'average_daily_consumption' => $summary['avgDailyConsumption'],
                'current_available_stock' => $availableStock,
                'current_balance' => $summary['currentBalance'],
                'total_serving_days' => $summary['totalDays'],
                'opening_balance' => $summary['openingBalance'],
            ],
            
            // Rice configuration details (aligned with current model fields)
            'riceConfig' => $riceConfig ? [
                'opening_balance_primary' => (float) ($riceConfig->opening_balance_primary ?? 0),
                'opening_balance_upper_primary' => (float) ($riceConfig->opening_balance_upper_primary ?? 0),
                'rice_lifted_primary' => (float) ($riceConfig->rice_lifted_primary ?? 0),
                'rice_lifted_upper_primary' => (float) ($riceConfig->rice_lifted_upper_primary ?? 0),
                'rice_arranged_primary' => (float) ($riceConfig->rice_arranged_primary ?? 0),
                'rice_arranged_upper_primary' => (float) ($riceConfig->rice_arranged_upper_primary ?? 0),
                'total_available_primary' => (float) ($riceConfig->total_available_primary ?? 0),
                'total_available_upper_primary' => (float) ($riceConfig->total_available_upper_primary ?? 0),
                'consumed_primary' => (float) ($riceConfig->consumed_primary ?? 0),
                'consumed_upper_primary' => (float) ($riceConfig->consumed_upper_primary ?? 0),
                'closing_balance_primary' => (float) ($riceConfig->closing_balance_primary ?? 0),
                'closing_balance_upper_primary' => (float) ($riceConfig->closing_balance_upper_primary ?? 0),
                'total_opening_balance' => (float) (($riceConfig->opening_balance_primary ?? 0) + ($riceConfig->opening_balance_upper_primary ?? 0)),
                'total_rice_lifted' => (float) (($riceConfig->rice_lifted_primary ?? 0) + ($riceConfig->rice_lifted_upper_primary ?? 0)),
                'total_rice_arranged' => (float) (($riceConfig->rice_arranged_primary ?? 0) + ($riceConfig->rice_arranged_upper_primary ?? 0)),
                'total_available' => (float) (($riceConfig->total_available_primary ?? 0) + ($riceConfig->total_available_upper_primary ?? 0)),
                'total_consumed' => (float) (($riceConfig->consumed_primary ?? 0) + ($riceConfig->consumed_upper_primary ?? 0)),
                'total_closing_balance' => (float) (($riceConfig->closing_balance_primary ?? 0) + ($riceConfig->closing_balance_upper_primary ?? 0)),
            ] : null,
            
            // Rice rates per student
            'riceRates' => $riceConfig ? [
                'primary' => $riceConfig->daily_consumption_primary / 1000,
                'middle' => $riceConfig->daily_consumption_upper_primary / 1000,
            ] : null,
            
            // Carryforward data (checked on every page load, not just flash)
            'can_carryforward' => $canCarryforward,
            'closing_balance' => $closingBalance,
            'next_month_info' => $nextMonthInfo,
        ]);
    }

    /**
     * Generate PDF file
     * 
     * GET /rice-reports/{report}/generate-pdf?theme=bw&download=1
     */
    public function generatePdf(Request $request, RiceReport $report)
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $user = Auth::user();
        
        // ✅ FIX: Get rice configuration for THIS report's month
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)
            ->where('month', $report->month)
            ->where('year', $report->year)
            ->first();
        
        // Validate theme parameter
        $theme = $request->query('theme', 'bw');
        $download = filter_var($request->query('download', false), FILTER_VALIDATE_BOOLEAN);
        
        if (!in_array($theme, ['bw', 'blue', 'green', 'purple'])) {
            $theme = 'bw';
        }
        
        // Get roll statements for report
        $rollStatements = $this->getLatestRollStatements($user);
        
        // Prepare computed balances
        $computedBalances = $this->prepareComputedBalances($riceConfig);
        
        // ✅ FIX: Use getMonthSummary for THIS report's month
        $summary = $this->calculationService->getMonthSummary($user, $report->month, $report->year);
        
        // Calculate available stock for THIS report's month (closing balance)
        $availableStock = $riceConfig 
            ? round(
                ($riceConfig->closing_balance_primary ?? 0) + 
                ($riceConfig->closing_balance_upper_primary ?? 0),
                2
            )
            : 0;
        
        // Prepare statistics for PDF blade template
        $liveStatistics = [
            'current_available_stock' => $availableStock,
            'total_consumed_all_time' => $summary['totalRiceConsumed'],
            'average_daily_consumption' => $summary['avgDailyConsumption'],
            'opening_balance' => $summary['openingBalance'],
            'current_balance' => $summary['currentBalance'],
        ];
        
        $report->setAttribute('daily_records', $this->ensureDailyRiceValues($report, $user));

        $viewData = [
            'report' => $report,
            'user' => $user,
            'theme' => $theme,
            'rollStatements' => $rollStatements,
            'riceConfig' => $riceConfig,
            'computedBalances' => $computedBalances,
            'liveStatistics' => $liveStatistics,
        ];
        
        try {
            $pdf = Pdf::loadView('rice-reports.pdf', $viewData)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'margin-top' => 10,
                    'margin-bottom' => 10,
                    'margin-left' => 10,
                    'margin-right' => 10,
                    'enable-local-file-access' => true,
                ]);

            $filename = sprintf(
                'Rice_Report_%s_%d_%s.pdf',
                $report->month_name,
                $report->year,
                strtoupper($theme)
            );

            $response = $download
                ? $pdf->download($filename)
                : $pdf->stream($filename);

            // Allow embedding the PDF in an iframe on the same origin
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

            return $response;
                
        } catch (\Exception $e) {
            Log::error('PDF generation failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'Failed to generate PDF: ' . $e->getMessage());
        }
    }

    /**
     * AJAX: Check if report exists
     * 
     * GET /rice-reports/find-report?month=3&year=2024
     */
    public function findReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);
        
        $user = Auth::user();
        
        // Use RiceReportService to find report
        $report = $this->reportService->findReport(
            $user,
            $validated['month'],
            $validated['year']
        );
        
        if ($report) {
            return response()->json([
                'exists' => true,
                'report_id' => $report->id,
                'month_name' => $report->month_name,
                'period' => $report->period,
                'url' => route('rice-reports.view-pdf', $report->id),
            ]);
        }
        
        return response()->json([
            'exists' => false,
            'message' => 'No report found for this period.',
        ]);
    }

    /**
     * AJAX: Validate if report can be generated
     * 
     * GET /rice-reports/validate?month=3&year=2024
     */
    public function validateGeneration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);
        
        $user = Auth::user();
        
        // Use RiceReportService to validate
        $validation = $this->reportService->validateReportGeneration(
            $user,
            $validated['month'],
            $validated['year']
        );
        
        return response()->json($validation);
    }

    /**
     * Delete a report
     * 
     * DELETE /rice-reports/{report}
     */
    public function destroy(RiceReport $report): RedirectResponse
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $period = $report->period;
        
        try {
            // Use RiceReportService to delete
            $this->reportService->deleteReport($report);
            
            return redirect()
                ->route('rice-reports.index')
                ->with('success', "Report for {$period} deleted successfully.");
                
        } catch (\Exception $e) {
            Log::error('Report deletion failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'Failed to delete report: ' . $e->getMessage());
        }
    }

    /**
     * Regenerate report
     * 
     * POST /rice-reports/{report}/regenerate
     */
    public function regenerate(RiceReport $report): RedirectResponse
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $user = Auth::user();
        
        try {
            // Use RiceReportService to regenerate
            $newReport = $this->reportService->regenerateReport(
                $user,
                $report->month,
                $report->year
            );
            
            return redirect()
                ->route('rice-reports.view-pdf', $newReport->id)
                ->with('success', "Report regenerated successfully for {$newReport->period}");
                
        } catch (NoConsumptionDataException $e) {
            return back()->with('error', $e->getMessage());
            
        } catch (RiceConfigurationMissingException $e) {
            return redirect()
                ->route('monthly-rice-config.index')
                ->with('error', $e->getMessage());
                
        } catch (\Exception $e) {
            Log::error('Report regeneration failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->with('error', 'Failed to regenerate report: ' . $e->getMessage());
        }
    }

    /**
     * Carryforward closing balance to next month
     * 
     * POST /rice-reports/{report}/carryforward
     */
    public function carryforwardToNextMonth(RiceReport $report): RedirectResponse
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $user = Auth::user();
        
        try {
            // Get rice configuration for this report's month
            $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
                ->forPeriod($report->month, $report->year)
                ->firstOrFail();
            
            // Calculate next month
            $nextMonth = $report->month == 12 ? 1 : $report->month + 1;
            $nextYear = $report->month == 12 ? $report->year + 1 : $report->year;
            
            // Check if next month config already exists
            $existingNext = MonthlyRiceConfiguration::forUser($user->id)
                ->forPeriod($nextMonth, $nextYear)
                ->first();
            
            if ($existingNext) {
                return back()->withErrors(['error' => 'Next month configuration already exists.']);
            }
            
            // Create next month with carried forward balances
            $nextConfig = MonthlyRiceConfiguration::create([
                'user_id' => $user->id,
                'month' => $nextMonth,
                'year' => $nextYear,
                'school_type' => $riceConfig->school_type,
                'opening_balance_primary' => $riceConfig->closing_balance_primary,
                'opening_balance_upper_primary' => $riceConfig->closing_balance_upper_primary,
                'daily_consumption_primary' => $riceConfig->daily_consumption_primary,
                'daily_consumption_upper_primary' => $riceConfig->daily_consumption_upper_primary,
                'rice_lifted_primary' => 0,
                'rice_lifted_upper_primary' => 0,
                'rice_arranged_primary' => 0,
                'rice_arranged_upper_primary' => 0,
                'consumed_primary' => 0,
                'consumed_upper_primary' => 0,
            ]);
            
            // Recompute totals
            $nextConfig->recomputeTotals();
            $nextConfig->save();
            
            // Log activity
            RiceInventoryActivity::create([
                'user_id' => $user->id,
                'config_id' => $nextConfig->id,
                'month' => $nextConfig->month,
                'year' => $nextConfig->year,
                'action' => RiceInventoryActivity::ACTION_OPENED,
                'amount_primary' => $nextConfig->opening_balance_primary,
                'amount_upper_primary' => $nextConfig->opening_balance_upper_primary,
                'notes' => "Balance carried forward from {$report->month_name} {$report->year}",
                'created_by' => $user->id
            ]);
            
            return redirect()->route('monthly-rice-config.index', [
                'month' => $nextMonth,
                'year' => $nextYear
            ])->with('success', "Next month configuration created! Opening balance carried forward from {$report->month_name} {$report->year}.");
            
        } catch (\Exception $e) {
            Log::error('Carryforward failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->withErrors(['error' => 'Failed to carryforward balance: ' . $e->getMessage()]);
        }
    }

    /**
     * Show report details (detailed view)
     * 
     * GET /rice-reports/{report}
     */
    public function show(RiceReport $report): Response
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this report.');
        }
        
        $user = Auth::user();
        
        // Get rice configuration for rates and balances
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)->latest()->first();
        
        return Inertia::render('RiceReport/Show', [
            'report' => [
                'id' => $report->id,
                'month' => $report->month,
                'year' => $report->year,
                'month_name' => $report->month_name,
                'period' => $report->period,
                'school_type' => $report->school_type,
                'opening_balance' => $report->opening_balance,
                'closing_balance' => $report->closing_balance,
                'total_rice_consumed' => $report->total_rice_consumed,
                'total_serving_days' => $report->total_serving_days,
                'average_daily_consumption' => $report->average_daily_consumption,
                'totals_by_section' => $report->getTotalsBySection(),
                'daily_summary' => $report->getDailySummary(),
                'daily_records' => $report->daily_records,
                'created_at' => $report->created_at->toDateTimeString(),
                'updated_at' => $report->updated_at->toDateTimeString(),
            ],
            'schoolType' => $user->school_type,
            
            // Rice rates for display
            'riceRates' => $riceConfig ? [
                'primary' => $riceConfig->daily_consumption_primary / 1000,
                'middle' => $riceConfig->daily_consumption_upper_primary / 1000,
            ] : [
                'primary' => 0.1,
                'middle' => 0.15,
            ],

            // Rice configuration details including arranged rice
            'riceConfig' => $riceConfig ? [
                'opening_balance_primary' => (float) ($riceConfig->opening_balance_primary ?? 0),
                'opening_balance_upper_primary' => (float) ($riceConfig->opening_balance_upper_primary ?? 0),
                'rice_lifted_primary' => (float) ($riceConfig->rice_lifted_primary ?? 0),
                'rice_lifted_upper_primary' => (float) ($riceConfig->rice_lifted_upper_primary ?? 0),
                'rice_arranged_primary' => (float) ($riceConfig->rice_arranged_primary ?? 0),
                'rice_arranged_upper_primary' => (float) ($riceConfig->rice_arranged_upper_primary ?? 0),
                'consumed_primary' => (float) ($riceConfig->consumed_primary ?? 0),
                'consumed_upper_primary' => (float) ($riceConfig->consumed_upper_primary ?? 0),
                'closing_balance_primary' => (float) ($riceConfig->closing_balance_primary ?? 0),
                'closing_balance_upper_primary' => (float) ($riceConfig->closing_balance_upper_primary ?? 0),
                'total_opening_balance' => (float) (($riceConfig->opening_balance_primary ?? 0) + ($riceConfig->opening_balance_upper_primary ?? 0)),
                'total_rice_lifted' => (float) (($riceConfig->rice_lifted_primary ?? 0) + ($riceConfig->rice_lifted_upper_primary ?? 0)),
                'total_rice_arranged' => (float) (($riceConfig->rice_arranged_primary ?? 0) + ($riceConfig->rice_arranged_upper_primary ?? 0)),
                'total_consumed' => (float) (($riceConfig->consumed_primary ?? 0) + ($riceConfig->consumed_upper_primary ?? 0)),
                'total_closing_balance' => (float) (($riceConfig->closing_balance_primary ?? 0) + ($riceConfig->closing_balance_upper_primary ?? 0)),
            ] : null,
        ]);
    }

    /**
     * DEBUG ROUTE - Check rice configuration fields
     * Add this route: Route::get('/rice-reports/debug', [RiceReportController::class, 'debug']);
     */
    public function debug()
    {
        $user = Auth::user();
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $user->id)->latest()->first();
        
        if (!$riceConfig) {
            return response()->json(['error' => 'No rice configuration found']);
        }
        
        return response()->json([
            'all_attributes' => $riceConfig->getAttributes(),
            'toArray' => $riceConfig->toArray(),
            'json' => $riceConfig->toJson(),
        ]);
    }

    // ==================== HELPER METHODS ====================
    // These remain in controller as they deal with presentation logic
    // not business logic

    /**
     * Get latest roll statements for display
     * This is presentation logic, not business logic
     */
    protected function getLatestRollStatements($user)
    {
        try {
            $classMap = [
                'kg' => 'KG', 'KG' => 'KG',
                '1' => '1st', '1st' => '1st',
                '2' => '2nd', '2nd' => '2nd',
                '3' => '3rd', '3rd' => '3rd',
                '4' => '4th', '4th' => '4th',
                '5' => '5th', '5th' => '5th',
                '6' => '6th', '6th' => '6th',
                '7' => '7th', '7th' => '7th',
                '8' => '8th', '8th' => '8th',
            ];
            
            $sortOrder = [
                'KG' => 1, '1st' => 2, '2nd' => 3, '3rd' => 4, 
                '4th' => 5, '5th' => 6, '6th' => 7, '7th' => 8, '8th' => 9
            ];
            
            $rollStatements = RollStatement::where('udise', $user->udise_code)
                ->get()
                ->groupBy('class')
                ->map(function ($classGroup) {
                    return $classGroup->sortByDesc('date')->first();
                });
            
            if ($rollStatements->isEmpty()) {
                return collect([]);
            }
            
            return $rollStatements
                ->map(function ($statement) use ($classMap) {
                    $normalizedClass = $classMap[strtolower($statement->class)] ?? $statement->class;
                    $statement->class = $normalizedClass;
                    return $statement;
                })
                ->sortBy(function ($statement) use ($sortOrder) {
                    return $sortOrder[$statement->class] ?? 99;
                })
                ->values();

        } catch (\Exception $e) {
            Log::error('Failed to get latest roll statements', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return collect([]);
        }
    }

    /**
     * Prepare computed balances from MonthlyRiceConfiguration for PDF view
     * This is view formatting logic
     */
    protected function prepareComputedBalances(?MonthlyRiceConfiguration $riceConfig): array
    {
        if (!$riceConfig) {
            return [
                'opening_balance_primary' => 0,
                'opening_balance_upper_primary' => 0,
                'rice_lifted_primary' => 0,
                'rice_lifted_upper_primary' => 0,
                'rice_arranged_primary' => 0,
                'rice_arranged_upper_primary' => 0,
                'consumed_primary' => 0,
                'consumed_upper_primary' => 0,
                'closing_balance_primary' => 0,
                'closing_balance_upper_primary' => 0,
                'total_opening_balance' => 0,
                'total_rice_lifted' => 0,
                'total_rice_arranged' => 0,
                'total_consumed' => 0,
                'total_closing_balance' => 0,
            ];
        }

        return [
            'opening_balance_primary' => (float) ($riceConfig->opening_balance_primary ?? 0),
            'opening_balance_upper_primary' => (float) ($riceConfig->opening_balance_upper_primary ?? 0),
            'rice_lifted_primary' => (float) ($riceConfig->rice_lifted_primary ?? 0),
            'rice_lifted_upper_primary' => (float) ($riceConfig->rice_lifted_upper_primary ?? 0),
            'rice_arranged_primary' => (float) ($riceConfig->rice_arranged_primary ?? 0),
            'rice_arranged_upper_primary' => (float) ($riceConfig->rice_arranged_upper_primary ?? 0),
            'consumed_primary' => (float) ($riceConfig->consumed_primary ?? 0),
            'consumed_upper_primary' => (float) ($riceConfig->consumed_upper_primary ?? 0),
            'closing_balance_primary' => (float) ($riceConfig->closing_balance_primary ?? 0),
            'closing_balance_upper_primary' => (float) ($riceConfig->closing_balance_upper_primary ?? 0),
            'total_opening_balance' => (float) (($riceConfig->opening_balance_primary ?? 0) + ($riceConfig->opening_balance_upper_primary ?? 0)),
            'total_rice_lifted' => (float) (($riceConfig->rice_lifted_primary ?? 0) + ($riceConfig->rice_lifted_upper_primary ?? 0)),
            'total_rice_arranged' => (float) (($riceConfig->rice_arranged_primary ?? 0) + ($riceConfig->rice_arranged_upper_primary ?? 0)),
            'total_consumed' => (float) (($riceConfig->consumed_primary ?? 0) + ($riceConfig->consumed_upper_primary ?? 0)),
            'total_closing_balance' => (float) (($riceConfig->closing_balance_primary ?? 0) + ($riceConfig->closing_balance_upper_primary ?? 0)),
        ];
    }

    /**
     * Export rice report to Excel/CSV
     * 
     * GET /rice-reports/export?month=1&year=2025&format=xlsx
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
            'format' => 'nullable|string|in:xlsx,csv',
        ]);

        $user = Auth::user();
        $month = $validated['month'];
        $year = $validated['year'];
        $format = $validated['format'] ?? 'xlsx';

        $export = new \App\Exports\RiceReportExport($user->id, $month, $year);
        
        $monthName = date('F', mktime(0, 0, 0, $month, 1));
        $filename = sprintf('rice-report-%s-%d.%s', strtolower($monthName), $year, $format);

        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }
}