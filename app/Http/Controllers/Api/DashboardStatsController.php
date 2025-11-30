<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DailyConsumption;
use App\Models\RiceReport;
use App\Models\AmountReport;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardStatsController extends Controller
{
    /**
     * Return real-time dashboard statistics.
     */
    public function index()
    {
        try {
            // Count of unique schools (users) with at least one consumption record
            $enrolledSchools = User::has('dailyConsumptions')->count() ?? 0;

            // Reports generated
            $riceReportsGenerated = RiceReport::count() ?? 0;
            $amountReportsGenerated = AmountReport::count() ?? 0;

            // Bills
            $kiryanaaBills = Bill::where('bill_type', 'kiryana')->count() ?? 0;
            $fuelBills = Bill::where('bill_type', 'fuel')->count() ?? 0;

            // Students served (sum of primary + middle columns)
            $totalStudentsServed = DailyConsumption::sum(
                DB::raw('(served_primary + served_middle)')
            ) ?? 0;

            // Active users (users who logged in within last 30 days)
            $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count() ?? 0;

            // Rice distributed (sum of total rice consumed in quintals) - safe division
            $riceKg = RiceReport::sum('total_rice') ?? 0;
            $riceDistributed = $riceKg > 0 ? round($riceKg / 100) : 0; // convert kg to quintals

            return response()->json([
                'success' => true,
                'data' => [
                    'enrolledSchools' => (int) $enrolledSchools,
                    'riceReportsGenerated' => (int) $riceReportsGenerated,
                    'amountReportsGenerated' => (int) $amountReportsGenerated,
                    'kiryanaaBills' => (int) $kiryanaaBills,
                    'fuelBills' => (int) $fuelBills,
                    'totalStudentsServed' => (int) $totalStudentsServed,
                    'activeUsers' => (int) $activeUsers,
                    'riceDistributed' => (int) round($riceDistributed),
                    'lastUpdated' => now()->toIso8601String()
                ]
            ]);
        } catch (\Throwable $e) {
            \Log::error('DashboardStatsController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [
                    'enrolledSchools' => 0,
                    'riceReportsGenerated' => 0,
                    'amountReportsGenerated' => 0,
                    'kiryanaaBills' => 0,
                    'fuelBills' => 0,
                    'totalStudentsServed' => 0,
                    'activeUsers' => 0,
                    'riceDistributed' => 0,
                    'lastUpdated' => now()->toIso8601String()
                ]
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
