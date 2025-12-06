<?php

namespace App\Http\Controllers;

use App\Models\AmountReport;
use App\Models\RiceReport;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;
use App\Services\AmountReportService;
use App\Services\ReportStaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AmountReportExport;

class AmountReportController extends Controller
{
    /**
     * AmountReportService instance
     */
    protected AmountReportService $reportService;

    /**
     * ReportStaleService instance
     */
    protected ReportStaleService $staleService;

    /**
     * Constructor - inject services
     */
    public function __construct(AmountReportService $reportService, ReportStaleService $staleService)
    {
        $this->reportService = $reportService;
        $this->staleService = $staleService;
    }

    /**
     * Display a listing of amount reports.
     */
    public function index()
    {
        $user = Auth::user();
        $userId = $user->id;

        $reports = $this->reportService->getPaginatedReports($userId, 15);
        $availableMonths = $this->reportService->getAvailableMonthsForReports($userId);
        $statistics = $this->reportService->getReportStatistics($userId);

        $reportsData = $reports->getCollection()->map(function ($report) use ($user) {
            $data = [
                'id' => $report->id,
                'period' => $report->period,
                'month' => $report->month,
                'year' => $report->year,
                'month_name' => $report->month_name,
                'school_type' => $report->school_type,
                'total_serving_days' => $report->total_serving_days,
                'grand_total_amount' => (float) $report->grand_total_amount,
                'average_daily_amount' => (float) $report->average_daily_amount,
                'total_primary_students' => $report->total_primary_students,
                'total_middle_students' => $report->total_middle_students,
                'created_at' => $report->created_at->format('M d, Y'),
                'created_at_human' => $report->created_at->diffForHumans(),
                'bills_count' => $report->getBillsCount(),
                'is_stale' => $report->is_stale,
                'stale_reason' => $report->stale_reason,
            ];

            // Add primary breakdown if user has primary students
            if ($user->hasPrimaryStudents()) {
                $data['primary_breakdown'] = [
                    'pulses' => (float) $report->total_primary_pulses,
                    'vegetables' => (float) $report->total_primary_vegetables,
                    'oil' => (float) $report->total_primary_oil,
                    'salt_total' => (float) $report->total_primary_salt,
                    'salt_breakdown' => $report->getPrimarySaltBreakdown(),
                    'fuel' => (float) $report->total_primary_fuel,
                    'total' => (float) $report->total_primary_amount,
                ];
            }

            // Add middle breakdown if user has middle students
            if ($user->hasMiddleStudents()) {
                $data['middle_breakdown'] = [
                    'pulses' => (float) $report->total_middle_pulses,
                    'vegetables' => (float) $report->total_middle_vegetables,
                    'oil' => (float) $report->total_middle_oil,
                    'salt_total' => (float) $report->total_middle_salt,
                    'salt_breakdown' => $report->getMiddleSaltBreakdown(),
                    'fuel' => (float) $report->total_middle_fuel,
                    'total' => (float) $report->total_middle_amount,
                ];
            }

            return $data;
        });

        return Inertia::render('AmountReport/Index', [
            'reports' => [
                'data' => $reportsData,
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
                'from' => $reports->firstItem(),
                'to' => $reports->lastItem(),
                'path' => $reports->path(), // Ensure pagination path is available
            ],
            'availableMonths' => $availableMonths,
            'statistics' => $statistics,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Show the form for creating a new report.
     */
    public function create()
    {
        $user = Auth::user();
        $userId = $user->id;

        // Check if user has ANY amount configuration (monthly)
        // We check if there's at least one completed configuration
        $hasConfig = MonthlyAmountConfiguration::where('user_id', $userId)
            ->where('is_completed', true)
            ->exists();

        if (!$hasConfig) {
            return redirect()
                ->route('amount-config.index')
                ->with('error', 'Please create and confirm an Amount Configuration first before generating reports.');
        }

        $availableMonths = $this->reportService->getAvailableMonthsForReports($userId);

        // Filter to only show months without reports
        $availableMonths = array_filter($availableMonths, function ($period) {
            return $period['can_generate'];
        });

        return Inertia::render('AmountReport/Create', [
            'currentMonth' => now()->month,
            'currentYear' => now()->year,
            'availableMonths' => array_values($availableMonths),
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Store a newly created report.
     * ✅ UPDATED: Uses unified salt percentages from MonthlyAmountConfiguration
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Simplified validation - only month and year needed
        $validated = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        try {
            // Get user's monthly amount configuration for the specific month
            $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
                ->forPeriod($validated['month'], $validated['year'])
                ->first();

            if (!$amountConfig || !$amountConfig->is_completed) {
                return back()->withErrors([
                    'generation' => 'Please create and confirm the Amount Configuration for this month first.',
                ])->withInput();
            }

            // Validate if report can be generated
            $validation = $this->reportService->validateReportGeneration(
                $user,
                $validated['month'],
                $validated['year']
            );

            if (!$validation['can_generate']) {
                return back()->withErrors([
                    'generation' => $validation['errors'],
                ])->withInput();
            }

            // ✅ Extract UNIFIED salt percentages from MonthlyAmountConfiguration
            // Same percentages apply to both Primary and Middle
            $saltPercentages = [
                'primary' => $user->hasPrimaryStudents() ? [
                    'common' => $amountConfig->salt_percentage_common ?? 5,
                    'chilli' => $amountConfig->salt_percentage_chilli ?? 35,
                    'turmeric' => $amountConfig->salt_percentage_turmeric ?? 25,
                    'coriander' => $amountConfig->salt_percentage_coriander ?? 15,
                    'other' => $amountConfig->salt_percentage_other ?? 20,
                ] : null,
                'middle' => $user->hasMiddleStudents() ? [
                    'common' => $amountConfig->salt_percentage_common ?? 5,
                    'chilli' => $amountConfig->salt_percentage_chilli ?? 35,
                    'turmeric' => $amountConfig->salt_percentage_turmeric ?? 25,
                    'coriander' => $amountConfig->salt_percentage_coriander ?? 15,
                    'other' => $amountConfig->salt_percentage_other ?? 20,
                ] : null,
            ];

            // Generate the report with unified salt percentages
            $report = $this->reportService->generateReport(
                $user,
                $validated['month'],
                $validated['year'],
                $saltPercentages
            );

            // Calculate source hash and link dependencies
            $hash = $this->staleService->generateSourceHashForPeriod($user->id, $validated['month'], $validated['year']);
            $riceReport = RiceReport::where('user_id', $user->id)
                ->where('month', $validated['month'])
                ->where('year', $validated['year'])
                ->first();

            $report->update([
                'source_daily_hash' => $hash,
                'depends_on_rice_report_id' => $riceReport?->id,
            ]);

            Log::info('Amount report created (using unified salt percentages)', [
                'user_id' => $user->id,
                'report_id' => $report->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
            ]);

            return redirect()
                ->route('amount-reports.view-pdf', $report->id)
                ->with('success', "Amount report generated for {$report->period}");

        } catch (\Throwable $e) {
            Log::error('Failed to generate amount report', [
                'user_id' => $user->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'generation' => 'Failed to generate report: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Display the specified report in PDF viewer.
     */
    public function viewPdf(AmountReport $amountReport)
    {
        $user = Auth::user();

        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        // Check if report is stale
        if ($amountReport->is_stale) {
            return redirect()->route('amount-reports.index')
                ->with('error', 'This report is stale and must be regenerated before viewing.');
        }

        $reportData = [
            'id' => $amountReport->id,
            'period' => $amountReport->period,
            'month' => $amountReport->month,
            'year' => $amountReport->year,
            'month_name' => $amountReport->month_name,
            'school_type' => $amountReport->school_type,
            'total_serving_days' => $amountReport->total_serving_days,
            'primary' => [
                'students' => $amountReport->total_primary_students,
                'pulses' => (float) $amountReport->total_primary_pulses,
                'vegetables' => (float) $amountReport->total_primary_vegetables,
                'oil' => (float) $amountReport->total_primary_oil,
                'salt_total' => (float) $amountReport->total_primary_salt,
                'salt_breakdown' => $amountReport->getPrimarySaltBreakdown(),
                'fuel' => (float) $amountReport->total_primary_fuel,
                'total' => (float) $amountReport->total_primary_amount,
            ],
            'middle' => [
                'students' => $amountReport->total_middle_students,
                'pulses' => (float) $amountReport->total_middle_pulses,
                'vegetables' => (float) $amountReport->total_middle_vegetables,
                'oil' => (float) $amountReport->total_middle_oil,
                'salt_total' => (float) $amountReport->total_middle_salt,
                'salt_breakdown' => $amountReport->getMiddleSaltBreakdown(),
                'fuel' => (float) $amountReport->total_middle_fuel,
                'total' => (float) $amountReport->total_middle_amount,
            ],
            'grand_total_amount' => (float) $amountReport->grand_total_amount,
            'average_daily_amount' => (float) $amountReport->average_daily_amount,
            'daily_records' => $amountReport->daily_records,
            'created_at' => $amountReport->created_at->format('M d, Y h:i A'),
        ];

        return Inertia::render('AmountReport/ViewPdf', [
            'report' => $reportData,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'school_type' => $user->school_type,
            ],
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Generate and download PDF for the specified report.
     */
    public function generatePdf(Request $request, AmountReport $amountReport)
    {
        $user = Auth::user();

        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        // Check if report is stale
        if ($amountReport->is_stale) {
            return response()->json([
                'error' => 'This report is stale and must be regenerated.'
            ], 403);
        }

        try {
            $theme = $request->query('theme', 'bw');
            $preview = $request->query('preview', false);
            $download = $request->query('download', false);

            $themeCss = $this->getThemeCss($theme);

            // ✅ UPDATED: Fetch MonthlyAmountConfiguration for the report's month
            $amountConfig = MonthlyAmountConfiguration::forUser($user->id)
                ->forPeriod($amountReport->month, $amountReport->year)
                ->first();
            
            if (!$amountConfig) {
                Log::warning('No MonthlyAmountConfiguration found for user/period', [
                    'user_id' => $user->id,
                    'month' => $amountReport->month,
                    'year' => $amountReport->year
                ]);
            }

            $riceConfig = MonthlyRiceConfiguration::forUser($user->id)
                ->forPeriod($amountReport->month, $amountReport->year)
                ->first();

            $riceReport = RiceReport::where('user_id', $user->id)
                ->where('month', $amountReport->month)
                ->where('year', $amountReport->year)
                ->first();

            // Rice data initialization
            $openingPrimary = 0;
            $liftedPrimary = 0;
            $arrangedPrimary = 0;
            $riceConsumedPrimary = 0;
            $riceClosingPrimary = 0;
            $openingMiddle = 0;
            $liftedMiddle = 0;
            $arrangedMiddle = 0;
            $riceConsumedMiddle = 0;
            $riceClosingMiddle = 0;

            if ($riceConfig) {
                $openingPrimary = (float) ($riceConfig->opening_balance_primary ?? 0);
                $liftedPrimary = (float) ($riceConfig->rice_lifted_primary ?? 0);
                $arrangedPrimary = (float) ($riceConfig->rice_arranged_primary ?? 0);
                $riceConsumedPrimary = (float) ($riceConfig->consumed_primary ?? 0);
                $riceClosingPrimary = (float) ($riceConfig->closing_balance_primary ?? 0);
                
                $openingMiddle = (float) ($riceConfig->opening_balance_upper_primary ?? 0);
                $liftedMiddle = (float) ($riceConfig->rice_lifted_upper_primary ?? 0);
                $arrangedMiddle = (float) ($riceConfig->rice_arranged_upper_primary ?? 0);
                $riceConsumedMiddle = (float) ($riceConfig->consumed_upper_primary ?? 0);
                $riceClosingMiddle = (float) ($riceConfig->closing_balance_upper_primary ?? 0);
            } elseif ($riceReport) {
                $totals = $riceReport->getTotalsBySection();
                
                $openingPrimary = (float) ($riceReport->opening_balance ?? 0);
                $riceConsumedPrimary = (float) ($totals['primary']['total_rice'] ?? 0);
                $riceClosingPrimary = (float) ($riceReport->closing_balance ?? 0);
                $liftedPrimary = $riceConsumedPrimary + $riceClosingPrimary - $openingPrimary;
                
                $openingMiddle = (float) ($riceReport->opening_balance ?? 0);
                $riceConsumedMiddle = (float) ($totals['middle']['total_rice'] ?? 0);
                $riceClosingMiddle = (float) ($riceReport->closing_balance ?? 0);
                $liftedMiddle = $riceConsumedMiddle + $riceClosingMiddle - $openingMiddle;
            }

            $totalStudentsPrimary = (int) $amountReport->total_primary_students;
            $totalStudentsMiddle = (int) $amountReport->total_middle_students;
            $workingDays = (int) $amountReport->total_serving_days;

            // Middle section rates and amounts
            $pulsesVariableMiddle = $amountConfig ? (float) $amountConfig->daily_pulses_middle : 0;
            $vegetablesVariableMiddle = $amountConfig ? (float) $amountConfig->daily_vegetables_middle : 0;
            $oilVariableMiddle = $amountConfig ? (float) $amountConfig->daily_oil_middle : 0;
            $saltVariableMiddle = $amountConfig ? (float) $amountConfig->daily_salt_middle : 0;
            $fuelVariableMiddle = $amountConfig ? (float) $amountConfig->daily_fuel_middle : 0;
            $totalVariableMiddle = $pulsesVariableMiddle + $vegetablesVariableMiddle + 
                                   $oilVariableMiddle + $saltVariableMiddle + $fuelVariableMiddle;

            $pulsesConsumedMiddle = (float) $amountReport->total_middle_pulses;
            $vegetablesConsumedMiddle = (float) $amountReport->total_middle_vegetables;
            $oilConsumedMiddle = (float) $amountReport->total_middle_oil;
            $saltConsumedMiddle = (float) $amountReport->total_middle_salt;
            $fuelConsumedMiddle = (float) $amountReport->total_middle_fuel;
            $totalExpenditureMiddle = $pulsesConsumedMiddle + $vegetablesConsumedMiddle + 
                                      $oilConsumedMiddle + $saltConsumedMiddle + $fuelConsumedMiddle;

            // Primary section rates and amounts
            $pulsesVariablePrimary = $amountConfig ? (float) $amountConfig->daily_pulses_primary : 0;
            $vegetablesVariablePrimary = $amountConfig ? (float) $amountConfig->daily_vegetables_primary : 0;
            $oilVariablePrimary = $amountConfig ? (float) $amountConfig->daily_oil_primary : 0;
            $saltVariablePrimary = $amountConfig ? (float) $amountConfig->daily_salt_primary : 0;
            $fuelVariablePrimary = $amountConfig ? (float) $amountConfig->daily_fuel_primary : 0;
            $totalVariablePrimary = $pulsesVariablePrimary + $vegetablesVariablePrimary + 
                                   $oilVariablePrimary + $saltVariablePrimary + $fuelVariablePrimary;

            $pulsesConsumedPrimary = (float) $amountReport->total_primary_pulses;
            $vegetablesConsumedPrimary = (float) $amountReport->total_primary_vegetables;
            $oilConsumedPrimary = (float) $amountReport->total_primary_oil;
            $saltConsumedPrimary = (float) $amountReport->total_primary_salt;
            $fuelConsumedPrimary = (float) $amountReport->total_primary_fuel;
            $totalExpenditurePrimary = $pulsesConsumedPrimary + $vegetablesConsumedPrimary + 
                                       $oilConsumedPrimary + $saltConsumedPrimary + $fuelConsumedPrimary;

            $data = [
                'report' => $amountReport,
                'user' => $user,
                'themeCss' => $themeCss,
                'generated_at' => now()->format('d/m/Y'),
                'openingPrimary' => $openingPrimary,
                'liftedPrimary' => $liftedPrimary,
                'arrangedPrimary' => $arrangedPrimary,
                'riceConsumedPrimary' => $riceConsumedPrimary,
                'riceClosingPrimary' => $riceClosingPrimary,
                'openingMiddle' => $openingMiddle,
                'liftedMiddle' => $liftedMiddle,
                'arrangedMiddle' => $arrangedMiddle,
                'riceConsumedMiddle' => $riceConsumedMiddle,
                'riceClosingMiddle' => $riceClosingMiddle,
                'arrangedTotal' => $arrangedPrimary + $arrangedMiddle,
                'totalStudentsPrimary' => $totalStudentsPrimary,
                'totalStudentsMiddle' => $totalStudentsMiddle,
                'workingDays' => $workingDays,
                'pulsesVariableMiddle' => $pulsesVariableMiddle,
                'vegetablesVariableMiddle' => $vegetablesVariableMiddle,
                'oilVariableMiddle' => $oilVariableMiddle,
                'saltVariableMiddle' => $saltVariableMiddle,
                'fuelVariableMiddle' => $fuelVariableMiddle,
                'totalVariableMiddle' => $totalVariableMiddle,
                'pulsesConsumedMiddle' => $pulsesConsumedMiddle,
                'vegetablesConsumedMiddle' => $vegetablesConsumedMiddle,
                'oilConsumedMiddle' => $oilConsumedMiddle,
                'saltConsumedMiddle' => $saltConsumedMiddle,
                'fuelConsumedMiddle' => $fuelConsumedMiddle,
                'totalExpenditureMiddle' => $totalExpenditureMiddle,
                'pulsesVariablePrimary' => $pulsesVariablePrimary,
                'vegetablesVariablePrimary' => $vegetablesVariablePrimary,
                'oilVariablePrimary' => $oilVariablePrimary,
                'saltVariablePrimary' => $saltVariablePrimary,
                'fuelVariablePrimary' => $fuelVariablePrimary,
                'totalVariablePrimary' => $totalVariablePrimary,
                'pulsesConsumedPrimary' => $pulsesConsumedPrimary,
                'vegetablesConsumedPrimary' => $vegetablesConsumedPrimary,
                'oilConsumedPrimary' => $oilConsumedPrimary,
                'saltConsumedPrimary' => $saltConsumedPrimary,
                'fuelConsumedPrimary' => $fuelConsumedPrimary,
                'totalExpenditurePrimary' => $totalExpenditurePrimary,
            ];

            $pdf = Pdf::loadView('amount-reports.pdf', $data);
            $pdf->setPaper('a4', 'landscape');

            $filename = sprintf(
                'amount-report-%s-%s.pdf',
                $amountReport->period,
                strtolower(str_replace(' ', '-', $user->name))
            );

            Log::info('Amount report PDF generated', [
                'user_id' => $user->id,
                'report_id' => $amountReport->id,
                'filename' => $filename,
                'theme' => $theme,
            ]);

            if ($preview || (!$download && $request->query('action') !== 'download')) {
                return $pdf->stream($filename);
            }

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Failed to generate amount report PDF', [
                'user_id' => $user->id,
                'report_id' => $amountReport->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get theme-specific CSS for PDF styling.
     */
    private function getThemeCss(string $theme): string
    {
        $themes = [
            'bw' => '',
            'blue' => '
                h2, h3, h4 { color: #1e40af; }
                .report-header { background-color: #eff6ff; }
                .section-title { background-color: #dbeafe; color: #1e3a8a; }
                th { background-color: #dbeafe; }
            ',
            'green' => '
                h2, h3, h4 { color: #166534; }
                .report-header { background-color: #f0fdf4; }
                .section-title { background-color: #dcfce7; color: #14532d; }
                th { background-color: #dcfce7; }
            ',
            'purple' => '
                h2, h3, h4 { color: #6b21a8; }
                .report-header { background-color: #faf5ff; }
                .section-title { background-color: #f3e8ff; color: #581c87; }
                th { background-color: #f3e8ff; }
            ',
        ];

        return $themes[$theme] ?? '';
    }

    /**
     * AJAX endpoint to check if report exists for a period.
     */
    public function findReport(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        $exists = $this->reportService->reportExists(
            $user->id,
            $validated['month'],
            $validated['year']
        );

        if ($exists) {
            $report = $this->reportService->findReport(
                $user->id,
                $validated['month'],
                $validated['year']
            );

            return response()->json([
                'exists' => true,
                'report' => [
                    'id' => $report->id,
                    'period' => $report->period,
                    'grand_total_amount' => (float) $report->grand_total_amount,
                    'created_at' => $report->created_at->format('M d, Y'),
                ],
            ]);
        }

        return response()->json([
            'exists' => false,
        ]);
    }

    /**
     * Regenerate an existing report with fresh data.
     */
    public function regenerate(AmountReport $amountReport)
    {
        $user = Auth::user();

        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        try {
            $newReport = $this->reportService->regenerateReport(
                $user->id,
                $amountReport->month,
                $amountReport->year
            );

            // Calculate source hash and link dependencies
            $hash = $this->staleService->generateSourceHashForPeriod($user->id, $amountReport->month, $amountReport->year);
            $riceReport = RiceReport::where('user_id', $user->id)
                ->where('month', $amountReport->month)
                ->where('year', $amountReport->year)
                ->first();

            $newReport->update([
                'source_daily_hash' => $hash,
                'depends_on_rice_report_id' => $riceReport?->id,
            ]);

            // Clear stale status (it's a new report instance, so it starts fresh, but we ensure logic is clean)
            // Actually regenerateReport deletes old and creates new, so new one is fresh by default.
            // But if we were updating, we'd need to clear.
            
            Log::info('Amount report regenerated', [
                'user_id' => $user->id,
                'old_report_id' => $amountReport->id,
                'new_report_id' => $newReport->id,
            ]);

            return redirect()
                ->route('amount-reports.view-pdf', $newReport->id)
                ->with('success', 'Report regenerated successfully with current data!');

        } catch (\Exception $e) {
            Log::error('Failed to regenerate amount report', [
                'user_id' => $user->id,
                'report_id' => $amountReport->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to regenerate report: ' . $e->getMessage());
        }
    }

    /**
     * Export the report to Excel.
     */
    public function export(Request $request)
    {
        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        $month = $request->input('month');
        $year = $request->input('year');
        $user = Auth::user();

        $filename = sprintf(
            'amount-report-%s-%s.xlsx',
            date('F-Y', mktime(0, 0, 0, $month, 1, $year)),
            strtolower(str_replace(' ', '-', $user->name))
        );

        return Excel::download(new AmountReportExport($user->id, $month, $year), $filename);
    }

    /**
     * Remove the specified report.
     */
    public function destroy(AmountReport $amountReport)
    {
        $user = Auth::user();

        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        try {
            $period = $amountReport->period;
            
            $this->reportService->deleteReport($amountReport->id);

            Log::info('Amount report deleted', [
                'user_id' => $user->id,
                'report_id' => $amountReport->id,
                'period' => $period,
            ]);

            return redirect()
                ->route('amount-reports.index')
                ->with('success', "Report for {$period} deleted successfully!");

        } catch (\Exception $e) {
            Log::error('Failed to delete amount report', [
                'user_id' => $user->id,
                'report_id' => $amountReport->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete report: ' . $e->getMessage());
        }
    }
}
