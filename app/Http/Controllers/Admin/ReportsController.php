<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\District;
use App\Models\Zone;
use App\Models\RiceReport;
use App\Models\AmountReport;
use App\Models\DailyConsumption;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as FacadeResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Display list of all rice reports across schools.
     * 
     * GET /admin/rice-reports
     */
    public function riceReportsIndex(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'school_type' => 'nullable|in:primary,middle,secondary,all',
            'year' => 'nullable|integer|min:2020',
            'month' => 'nullable|integer|min:1|max:12',
            'min_consumption' => 'nullable|numeric|min:0',
            'max_consumption' => 'nullable|numeric|min:0',
        ]);

        // Build query
        $query = RiceReport::with(['user.district', 'user.zone']);

        // Filter by district
        if ($request->filled('district_id')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('district_id', $request->district_id);
            });
        }

        // Filter by zone
        if ($request->filled('zone_id')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        // Filter by school type
        if ($request->filled('school_type') && $request->school_type !== 'all') {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('school_type', $request->school_type);
            });
        }

        // Filter by year
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        // Filter by month
        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        // Filter by consumption range
        if ($request->filled('min_consumption')) {
            $query->where('total_rice_consumed', '>=', $request->min_consumption);
        }

        if ($request->filled('max_consumption')) {
            $query->where('total_rice_consumed', '<=', $request->max_consumption);
        }

        // Get reports with pagination
        $reports = $query->orderBy('year', 'desc')
                        ->orderBy('month', 'desc')
                        ->paginate(20)
                        ->withQueryString();

        // Calculate aggregations
        $aggregations = RiceReport::when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->when($request->filled('zone_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('zone_id', $request->zone_id);
                });
            })
            ->when($request->filled('school_type') && $request->school_type !== 'all', function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('school_type', $request->school_type);
                });
            })
            ->when($request->filled('year'), function($q) use ($request) {
                $q->where('year', $request->year);
            })
            ->when($request->filled('month'), function($q) use ($request) {
                $q->where('month', $request->month);
            })
            ->when($request->filled('min_consumption'), function($q) use ($request) {
                $q->where('total_rice_consumed', '>=', $request->min_consumption);
            })
            ->when($request->filled('max_consumption'), function($q) use ($request) {
                $q->where('total_rice_consumed', '<=', $request->max_consumption);
            })
            ->selectRaw('
                COUNT(*) as total_reports,
                SUM(total_rice_consumed) as total_rice,
                AVG(total_rice_consumed) as avg_per_school,
                SUM(total_primary_students + total_middle_students) as total_students
            ')
            ->first();

        // District-wise breakdown (if no district filter)
        $districtBreakdown = [];
        if (!$request->filled('district_id')) {
            $districtBreakdown = RiceReport::join('users', 'rice_reports.user_id', '=', 'users.id')
                ->join('districts', 'users.district_id', '=', 'districts.id')
                ->selectRaw('
                    districts.id,
                    districts.name,
                    COUNT(DISTINCT users.id) as schools_count,
                    SUM(rice_reports.total_rice_consumed) as total_rice,
                    AVG(rice_reports.total_rice_consumed) as avg_per_school
                ')
                ->groupBy('districts.id', 'districts.name')
                ->orderBy('total_rice', 'desc')
                ->get();
        }

        // Zone-wise breakdown (if district filtered)
        $zoneBreakdown = [];
        if ($request->filled('district_id')) {
            $zoneBreakdown = RiceReport::join('users', 'rice_reports.user_id', '=', 'users.id')
                ->join('zones', 'users.zone_id', '=', 'zones.id')
                ->where('users.district_id', $request->district_id)
                ->selectRaw('
                    zones.id,
                    zones.name,
                    COUNT(DISTINCT users.id) as schools_count,
                    SUM(rice_reports.total_rice_consumed) as total_rice,
                    AVG(rice_reports.total_rice_consumed) as avg_per_school
                ')
                ->groupBy('zones.id', 'zones.name')
                ->orderBy('total_rice', 'desc')
                ->get();
        }

        // Get districts and zones for filters
        $districts = District::orderBy('state')->orderBy('name')->get();
        $zones = [];
        
        if ($request->filled('district_id')) {
            $zones = Zone::where('district_id', $request->district_id)
                        ->orderBy('name')
                        ->get();
        }

        return Inertia::render('Admin/Reports/RiceReports/Index', [
            'reports' => $reports,
            'aggregations' => $aggregations,
            'districtBreakdown' => $districtBreakdown,
            'zoneBreakdown' => $zoneBreakdown,
            'districts' => $districts,
            'zones' => $zones,
            'filters' => $request->only([
                'district_id', 'zone_id', 'school_type', 'year', 
                'month', 'min_consumption', 'max_consumption'
            ]),
        ]);
    }

    /**
     * Display single rice report.
     * 
     * GET /admin/rice-reports/{reportId}
     */
    public function riceReportShow(int $reportId): Response
    {
        $report = RiceReport::with(['user.district', 'user.zone'])->findOrFail($reportId);

        return Inertia::render('Admin/Reports/RiceReports/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Display list of all amount reports across schools.
     * 
     * GET /admin/amount-reports
     */
    public function amountReportsIndex(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'school_type' => 'nullable|in:primary,middle,secondary,all',
            'year' => 'nullable|integer|min:2020',
            'month' => 'nullable|integer|min:1|max:12',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        // Build query
        $query = AmountReport::with(['user.district', 'user.zone']);

        // Apply filters (same logic as rice reports)
        if ($request->filled('district_id')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('district_id', $request->district_id);
            });
        }

        if ($request->filled('zone_id')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        if ($request->filled('school_type') && $request->school_type !== 'all') {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('school_type', $request->school_type);
            });
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        $reports = $query->orderBy('year', 'desc')
                        ->orderBy('month', 'desc')
                        ->paginate(20)
                        ->withQueryString();

        // Calculate aggregations with category breakdowns
        $aggregations = AmountReport::when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->when($request->filled('zone_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('zone_id', $request->zone_id);
                });
            })
            ->when($request->filled('school_type') && $request->school_type !== 'all', function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('school_type', $request->school_type);
                });
            })
            ->when($request->filled('year'), function($q) use ($request) {
                $q->where('year', $request->year);
            })
            ->when($request->filled('month'), function($q) use ($request) {
                $q->where('month', $request->month);
            })
            ->selectRaw('
                COUNT(*) as total_reports,
                SUM(total_amount) as total_amount,
                AVG(total_amount) as avg_per_school,
                SUM(pulses_amount) as total_pulses,
                SUM(vegetables_amount) as total_vegetables,
                SUM(oil_amount) as total_oil,
                SUM(salt_amount) as total_salt,
                SUM(fuel_amount) as total_fuel
            ')
            ->first();

        // Get districts and zones
        $districts = District::orderBy('state')->orderBy('name')->get();
        $zones = [];
        
        if ($request->filled('district_id')) {
            $zones = Zone::where('district_id', $request->district_id)
                        ->orderBy('name')
                        ->get();
        }

        return Inertia::render('Admin/Reports/AmountReports/Index', [
            'reports' => $reports,
            'aggregations' => $aggregations,
            'districts' => $districts,
            'zones' => $zones,
            'filters' => $request->only([
                'district_id', 'zone_id', 'school_type', 'year', 
                'month', 'min_amount', 'max_amount'
            ]),
        ]);
    }

    /**
     * Display single amount report.
     * 
     * GET /admin/amount-reports/{reportId}
     */
    public function amountReportShow(int $reportId): Response
    {
        $report = AmountReport::with(['user.district', 'user.zone'])->findOrFail($reportId);

        return Inertia::render('Admin/Reports/AmountReports/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Display all daily consumption entries across schools.
     * 
     * GET /admin/daily-consumptions
     */
    public function dailyConsumptionsIndex(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'school_type' => 'nullable|in:primary,middle,secondary,all',
            'school_id' => 'nullable|exists:users,id',
        ]);

        // Default date range (last 30 days)
        $dateFrom = $request->date_from ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? Carbon::now()->format('Y-m-d');

        // Build query
        $query = DailyConsumption::with(['user.district', 'user.zone'])
            ->whereBetween('date', [$dateFrom, $dateTo]);

        // Apply filters
        if ($request->filled('district_id')) {
            $query->whereHas('report.user', function($q) use ($request) {
                $q->where('district_id', $request->district_id);
            });
        }

        if ($request->filled('zone_id')) {
            $query->whereHas('report.user', function($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        if ($request->filled('school_type') && $request->school_type !== 'all') {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('school_type', $request->school_type);
            });
        }

        if ($request->filled('school_id')) {
            $query->where('user_id', $request->school_id);
        }

        $consumptions = $query->orderBy('date', 'desc')
                             ->paginate(50)
                             ->withQueryString();

        // Calculate aggregations
        $aggregations = DailyConsumption::whereBetween('date', [$dateFrom, $dateTo])
            ->when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->when($request->filled('zone_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('zone_id', $request->zone_id);
                });
            })
            ->when($request->filled('school_type') && $request->school_type !== 'all', function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('school_type', $request->school_type);
                });
            })
            ->when($request->filled('school_id'), function($q) use ($request) {
                $q->where('user_id', $request->school_id);
            })
            ->selectRaw('
                COUNT(*) as total_entries,
                SUM(served_primary + served_middle) as total_students,
                SUM(rice_consumed) as total_rice,
                SUM(amount_consumed) as total_amount,
                AVG(rice_consumed) as avg_daily_rice
            ')
            ->first();

        // Day-wise breakdown
        $dayWiseBreakdown = DailyConsumption::whereBetween('date', [$dateFrom, $dateTo])
            ->when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->when($request->filled('zone_id'), function($q) use ($request) {
                $q->whereHas('user', function($subQ) use ($request) {
                    $subQ->where('zone_id', $request->zone_id);
                });
            })
            ->selectRaw('
                DAYNAME(date) as day_name,
                COUNT(DISTINCT user_id) as schools_count,
                SUM(served_primary + served_middle) as students_served,
                SUM(rice_consumed) as rice_consumed,
                SUM(amount_consumed) as amount_spent
            ')
            ->groupBy('day_name')
            ->orderByRaw("FIELD(day_name, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->get();

        // Get districts, zones, and schools for filters
        $districts = District::orderBy('state')->orderBy('name')->get();
        $zones = [];
        $schools = [];
        
        if ($request->filled('district_id')) {
            $zones = Zone::where('district_id', $request->district_id)
                        ->orderBy('name')
                        ->get();
                        
            $schoolsQuery = User::schools()
                ->where('district_id', $request->district_id);
                
            if ($request->filled('zone_id')) {
                $schoolsQuery->where('zone_id', $request->zone_id);
            }
            
            $schools = $schoolsQuery->orderBy('school_name')->get();
        }

        return Inertia::render('Admin/Reports/DailyConsumptions/Index', [
            'consumptions' => $consumptions,
            'aggregations' => $aggregations,
            'dayWiseBreakdown' => $dayWiseBreakdown,
            'districts' => $districts,
            'zones' => $zones,
            'schools' => $schools,
            'filters' => array_merge(
                $request->only(['district_id', 'zone_id', 'school_type', 'school_id']),
                ['date_from' => $dateFrom, 'date_to' => $dateTo]
            ),
        ]);
    }

    /**
     * Display all bills across schools.
     * 
     * GET /admin/bills
     */
    public function billsIndex(Request $request): Response
    {
        // Validate filters
        $request->validate([
            'district_id' => 'nullable|exists:districts,id',
            'zone_id' => 'nullable|exists:zones,id',
            'year' => 'nullable|integer|min:2020',
            'month' => 'nullable|integer|min:1|max:12',
            'type' => 'nullable|in:kiryana,fuel,all',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'shop_name' => 'nullable|string|max:255',
        ]);

        // Build query
        $query = Bill::with(['report.user.district', 'report.user.zone', 'creator']);

        // Apply filters
        if ($request->filled('district_id')) {
            $query->whereHas('report.user', function($q) use ($request) {
                $q->where('district_id', $request->district_id);
            });
        }

        if ($request->filled('zone_id')) {
            $query->whereHas('report.user', function($q) use ($request) {
                $q->where('zone_id', $request->zone_id);
            });
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }

        if ($request->filled('shop_name')) {
            $query->where('shop_name', 'like', '%' . $request->shop_name . '%');
        }

        $bills = $query->orderBy('created_at', 'desc')
                      ->paginate(20)
                      ->withQueryString();

        // Calculate aggregations
        $aggregations = Bill::when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('report.user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->when($request->filled('zone_id'), function($q) use ($request) {
                $q->whereHas('report.user', function($subQ) use ($request) {
                    $subQ->where('zone_id', $request->zone_id);
                });
            })
            ->when($request->filled('year'), function($q) use ($request) {
                $q->where('year', $request->year);
            })
            ->when($request->filled('month'), function($q) use ($request) {
                $q->where('month', $request->month);
            })
            ->when($request->filled('type') && $request->type !== 'all', function($q) use ($request) {
                $q->where('type', $request->type);
            })
            ->selectRaw('
                COUNT(*) as total_bills,
                SUM(total_amount) as total_amount,
                AVG(total_amount) as avg_bill_amount,
                SUM(CASE WHEN type = "kiryana" THEN total_amount ELSE 0 END) as kiryana_total,
                SUM(CASE WHEN type = "fuel" THEN total_amount ELSE 0 END) as fuel_total
            ')
            ->first();

        // Vendor breakdown (top 10)
        $vendorBreakdown = Bill::when($request->filled('district_id'), function($q) use ($request) {
                $q->whereHas('report.user', function($subQ) use ($request) {
                    $subQ->where('district_id', $request->district_id);
                });
            })
            ->selectRaw('
                shop_name,
                COUNT(*) as bills_count,
                SUM(total_amount) as total_amount
            ')
            ->groupBy('shop_name')
            ->orderBy('total_amount', 'desc')
            ->limit(10)
            ->get();

        // Get districts and zones
        $districts = District::orderBy('state')->orderBy('name')->get();
        $zones = [];
        
        if ($request->filled('district_id')) {
            $zones = Zone::where('district_id', $request->district_id)
                        ->orderBy('name')
                        ->get();
        }

        return Inertia::render('Admin/Reports/Bills/Index', [
            'bills' => $bills,
            'aggregations' => $aggregations,
            'vendorBreakdown' => $vendorBreakdown,
            'districts' => $districts,
            'zones' => $zones,
            'filters' => $request->only([
                'district_id', 'zone_id', 'year', 'month', 
                'type', 'min_amount', 'max_amount', 'shop_name'
            ]),
        ]);
    }

    /**
     * Display single bill.
     * 
     * GET /admin/bills/{billId}
     */
    public function billShow(int $billId): Response
    {
        $bill = Bill::with(['report.user.district', 'report.user.zone', 'creator', 'items'])->findOrFail($billId);

        return Inertia::render('Admin/Reports/Bills/Show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Export rice reports to CSV.
     * 
     * GET /admin/export/rice-reports
     */
    public function exportRiceReports(Request $request)
    {
        // Apply same filters as index
        $query = RiceReport::with(['user.district', 'user.zone']);
        
        // ... apply all filters (same logic as riceReportsIndex)

        $reports = $query->orderBy('year', 'desc')->orderBy('month', 'desc')->get();

        $filename = 'rice_reports_export_' . date('Y-m-d') . '.csv';

        return FacadeResponse::streamDownload(function() use ($reports) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'School Name', 'UDISE', 'District', 'Zone', 'Month', 'Year',
                'Opening Balance (kg)', 'Consumed (kg)', 'Closing Balance (kg)',
                'Primary Students', 'Middle Students', 'Total Students', 'Serving Days'
            ]);

            foreach ($reports as $report) {
                fputcsv($handle, [
                    $report->user->school_name ?? '',
                    $report->user->udise ?? '',
                    $report->user->district->name ?? '',
                    $report->user->zone->name ?? '',
                    $report->month,
                    $report->year,
                    $report->opening_balance,
                    $report->total_rice_consumed,
                    $report->closing_balance,
                    $report->primary_students,
                    $report->middle_students,
                    $report->total_students,
                    $report->serving_days,
                ]);
            }

            // Add summary row
            fputcsv($handle, []);
            fputcsv($handle, [
                'TOTALS',
                '',
                '',
                '',
                '',
                '',
                $reports->sum('opening_balance'),
                $reports->sum('total_rice_consumed'),
                $reports->sum('closing_balance'),
                $reports->sum('primary_students'),
                $reports->sum('middle_students'),
                $reports->sum('total_students'),
                '',
            ]);

            fclose($handle);
        }, $filename);
    }

    // Similar export methods for amount reports, consumptions, and bills...
}