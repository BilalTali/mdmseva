<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\AmountReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class BillController extends Controller
{
    /**
     * Display a listing of bills for a specific report
     */
    public function index(AmountReport $amountReport)
    {
        $user = Auth::user();

        // Authorization check
        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        // Get all bills with items
        $bills = $amountReport->bills()
            ->with('items')
            ->latest()
            ->get()
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'bill_number' => $bill->getBillNumber(),
                    'type' => $bill->type,
                    'type_label' => $bill->getTypeLabel(),
                    'shop_name' => $bill->shop_name,
                    'shopkeeper_name' => $bill->shopkeeper_name,
                    'phone' => $bill->phone,
                    'address' => $bill->address,
                    'total_amount' => (float) $bill->total_amount,
                    'formatted_total' => $bill->getFormattedTotal(),
                    'items_count' => $bill->items->count(),
                    'created_at' => $bill->created_at->format('M d, Y'),
                    'created_at_human' => $bill->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Bills/Index', [
            'report' => [
                'id' => $amountReport->id,
                'period' => $amountReport->period,
                'month' => $amountReport->month,
                'year' => $amountReport->year,
            ],
            'bills' => $bills,
            'hasKiryanaBill' => $amountReport->hasKiryanaBill(),
            'hasFuelBill' => $amountReport->hasFuelBill(),
        ]);
    }

    /**
     * Show the form for creating a new bill
     */
    public function create(AmountReport $amountReport, string $type)
    {
        $user = Auth::user();

        // Authorization check
        if ($amountReport->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        // Validate bill type
        if (!in_array($type, ['kiryana', 'fuel'])) {
            abort(404, 'Invalid bill type.');
        }

        // Prepare pre-filled items based on bill type and report data
        $items = $this->getPrefillItems($amountReport, $type);

        return Inertia::render('Bills/Create', [
            'report' => [
                'id' => $amountReport->id,
                'period' => $amountReport->period,
                'month' => $amountReport->month,
                'year' => $amountReport->year,
                'month_name' => $amountReport->month_name,
            ],
            'billType' => $type,
            'billTypeLabel' => $type === 'kiryana' ? 'Kiryana (Groceries)' : 'Fuel',
            'prefillItems' => $items,
            'saltPercentages' => $amountReport->salt_percentages_used,
            'schoolType' => $user->school_type,
            'hasPrimary' => $user->hasPrimaryStudents(),
            'hasMiddle' => $user->hasMiddleStudents(),
        ]);
    }

    /**
     * Store a newly created bill in storage
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validate request
        $validated = $request->validate(Bill::getValidationRules());

        // Verify report ownership
        $report = AmountReport::findOrFail($validated['amount_report_id']);
        if ($report->user_id !== $user->id) {
            abort(403, 'Unauthorized access to report.');
        }

        try {
            DB::beginTransaction();

            // Calculate total amount from items
            $totalAmount = collect($validated['items'])
                ->sum(fn($item) => $item['amount']);

            // Create the bill
            $bill = Bill::create([
                'amount_report_id' => $validated['amount_report_id'],
                'created_by' => $user->id,
                'type' => $validated['type'],
                'shop_name' => $validated['shop_name'],
                'shopkeeper_name' => $validated['shopkeeper_name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? null,
                'total_amount' => $totalAmount,
            ]);

            // Create bill items
            foreach ($validated['items'] as $itemData) {
                BillItem::create([
                    'bill_id' => $bill->id,
                    'item_name' => $itemData['item_name'],
                    'amount' => $itemData['amount'],
                    'rate_per_unit' => $itemData['rate_per_unit'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'],
                ]);
            }

            DB::commit();

            Log::info('Bill created successfully', [
                'user_id' => $user->id,
                'bill_id' => $bill->id,
                'report_id' => $report->id,
                'type' => $bill->type,
                'total_amount' => $bill->total_amount,
            ]);

            return redirect()
                ->route('bills.show', $bill->id)
                ->with('success', 'Bill created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create bill', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create bill: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified bill
     */
    public function show(Bill $bill)
    {
        $user = Auth::user();

        // Authorization check via report
        $report = $bill->report;
        if ($report->user_id !== $user->id) {
            abort(403, 'Unauthorized access to bill.');
        }

        // Load items
        $bill->load('items');

        return Inertia::render('Bills/Show', [
            'bill' => [
                'id' => $bill->id,
                'bill_number' => $bill->getBillNumber(),
                'type' => $bill->type,
                'type_label' => $bill->getTypeLabel(),
                'shop_name' => $bill->shop_name,
                'shopkeeper_name' => $bill->shopkeeper_name,
                'phone' => $bill->phone,
                'address' => $bill->address,
                'total_amount' => (float) $bill->total_amount,
                'formatted_total' => $bill->getFormattedTotal(),
                'created_at' => $bill->created_at->format('M d, Y h:i A'),
                'created_at_human' => $bill->created_at->diffForHumans(),
                'items' => $bill->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'amount' => (float) $item->amount,
                        'rate_per_unit' => (float) $item->rate_per_unit,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit,
                        'formatted_amount' => $item->getFormattedAmount(),
                        'formatted_rate' => $item->getFormattedRate(),
                        'formatted_quantity' => $item->getFormattedQuantity(),
                    ];
                }),
            ],
            'report' => [
                'id' => $report->id,
                'period' => $report->period,
                'month' => $report->month,
                'year' => $report->year,
            ],
            'user' => [
                'name' => $user->name,
                'school_name' => $user->school_name,
                'udise' => $user->udise,
            ],
        ]);
    }

    public function viewPdf(Bill $bill)
    {
        $user = Auth::user();
        $report = $bill->report;
        if ($report->user_id !== $user->id) {
            abort(403, 'Unauthorized access to bill.');
        }
        $bill->load('items');
        return Inertia::render('Bills/ViewPdf', [
            'bill' => [
                'id' => $bill->id,
                'bill_number' => $bill->getBillNumber(),
                'type' => $bill->type,
                'type_label' => $bill->getTypeLabel(),
                'shop_name' => $bill->shop_name,
                'shopkeeper_name' => $bill->shopkeeper_name,
                'phone' => $bill->phone,
                'address' => $bill->address,
                'total_amount' => (float) $bill->total_amount,
                'formatted_total' => $bill->getFormattedTotal(),
                'items' => $bill->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'amount' => (float) $item->amount,
                        'rate_per_unit' => (float) $item->rate_per_unit,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit,
                        'formatted_amount' => $item->getFormattedAmount(),
                        'formatted_rate' => $item->getFormattedRate(),
                        'formatted_quantity' => $item->getFormattedQuantity(),
                    ];
                }),
            ],
            'report' => [
                'id' => $report->id,
                'period' => $report->period,
                'month' => $report->month,
                'year' => $report->year,
            ],
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ],
        ]);
    }

    /**
     * Generate and download PDF for the specified bill
     */
    public function generatePdf(Request $request, Bill $bill)
    {
        $user = Auth::user();

        // Authorization check via report
        $report = $bill->report;
        if ($report->user_id !== $user->id) {
            abort(403, 'Unauthorized access to bill.');
        }

        try {
            // Load items
            $bill->load('items');

            $theme = $request->query('theme', 'bw');
            $preview = filter_var($request->query('preview', false), FILTER_VALIDATE_BOOLEAN);
            $download = filter_var($request->query('download', false), FILTER_VALIDATE_BOOLEAN);

            $themeCss = $this->getThemeCss($theme);

            $data = [
                'bill' => $bill,
                'report' => $report,
                'user' => $user,
                'themeCss' => $themeCss,
                'generated_at' => now()->format('d/m/Y'),
            ];

            $pdf = Pdf::loadView('bills.pdf', $data);
            $pdf->setPaper('a4', 'portrait');

            $filename = sprintf(
                'bill-%s-%s-%s.pdf',
                $bill->type,
                $report->formatted_period,
                strtolower(str_replace(' ', '-', $user->name))
            );

            Log::info('Bill PDF generated', [
                'user_id' => $user->id,
                'bill_id' => $bill->id,
                'filename' => $filename,
                'theme' => $theme,
            ]);

            // Simple, predictable behavior:
            //  - preview=1  => inline stream
            //  - download=1 => forced download
            //  - default    => inline stream
            if ($preview) {
                $response = $pdf->stream($filename);
                $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
                return $response;
            }
            if ($download) {
                return $pdf->download($filename);
            }
            $response = $pdf->stream($filename);
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            return $response;

        } catch (\Exception $e) {
            Log::error('Failed to generate bill PDF', [
                'user_id' => $user->id,
                'bill_id' => $bill->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified bill from storage
     */
    public function destroy(Bill $bill)
    {
        $user = Auth::user();

        // Authorization check via report
        $report = $bill->report;
        if ($report->user_id !== $user->id) {
            abort(403, 'Unauthorized access to bill.');
        }

        try {
            $billNumber = $bill->getBillNumber();
            $billType = $bill->getTypeLabel();

            $bill->delete();

            Log::info('Bill deleted', [
                'user_id' => $user->id,
                'bill_id' => $bill->id,
                'bill_number' => $billNumber,
            ]);

            return redirect()
                ->route('bills.index', $report->id)
                ->with('success', "{$billType} bill {$billNumber} deleted successfully!");

        } catch (\Exception $e) {
            Log::error('Failed to delete bill', [
                'user_id' => $user->id,
                'bill_id' => $bill->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete bill: ' . $e->getMessage());
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Format amount to 2 decimal places without rounding up (truncate/floor)
     */
    private function formatAmount(float $amount): float
    {
        return floor($amount * 100) / 100;
    }

    /**
     * Get pre-filled items based on bill type and report data
     */
    private function getPrefillItems(AmountReport $report, string $type): array
    {
        $user = Auth::user();
        $items = [];

        if ($type === 'kiryana') {
            // Kiryana items: Pulses, Vegetables, Oil, Salt (5 subcategories)
            $primaryTotal = $report->hasPrimaryData();
            $middleTotal = $report->hasMiddleData();

            // Pulses
            $pulsesAmount = 0;
            if ($primaryTotal) $pulsesAmount += $report->total_primary_pulses;
            if ($middleTotal) $pulsesAmount += $report->total_middle_pulses;
            
            if ($pulsesAmount > 0) {
                $items[] = [
                    'item_name' => 'Pulses',
                    'amount' => $this->formatAmount($pulsesAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Vegetables
            $vegetablesAmount = 0;
            if ($primaryTotal) $vegetablesAmount += $report->total_primary_vegetables;
            if ($middleTotal) $vegetablesAmount += $report->total_middle_vegetables;
            
            if ($vegetablesAmount > 0) {
                $items[] = [
                    'item_name' => 'Vegetables',
                    'amount' => $this->formatAmount($vegetablesAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Oil
            $oilAmount = 0;
            if ($primaryTotal) $oilAmount += $report->total_primary_oil;
            if ($middleTotal) $oilAmount += $report->total_middle_oil;
            
            if ($oilAmount > 0) {
                $items[] = [
                    'item_name' => 'Oil',
                    'amount' => $this->formatAmount($oilAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'litre',
                ];
            }

            // Common Salt
            $commonSaltAmount = 0;
            if ($primaryTotal) $commonSaltAmount += $report->total_primary_common_salt;
            if ($middleTotal) $commonSaltAmount += $report->total_middle_common_salt;

            if ($commonSaltAmount > 0) {
                $items[] = [
                    'item_name' => 'Common Salt',
                    'amount' => $this->formatAmount($commonSaltAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Chilli Powder
            $chilliAmount = 0;
            if ($primaryTotal) $chilliAmount += $report->total_primary_chilli_powder;
            if ($middleTotal) $chilliAmount += $report->total_middle_chilli_powder;

            if ($chilliAmount > 0) {
                $items[] = [
                    'item_name' => 'Chilli Powder',
                    'amount' => $this->formatAmount($chilliAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Turmeric
            $turmericAmount = 0;
            if ($primaryTotal) $turmericAmount += $report->total_primary_turmeric;
            if ($middleTotal) $turmericAmount += $report->total_middle_turmeric;

            if ($turmericAmount > 0) {
                $items[] = [
                    'item_name' => 'Turmeric',
                    'amount' => $this->formatAmount($turmericAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Coriander
            $corianderAmount = 0;
            if ($primaryTotal) $corianderAmount += $report->total_primary_coriander;
            if ($middleTotal) $corianderAmount += $report->total_middle_coriander;

            if ($corianderAmount > 0) {
                $items[] = [
                    'item_name' => 'Coriander',
                    'amount' => $this->formatAmount($corianderAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

            // Other Condiments
            $otherAmount = 0;
            if ($primaryTotal) $otherAmount += $report->total_primary_other_condiments;
            if ($middleTotal) $otherAmount += $report->total_middle_other_condiments;

            if ($otherAmount > 0) {
                $items[] = [
                    'item_name' => 'Other Condiments',
                    'amount' => $this->formatAmount($otherAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }

        } elseif ($type === 'fuel') {
            // Fuel items
            $fuelAmount = 0;
            if ($report->hasPrimaryData()) $fuelAmount += $report->total_primary_fuel;
            if ($report->hasMiddleData()) $fuelAmount += $report->total_middle_fuel;

            if ($fuelAmount > 0) {
                $items[] = [
                    'item_name' => 'Fuel (LPG/Wood)',
                    'amount' => $this->formatAmount($fuelAmount),
                    'rate_per_unit' => 0,
                    'quantity' => 0,
                    'unit' => 'kg',
                ];
            }
        }

        return $items;
    }

    /**
     * Get theme-specific CSS for PDF styling
     */
    private function getThemeCss(string $theme): string
    {
        $themes = [
            'bw' => '',
            'blue' => '
                h2, h3, h4 { color: #1e40af; }
                .bill-header { background-color: #eff6ff; }
                .section-title { background-color: #dbeafe; color: #1e3a8a; }
                th { background-color: #dbeafe; }
            ',
            'green' => '
                h2, h3, h4 { color: #166534; }
                .bill-header { background-color: #f0fdf4; }
                .section-title { background-color: #dcfce7; color: #14532d; }
                th { background-color: #dcfce7; }
            ',
            'purple' => '
                h2, h3, h4 { color: #6b21a8; }
                .bill-header { background-color: #faf5ff; }
                .section-title { background-color: #f3e8ff; color: #581c87; }
                th { background-color: #f3e8ff; }
            ',
        ];

        return $themes[$theme] ?? '';
    }
}