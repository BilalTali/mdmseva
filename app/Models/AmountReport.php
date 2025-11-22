<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * AmountReport Model
 * 
 * Stores monthly aggregated reports for amount/ingredient consumption
 * with UNIFIED salt breakdown (same percentages apply to both Primary and Middle).
 * 
 * @property int $id
 * @property int $user_id
 * @property int $year
 * @property int $month
 * @property string $school_type
 * @property float $opening_balance_primary
 * @property float $opening_balance_middle
 * @property float $closing_balance_primary
 * @property float $closing_balance_middle
 * @property int $total_primary_students
 * @property float $total_primary_pulses
 * @property float $total_primary_vegetables
 * @property float $total_primary_oil
 * @property float $total_primary_salt
 * @property float $total_primary_common_salt
 * @property float $total_primary_chilli_powder
 * @property float $total_primary_turmeric
 * @property float $total_primary_coriander
 * @property float $total_primary_other_condiments
 * @property float $total_primary_fuel
 * @property float $total_primary_amount
 * @property int $total_middle_students
 * @property float $total_middle_pulses
 * @property float $total_middle_vegetables
 * @property float $total_middle_oil
 * @property float $total_middle_salt
 * @property float $total_middle_common_salt
 * @property float $total_middle_chilli_powder
 * @property float $total_middle_turmeric
 * @property float $total_middle_coriander
 * @property float $total_middle_other_condiments
 * @property float $total_middle_fuel
 * @property float $total_middle_amount
 * @property int $total_serving_days
 * @property float $grand_total_amount
 * @property float $average_daily_amount
 * @property array|null $daily_records
 * @property array|null $salt_percentages_used - Stores the unified percentages used during generation
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AmountReport extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'year',
        'month',
        'school_type',
        'opening_balance_primary',
        'opening_balance_middle',
        'closing_balance_primary',
        'closing_balance_middle',
        'total_primary_students',
        'total_primary_pulses',
        'total_primary_vegetables',
        'total_primary_oil',
        'total_primary_salt',
        'total_primary_common_salt',
        'total_primary_chilli_powder',
        'total_primary_turmeric',
        'total_primary_coriander',
        'total_primary_other_condiments',
        'total_primary_fuel',
        'total_primary_amount',
        'total_middle_students',
        'total_middle_pulses',
        'total_middle_vegetables',
        'total_middle_oil',
        'total_middle_salt',
        'total_middle_common_salt',
        'total_middle_chilli_powder',
        'total_middle_turmeric',
        'total_middle_coriander',
        'total_middle_other_condiments',
        'total_middle_fuel',
        'total_middle_amount',
        'total_serving_days',
        'grand_total_amount',
        'average_daily_amount',
        'daily_records',
        'salt_percentages_used', // NEW: Store unified percentages
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'total_primary_students' => 'integer',
        'total_middle_students' => 'integer',
        'total_serving_days' => 'integer',
        'daily_records' => 'array',
        'salt_percentages_used' => 'array', // NEW: Cast unified percentages to array
    ];

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Relationship: belongs to a user/school.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all bills associated with this amount report
     */
    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'amount_report_id');
    }

    /**
     * Get kiryana bills only
     */
    public function kiryanaBills(): HasMany
    {
        return $this->hasMany(Bill::class, 'amount_report_id')
                    ->where('type', 'kiryana');
    }

    /**
     * Get fuel bills only
     */
    public function fuelBills(): HasMany
    {
        return $this->hasMany(Bill::class, 'amount_report_id')
                    ->where('type', 'fuel');
    }

    // =========================================================================
    // QUERY SCOPES
    // =========================================================================

    /**
     * Scope: filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: filter by period (year and month).
     */
    public function scopeForPeriod($query, int $year, int $month)
    {
        return $query->where('year', $year)->where('month', $month);
    }

    /**
     * Scope: filter by school type.
     */
    public function scopeForSchoolType($query, string $schoolType)
    {
        return $query->where('school_type', $schoolType);
    }

    /**
     * Scope: order by period (latest first).
     */
    public function scopeLatestPeriod($query)
    {
        return $query->orderBy('year', 'desc')->orderBy('month', 'desc');
    }

    // =========================================================================
    // ACCESSORS
    // =========================================================================

    /**
     * Accessor: get month name (e.g., "January").
     */
    public function getMonthNameAttribute(): string
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }

    /**
     * Accessor: get formatted period (e.g., "January 2024").
     */
    public function getPeriodAttribute(): string
    {
        return $this->month_name . ' ' . $this->year;
    }

    /**
     * Accessor: get formatted period for display (e.g., "Nov 2024").
     */
    public function getFormattedPeriodAttribute(): string
    {
        return date('M Y', mktime(0, 0, 0, $this->month, 1, $this->year));
    }

    // =========================================================================
    // UNIFIED SALT BREAKDOWN HELPERS (Updated for Unified Percentages)
    // =========================================================================

    /**
     * Get primary section salt breakdown as array.
     * Uses UNIFIED salt percentages (same as middle section).
     * 
     * @return array ['common_salt' => float, 'chilli_powder' => float, ...]
     */
    public function getPrimarySaltBreakdown(): array
    {
        return [
            'common_salt' => (float) $this->total_primary_common_salt,
            'chilli_powder' => (float) $this->total_primary_chilli_powder,
            'turmeric' => (float) $this->total_primary_turmeric,
            'coriander' => (float) $this->total_primary_coriander,
            'other_condiments' => (float) $this->total_primary_other_condiments,
        ];
    }

    /**
     * Get middle section salt breakdown as array.
     * Uses UNIFIED salt percentages (same as primary section).
     * 
     * @return array ['common_salt' => float, 'chilli_powder' => float, ...]
     */
    public function getMiddleSaltBreakdown(): array
    {
        return [
            'common_salt' => (float) $this->total_middle_common_salt,
            'chilli_powder' => (float) $this->total_middle_chilli_powder,
            'turmeric' => (float) $this->total_middle_turmeric,
            'coriander' => (float) $this->total_middle_coriander,
            'other_condiments' => (float) $this->total_middle_other_condiments,
        ];
    }

    /**
     * NEW: Get the unified salt percentages used during report generation.
     * 
     * @return array ['common' => float, 'chilli' => float, ...]
     */
    public function getUnifiedSaltPercentages(): array
    {
        // Return stored percentages or defaults
        return $this->salt_percentages_used ?? [
            'common' => 30.00,
            'chilli' => 20.00,
            'turmeric' => 20.00,
            'coriander' => 15.00,
            'other' => 15.00,
        ];
    }

    /**
     * NEW: Verify that primary and middle use the same salt breakdown logic.
     * 
     * @return bool True if both sections use unified percentages
     */
    public function usesUnifiedSaltBreakdown(): bool
    {
        // Check if salt_percentages_used is set (indicates unified approach)
        return !is_null($this->salt_percentages_used);
    }

    /**
     * Get totals by section (primary and middle).
     * 
     * @return array ['primary' => [...], 'middle' => [...]]
     */
    public function getTotalsBySection(): array
    {
        return [
            'primary' => [
                'students' => $this->total_primary_students,
                'pulses' => (float) $this->total_primary_pulses,
                'vegetables' => (float) $this->total_primary_vegetables,
                'oil' => (float) $this->total_primary_oil,
                'salt' => (float) $this->total_primary_salt,
                'salt_breakdown' => $this->getPrimarySaltBreakdown(),
                'fuel' => (float) $this->total_primary_fuel,
                'total' => (float) $this->total_primary_amount,
            ],
            'middle' => [
                'students' => $this->total_middle_students,
                'pulses' => (float) $this->total_middle_pulses,
                'vegetables' => (float) $this->total_middle_vegetables,
                'oil' => (float) $this->total_middle_oil,
                'salt' => (float) $this->total_middle_salt,
                'salt_breakdown' => $this->getMiddleSaltBreakdown(),
                'fuel' => (float) $this->total_middle_fuel,
                'total' => (float) $this->total_middle_amount,
            ],
        ];
    }

    // =========================================================================
    // REPORT STATISTICS
    // =========================================================================

    /**
     * Get comprehensive report summary with unified salt info.
     * 
     * @return array
     */
    public function getReportSummary(): array
    {
        return [
            'period' => $this->period,
            'school_type' => $this->school_type,
            'serving_days' => $this->total_serving_days,
            'total_students' => $this->total_primary_students + $this->total_middle_students,
            'grand_total_amount' => (float) $this->grand_total_amount,
            'average_daily_amount' => (float) $this->average_daily_amount,
            'sections' => $this->getTotalsBySection(),
            'uses_unified_salt_breakdown' => $this->usesUnifiedSaltBreakdown(),
            'salt_percentages' => $this->getUnifiedSaltPercentages(),
        ];
    }

    /**
     * Check if report has primary section data.
     */
    public function hasPrimaryData(): bool
    {
        return $this->total_primary_students > 0 || $this->total_primary_amount > 0;
    }

    /**
     * Check if report has middle section data.
     */
    public function hasMiddleData(): bool
    {
        return $this->total_middle_students > 0 || $this->total_middle_amount > 0;
    }

    /**
     * Get number of daily records stored.
     */
    public function getDailyRecordsCount(): int
    {
        return $this->daily_records ? count($this->daily_records) : 0;
    }

    // =========================================================================
    // BILLS HELPERS
    // =========================================================================

    /**
     * Check if report has any bills
     */
    public function hasBills(): bool
    {
        return $this->bills()->exists();
    }

    /**
     * Check if report has kiryana bill
     */
    public function hasKiryanaBill(): bool
    {
        return $this->bills()->where('type', 'kiryana')->exists();
    }

    /**
     * Check if report has fuel bill
     */
    public function hasFuelBill(): bool
    {
        return $this->bills()->where('type', 'fuel')->exists();
    }

    /**
     * Get total amount from all bills
     */
    public function getTotalBillAmount(): float
    {
        return (float) $this->bills()->sum('total_amount');
    }

    /**
     * Get bills count
     */
    public function getBillsCount(): int
    {
        return $this->bills()->count();
    }

    // =========================================================================
    // VALIDATION & CHECKING (Updated for Unified Salt)
    // =========================================================================

    /**
     * Check if salt subcategory totals match overall salt totals.
     * Works with UNIFIED salt percentages approach.
     * 
     * @return array ['valid' => bool, 'errors' => array]
     */
    public function validateSaltBreakdown(): array
    {
        $errors = [];
        $tolerance = 0.01; // Allow for floating-point precision
        
        // Check primary section
        if ($this->hasPrimaryData()) {
            $primarySubTotal = 
                $this->total_primary_common_salt +
                $this->total_primary_chilli_powder +
                $this->total_primary_turmeric +
                $this->total_primary_coriander +
                $this->total_primary_other_condiments;
            
            if (abs($primarySubTotal - $this->total_primary_salt) > $tolerance) {
                $errors[] = sprintf(
                    "Primary salt breakdown doesn't match total: %.2f vs %.2f (difference: %.2f)",
                    $primarySubTotal,
                    $this->total_primary_salt,
                    abs($primarySubTotal - $this->total_primary_salt)
                );
            }
        }
        
        // Check middle section
        if ($this->hasMiddleData()) {
            $middleSubTotal = 
                $this->total_middle_common_salt +
                $this->total_middle_chilli_powder +
                $this->total_middle_turmeric +
                $this->total_middle_coriander +
                $this->total_middle_other_condiments;
            
            if (abs($middleSubTotal - $this->total_middle_salt) > $tolerance) {
                $errors[] = sprintf(
                    "Middle salt breakdown doesn't match total: %.2f vs %.2f (difference: %.2f)",
                    $middleSubTotal,
                    $this->total_middle_salt,
                    abs($middleSubTotal - $this->total_middle_salt)
                );
            }
        }
        
        // NEW: Verify unified percentages are used correctly
        if ($this->usesUnifiedSaltBreakdown()) {
            $percentages = $this->getUnifiedSaltPercentages();
            $totalPercentage = array_sum($percentages);
            
            if (abs($totalPercentage - 100) > $tolerance) {
                $errors[] = sprintf(
                    "Unified salt percentages don't sum to 100%%: %.2f%%",
                    $totalPercentage
                );
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * NEW: Validate that unified salt percentages were applied correctly.
     * Compares actual breakdown ratios with stored percentages.
     * 
     * @return array ['valid' => bool, 'errors' => array]
     */
    public function validateUnifiedPercentageApplication(): array
    {
        $errors = [];
        
        if (!$this->usesUnifiedSaltBreakdown()) {
            return [
                'valid' => false,
                'errors' => ['Report does not use unified salt breakdown'],
            ];
        }

        $percentages = $this->getUnifiedSaltPercentages();
        $tolerance = 1.0; // Allow 1% difference for rounding

        // Check primary section ratios
        if ($this->hasPrimaryData() && $this->total_primary_salt > 0) {
            $this->validateSectionPercentages(
                'Primary',
                $this->total_primary_salt,
                [
                    'common' => $this->total_primary_common_salt,
                    'chilli' => $this->total_primary_chilli_powder,
                    'turmeric' => $this->total_primary_turmeric,
                    'coriander' => $this->total_primary_coriander,
                    'other' => $this->total_primary_other_condiments,
                ],
                $percentages,
                $tolerance,
                $errors
            );
        }

        // Check middle section ratios
        if ($this->hasMiddleData() && $this->total_middle_salt > 0) {
            $this->validateSectionPercentages(
                'Middle',
                $this->total_middle_salt,
                [
                    'common' => $this->total_middle_common_salt,
                    'chilli' => $this->total_middle_chilli_powder,
                    'turmeric' => $this->total_middle_turmeric,
                    'coriander' => $this->total_middle_coriander,
                    'other' => $this->total_middle_other_condiments,
                ],
                $percentages,
                $tolerance,
                $errors
            );
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Helper: Validate salt percentages for a section.
     */
    private function validateSectionPercentages(
        string $section,
        float $totalSalt,
        array $actualAmounts,
        array $expectedPercentages,
        float $tolerance,
        array &$errors
    ): void {
        foreach ($actualAmounts as $key => $amount) {
            $actualPercentage = ($amount / $totalSalt) * 100;
            $expectedPercentage = $expectedPercentages[$key];
            $difference = abs($actualPercentage - $expectedPercentage);
            
            if ($difference > $tolerance) {
                $errors[] = sprintf(
                    "%s %s: Expected %.2f%%, got %.2f%% (difference: %.2f%%)",
                    $section,
                    ucfirst($key),
                    $expectedPercentage,
                    $actualPercentage,
                    $difference
                );
            }
        }
    }
}