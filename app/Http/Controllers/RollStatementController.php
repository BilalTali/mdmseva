<?php
// Location: app/Http/Controllers/RollStatementController.php

namespace App\Http\Controllers;

use App\Models\RollStatement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class RollStatementController extends Controller
{
    /**
     * Display a listing of the roll statements.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        $userUdise = $user->udise_code ?? $user->udise;
        
        $user->loadMissing(['district', 'zone']);
        $userUdise = $user->udise_code ?? $user->udise;
        $query = RollStatement::where('udise', $userUdise);

        // Apply filters
        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('academic_year')) {
            $query->academicYear($request->academic_year);
        }

        if ($request->has('month')) {
            $query->month($request->month);
        }

        // Get all results (we'll handle pagination after grouping)
        $allStatements = $query->orderBy('date', 'desc')
                               ->orderBy('class', 'asc')
                               ->get();

        // Transform to simple array format
        $statements = $allStatements->map(function ($statement) {
            return [
                'id' => $statement->id,
                'date' => $statement->date->format('Y-m-d'),
                'udise' => $statement->udise,
                'academic_year' => $statement->academic_year,
                'class' => $statement->class,
                'boys' => $statement->boys,
                'girls' => $statement->girls,
                'total' => $statement->total,
                'last_updated_at' => $statement->last_updated_at?->format('d-m-Y H:i'),
                'updated_by_name' => $statement->updated_by_name,
            ];
        });

        return Inertia::render('RollStatements/Index', [
            'rollStatements' => [
                'data' => $statements->values()->toArray(),
                'links' => null,
            ],
            'filters' => [
                'search' => $request->search,
                'academic_year' => $request->academic_year,
                'month' => $request->month,
            ],
            'schoolInfo' => [
                'state' => $user->state ?? $user->district?->state,
                'district' => $user->district?->name ?? $user->district,
                'zone' => $user->zone?->name ?? $user->zone,
                'school_name' => $user->school_name,
                'udise_code' => $userUdise,
            ],
        ]);
    }

    /**
     * Show the form for creating a new roll statement.
     */
    public function create()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        $userUdise = $user->udise_code ?? $user->udise;
        
        // Fetch the most recent date for which we have statements
        $latestDateStatement = RollStatement::where('udise', $userUdise)
            ->orderBy('date', 'desc')
            ->first();

        $previousMonthData = null;

        if ($latestDateStatement) {
            // Get all statements for this latest date (to get all classes)
            $latestStatements = RollStatement::where('udise', $userUdise)
                ->where('date', $latestDateStatement->date)
                ->orderBy('class')
                ->get();

            if ($latestStatements->isNotEmpty()) {
                $previousMonthData = [
                    'month_name' => $latestDateStatement->month_name, // Uses the accessor
                    'academic_year' => $latestDateStatement->academic_year,
                    'date' => $latestDateStatement->date->format('Y-m-d'),
                    'entries' => $latestStatements->map(function ($stmt) {
                        return [
                            'class' => $stmt->class,
                            'boys' => $stmt->boys,
                            'girls' => $stmt->girls,
                        ];
                    })->values(),
                ];
            }
        }

        return Inertia::render('RollStatements/Create', [
            'academic_years' => $this->getAcademicYears(),
            'classes' => $this->getClasses(),
            'user_udise' => $userUdise,
            'school_name' => $user->school_name,
            'school_type' => $user->school_type ?? 'primary',
            'previous_month_data' => $previousMonthData,
        ]);
    }

    /**
     * Store a newly created roll statement in storage.
     */
    public function store(Request $request)
    {
        // Check if it's a bulk submission
        if ($request->boolean('is_bulk') && $request->has('entries')) {
            $request->validate([
                'date' => 'required|date',
                'udise' => ['required', 'digits:11'],
                'academic_year' => 'required|string|max:20',
                'entries' => 'required|array|min:1',
                'entries.*.class' => 'required|string|max:10',
                'entries.*.boys' => 'required|integer|min:0',
                'entries.*.girls' => 'required|integer|min:0',
            ]);

            $savedCount = 0;
            $skippedCount = 0;
            $errors = [];
            
            foreach ($request->entries as $entry) {
                // Check if roll statement already exists for this date, academic year, and class
                $exists = RollStatement::where('date', $request->date)
                                      ->where('academic_year', $request->academic_year)
                                      ->where('udise', $request->udise)
                                      ->where('class', $entry['class'])
                                      ->exists();

                if ($exists) {
                    $skippedCount++;
                    $label = $entry['class_label'] ?? $entry['class'] ?? 'class';
                    $errors[] = "Skipped {$label} - already exists for this date";
                    continue;
                }

                RollStatement::create([
                    'date' => $request->date,
                    'udise' => $request->udise,
                    'academic_year' => $request->academic_year,
                    'user_id' => Auth::id(),
                    'class' => $entry['class'],
                    'boys' => $entry['boys'],
                    'girls' => $entry['girls'],
                    'total' => $entry['boys'] + $entry['girls'],
                ]);
                $savedCount++;
            }

            $message = "Successfully saved {$savedCount} class " . ($savedCount === 1 ? 'entry' : 'entries');
            
            if ($skippedCount > 0) {
                $message .= ". {$skippedCount} " . ($skippedCount === 1 ? 'entry was' : 'entries were') . " skipped (already exist).";
            }

            return redirect()->route('roll-statements.index')
                ->with('success', $message)
                ->with('warnings', $errors);
        }
        
        // Original single entry logic
        $validated = $request->validate([
            'date' => 'required|date',
            'udise' => ['required', 'digits:11'],
            'academic_year' => 'required|string|max:20',
            'class' => 'required|string|max:10',
            'boys' => 'required|integer|min:0',
            'girls' => 'required|integer|min:0',
        ]);

        // Check if roll statement already exists for this date, academic year, and class
        $exists = RollStatement::where('date', $validated['date'])
                              ->where('academic_year', $validated['academic_year'])
                              ->where('udise', $validated['udise'])
                              ->where('class', $validated['class'])
                              ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'A roll statement for this date, academic year, and class already exists.'
            ]);
        }

        $validated['user_id'] = Auth::id();
        $validated['total'] = $validated['boys'] + $validated['girls'];

        RollStatement::create($validated);

        return redirect()->route('roll-statements.index')
            ->with('success', 'Roll statement created successfully.');
    }

    /**
     * Display the specified roll statement.
     */
    public function show(RollStatement $rollStatement)
    {
        // Fetch all statements for the same date and academic year
        $statements = RollStatement::where('date', $rollStatement->date)
            ->where('academic_year', $rollStatement->academic_year)
            ->where('udise', $rollStatement->udise)
            ->orderBy('class')
            ->get();

        return Inertia::render('RollStatements/Show', [
            'statements' => $statements->map(function ($stmt) {
                return [
                    'id' => $stmt->id,
                    'date' => $stmt->date->format('Y-m-d'),
                    'formatted_date' => $stmt->formatted_date,
                    'udise' => $stmt->udise,
                    'academic_year' => $stmt->academic_year,
                    'class' => $stmt->class,
                    'class_label' => $stmt->class_label,
                    'boys' => $stmt->boys,
                    'girls' => $stmt->girls,
                    'total' => $stmt->total,
                    'month_name' => $stmt->month_name,
                    'last_updated_at' => $stmt->formatted_last_updated,
                    'updated_by_name' => $stmt->updated_by_name,
                ];
            }),
            'date' => $rollStatement->date->format('Y-m-d'),
            'academic_year' => $rollStatement->academic_year,
            'school_info' => [
                'name' => $rollStatement->user->school_name ?? 'Unknown School',
                'udise' => $rollStatement->udise,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified roll statement.
     */
    public function edit(RollStatement $rollStatement)
    {
        // No lock check - allow editing anytime
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        // Fetch all statements for the same date and academic year
        $statements = RollStatement::where('date', $rollStatement->date)
            ->where('academic_year', $rollStatement->academic_year)
            ->where('udise', $rollStatement->udise)
            ->orderBy('class')
            ->get();

        return Inertia::render('RollStatements/Create', [
            'existing_statements' => $statements->map(function ($stmt) {
                return [
                    'id' => $stmt->id,
                    'date' => $stmt->date->format('Y-m-d'),
                    'udise' => $stmt->udise,
                    'academic_year' => $stmt->academic_year,
                    'class' => $stmt->class,
                    'boys' => $stmt->boys,
                    'girls' => $stmt->girls,
                    'last_updated_at' => $stmt->formatted_last_updated,
                    'updated_by_name' => $stmt->updated_by_name,
                ];
            }),
            'academic_years' => $this->getAcademicYears(),
            'classes' => $this->getClasses(),
            'school_type' => $user->school_type ?? 'primary',
            'user_udise' => $user->udise_code ?? $user->udise,
            'school_name' => $user->school_name,
        ]);
    }

    /**
     * Update the specified roll statement in storage.
     */
    public function update(Request $request, RollStatement $rollStatement)
    {
        // Check if it's a bulk update
        if ($request->boolean('is_bulk') && $request->has('entries')) {
            $request->validate([
                'date' => 'required|date',
                'udise' => ['required', 'digits:11'],
                'academic_year' => 'required|string|max:20',
                'entries' => 'required|array|min:1',
                'entries.*.class' => 'required|string|max:10',
                'entries.*.boys' => 'required|integer|min:0',
                'entries.*.girls' => 'required|integer|min:0',
            ]);

            // Get the original statement to verify date and academic year
            $originalStatement = RollStatement::findOrFail($rollStatement->id);
            
            // Verify that date and academic year haven't changed (they should be disabled in frontend)
            if ($request->date !== $originalStatement->date->format('Y-m-d') || 
                $request->academic_year !== $originalStatement->academic_year) {
                return back()->withErrors([
                    'date' => 'Cannot change date or academic year when updating a roll statement.'
                ])->withInput();
            }

            $updatedCount = 0;
            $createdCount = 0;
            
            foreach ($request->entries as $entry) {
                // Try to find existing entry for this class
                $statement = RollStatement::where('date', $request->date)
                    ->where('academic_year', $request->academic_year)
                    ->where('class', $entry['class'])
                    ->where('udise', $request->udise)
                    ->first();

                $data = [
                    'boys' => $entry['boys'],
                    'girls' => $entry['girls'],
                    'total' => $entry['boys'] + $entry['girls'],
                ];

                if ($statement) {
                    // Update existing entry
                    $statement->update($data);
                    $updatedCount++;
                } else {
                    // Create new entry (in case new classes were added)
                    RollStatement::create([
                        'date' => $request->date,
                        'udise' => $request->udise,
                        'academic_year' => $request->academic_year,
                        'user_id' => Auth::id(),
                        'class' => $entry['class'],
                        'boys' => $entry['boys'],
                        'girls' => $entry['girls'],
                        'total' => $entry['boys'] + $entry['girls'],
                    ]);
                    $createdCount++;
                }
            }

            $message = "Successfully updated roll statement";
            if ($updatedCount > 0) {
                $message .= " ({$updatedCount} " . ($updatedCount === 1 ? 'entry' : 'entries') . " updated";
            }
            if ($createdCount > 0) {
                $message .= ($updatedCount > 0 ? ', ' : ' (') . "{$createdCount} new " . ($createdCount === 1 ? 'entry' : 'entries') . " added";
            }
            $message .= ")";

            return redirect()->route('roll-statements.index')
                ->with('success', $message);
        }

        // Original single entry update - no lock check, allow editing anytime
        $validated = $request->validate([
            'date' => 'required|date',
            'udise' => ['required', 'digits:11'],
            'academic_year' => 'required|string|max:20',
            'class' => 'required|string|max:10',
            'boys' => 'required|integer|min:0',
            'girls' => 'required|integer|min:0',
        ]);

        // Check if roll statement already exists for this date, academic year, and class (excluding current)
        $exists = RollStatement::where('date', $validated['date'])
                              ->where('academic_year', $validated['academic_year'])
                              ->where('class', $validated['class'])
                              ->where('udise', $validated['udise'])
                              ->where('id', '!=', $rollStatement->id)
                              ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'A roll statement for this date, academic year, and class already exists.'
            ]);
        }

        $validated['total'] = $validated['boys'] + $validated['girls'];

        $rollStatement->update($validated);

        return redirect()
            ->route('roll-statements.index')
            ->with('success', 'Roll statement updated successfully.');
    }

    /**
     * Remove the specified roll statement from storage.
     */
    public function destroy(RollStatement $rollStatement)
    {
        // No lock check - allow deletion anytime
        $rollStatement->delete();

        return redirect()
            ->route('roll-statements.index')
            ->with('success', 'Roll statement deleted successfully.');
    }



    /**
     * Download the roll statement as PDF.
     */
    public function downloadPDF(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        $userUdise = $user->udise_code ?? $user->udise;

        // Get date and academic_year from query parameters
        $date = $request->query('date');
        $academicYear = $request->query('academic_year');
        
        if (!$date || !$academicYear) {
            return back()->with('error', 'Date and Academic Year are required.');
        }
        
        // Get all roll statements for this date and academic year
        $rollStatements = RollStatement::where('udise', $userUdise)
            ->where('date', $date)
            ->where('academic_year', $academicYear)
            ->get();
        
        if ($rollStatements->isEmpty()) {
            return back()->with('error', 'No roll statements found for this date and academic year.');
        }
        
        // Define class categories based on school type
        $schoolType = $user->school_type ?? 'primary';
        
        switch($schoolType) {
            case 'primary':
                $primaryClasses = ['kg', '1', '2', '3', '4', '5'];
                $upperPrimaryClasses = [];
                break;
            case 'middle':
                $primaryClasses = ['kg', '1', '2', '3', '4', '5'];
                $upperPrimaryClasses = ['6', '7', '8'];
                break;
            case 'secondary':
                $primaryClasses = ['6', '7', '8'];
                $upperPrimaryClasses = ['9', '10'];
                break;
            case 'senior_secondary':
                $primaryClasses = ['6', '7', '8', '9', '10'];
                $upperPrimaryClasses = ['11', '12'];
                break;
            default:
                $primaryClasses = ['kg', '1', '2', '3', '4', '5'];
                $upperPrimaryClasses = [];
        }
        
        // Calculate totals
        $primaryStatements = $rollStatements->filter(function($s) use ($primaryClasses) {
            return in_array(strtolower($s->class), $primaryClasses);
        });
        
        $upperPrimaryStatements = $rollStatements->filter(function($s) use ($upperPrimaryClasses) {
            return in_array(strtolower($s->class), $upperPrimaryClasses);
        });
        
        $primaryTotalBoys = $primaryStatements->sum('boys');
        $primaryTotalGirls = $primaryStatements->sum('girls');
        $primaryGrandTotal = $primaryStatements->sum('total');
        
        $upperPrimaryTotalBoys = $upperPrimaryStatements->sum('boys');
        $upperPrimaryTotalGirls = $upperPrimaryStatements->sum('girls');
        $upperPrimaryGrandTotal = $upperPrimaryStatements->sum('total');
        
        $totalBoys = $rollStatements->sum('boys');
        $totalGirls = $rollStatements->sum('girls');
        $grandTotal = $rollStatements->sum('total');
        
        $data = [
            'user' => $user,
            'date' => $date,
            'academic_year' => $academicYear,
            'rollStatements' => $rollStatements,
            'primaryStatements' => $primaryStatements,
            'upperPrimaryStatements' => $upperPrimaryStatements,
            'primaryTotalBoys' => $primaryTotalBoys,
            'primaryTotalGirls' => $primaryTotalGirls,
            'primaryGrandTotal' => $primaryGrandTotal,
            'upperPrimaryTotalBoys' => $upperPrimaryTotalBoys,
            'upperPrimaryTotalGirls' => $upperPrimaryTotalGirls,
            'upperPrimaryGrandTotal' => $upperPrimaryGrandTotal,
            'totalBoys' => $totalBoys,
            'totalGirls' => $totalGirls,
            'grandTotal' => $grandTotal,
            'theme' => $request->query('theme', 'bw'), // Default to black & white theme
        ];

        $pdf = Pdf::loadView('roll-statements.pdf', $data)
            ->setPaper('a4', 'portrait');
        
        $filename = sprintf(
            'roll-statement-%s-%s.pdf',
            Carbon::parse($date)->format('Y-m-d'),
            $academicYear
        );

        if ($request->query('action') === 'preview') {
            return $pdf->stream($filename);
        }

        return $pdf->download($filename);
    }

    /**
     * Get available academic years.
     */
    private function getAcademicYears()
    {
        return [
            '2023-24',
            '2024-25',
            '2025-26',
            '2026-27',
        ];
    }

    /**
     * Get available classes.
     */
    private function getClasses()
    {
        return [
            ['value' => 'kg', 'label' => 'KG'],
            ['value' => '1', 'label' => '1st'],
            ['value' => '2', 'label' => '2nd'],
            ['value' => '3', 'label' => '3rd'],
            ['value' => '4', 'label' => '4th'],
            ['value' => '5', 'label' => '5th'],
            ['value' => '6', 'label' => '6th'],
            ['value' => '7', 'label' => '7th'],
            ['value' => '8', 'label' => '8th'],
        ];
    }
    /**
     * Remove all roll statements for a specific date and academic year.
     */
    public function destroyBulk(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'academic_year' => 'required|string',
            'udise' => 'required|string',
        ]);

        // Delete all roll statements matching the criteria
        $deleted = RollStatement::where('date', $validated['date'])
            ->where('academic_year', $validated['academic_year'])
            ->where('udise', $validated['udise'])
            ->delete();

        return redirect()
            ->route('roll-statements.index')
            ->with('success', "Roll statement deleted successfully. ({$deleted} " . ($deleted === 1 ? 'entry' : 'entries') . " removed)");
    }
}