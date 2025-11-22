<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmountConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'year',
        'month',
        'daily_pulses_primary',
        'daily_vegetables_primary',
        'daily_oil_primary',
        'daily_salt_primary',
        'daily_fuel_primary',
        'total_daily_primary',
        'daily_pulses_middle',
        'daily_vegetables_middle',
        'daily_oil_middle',
        'daily_salt_middle',
        'daily_fuel_middle',
        'total_daily_middle',
        // ✅ Unified salt percentage columns (apply to both primary and middle)
        'salt_percentage_common',
        'salt_percentage_chilli',
        'salt_percentage_turmeric',
        'salt_percentage_coriander',
        'salt_percentage_other',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'daily_pulses_primary' => 'decimal:2',
        'daily_vegetables_primary' => 'decimal:2',
        'daily_oil_primary' => 'decimal:2',
        'daily_salt_primary' => 'decimal:2',
        'daily_fuel_primary' => 'decimal:2',
        'total_daily_primary' => 'decimal:2',
        'daily_pulses_middle' => 'decimal:2',
        'daily_vegetables_middle' => 'decimal:2',
        'daily_oil_middle' => 'decimal:2',
        'daily_salt_middle' => 'decimal:2',
        'daily_fuel_middle' => 'decimal:2',
        'total_daily_middle' => 'decimal:2',
        // ✅ Unified salt percentage casts
        'salt_percentage_common' => 'decimal:2',
        'salt_percentage_chilli' => 'decimal:2',
        'salt_percentage_turmeric' => 'decimal:2',
        'salt_percentage_coriander' => 'decimal:2',
        'salt_percentage_other' => 'decimal:2',
    ];

    /**
     * Relationship: belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: filter by period.
     */
    public function scopeForPeriod($query, $year, $month)
    {
        return $query->where('year', $year)->where('month', $month);
    }

    /**
     * Calculate and set total for primary.
     */
    public function calculatePrimaryTotal()
    {
        $this->total_daily_primary = 
            ($this->daily_pulses_primary ?? 0) +
            ($this->daily_vegetables_primary ?? 0) +
            ($this->daily_oil_primary ?? 0) +
            ($this->daily_salt_primary ?? 0) +
            ($this->daily_fuel_primary ?? 0);
    }

    /**
     * Calculate and set total for middle.
     */
    public function calculateMiddleTotal()
    {
        $this->total_daily_middle = 
            ($this->daily_pulses_middle ?? 0) +
            ($this->daily_vegetables_middle ?? 0) +
            ($this->daily_oil_middle ?? 0) +
            ($this->daily_salt_middle ?? 0) +
            ($this->daily_fuel_middle ?? 0);
    }

    /**
     * Calculate both totals based on user's school type.
     */
    public function calculateTotals()
    {
        if ($this->user->hasPrimaryStudents()) {
            $this->calculatePrimaryTotal();
        } else {
            $this->total_daily_primary = 0;
        }

        if ($this->user->hasMiddleStudents()) {
            $this->calculateMiddleTotal();
        } else {
            $this->total_daily_middle = 0;
        }
    }

    /**
     * Accessor: formatted period.
     */
    public function getFormattedPeriodAttribute()
    {
        return date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year));
    }

    /**
     * Accessor: month name.
     */
    public function getMonthNameAttribute()
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }

    // =========================================================================
    // ✅ UNIFIED SALT SUBCATEGORY CALCULATION METHODS
    // =========================================================================

    /**
     * Calculate salt subcategories for primary section.
     * Uses unified percentages that apply to both primary and middle.
     * Splits daily_salt_primary into 5 subcategories based on unified percentages.
     * 
     * @return array ['common_salt' => float, 'chilli_powder' => float, ...]
     */
    public function calculateSaltSubcategoriesPrimary(): array
    {
        $totalSalt = (float) $this->daily_salt_primary;
        
        return [
            'common_salt' => round(($totalSalt * $this->salt_percentage_common) / 100, 2),
            'chilli_powder' => round(($totalSalt * $this->salt_percentage_chilli) / 100, 2),
            'turmeric' => round(($totalSalt * $this->salt_percentage_turmeric) / 100, 2),
            'coriander' => round(($totalSalt * $this->salt_percentage_coriander) / 100, 2),
            'other_condiments' => round(($totalSalt * $this->salt_percentage_other) / 100, 2),
        ];
    }

    /**
     * Calculate salt subcategories for middle section.
     * Uses unified percentages that apply to both primary and middle.
     * Splits daily_salt_middle into 5 subcategories based on unified percentages.
     * 
     * @return array ['common_salt' => float, 'chilli_powder' => float, ...]
     */
    public function calculateSaltSubcategoriesMiddle(): array
    {
        $totalSalt = (float) $this->daily_salt_middle;
        
        return [
            'common_salt' => round(($totalSalt * $this->salt_percentage_common) / 100, 2),
            'chilli_powder' => round(($totalSalt * $this->salt_percentage_chilli) / 100, 2),
            'turmeric' => round(($totalSalt * $this->salt_percentage_turmeric) / 100, 2),
            'coriander' => round(($totalSalt * $this->salt_percentage_coriander) / 100, 2),
            'other_condiments' => round(($totalSalt * $this->salt_percentage_other) / 100, 2),
        ];
    }

    /**
     * Validate that unified salt percentages sum to 100.
     * Single validation method for both primary and middle.
     * 
     * @return array ['valid' => bool, 'total' => float, 'error' => string|null]
     */
    public function validateSaltPercentages(): array
    {
        $total = 
            $this->salt_percentage_common +
            $this->salt_percentage_chilli +
            $this->salt_percentage_turmeric +
            $this->salt_percentage_coriander +
            $this->salt_percentage_other;
        
        $valid = abs($total - 100) < 0.01; // Allow 0.01 tolerance for floating point
        
        return [
            'valid' => $valid,
            'total' => round($total, 2),
            'error' => $valid ? null : "Salt percentages must sum to 100% (current: {$total}%)",
        ];
    }

    /**
     * Get all unified salt percentages.
     * Returns a single set that applies to both primary and middle.
     * 
     * @return array
     */
    public function getSaltPercentages(): array
    {
        return [
            'common_salt' => (float) $this->salt_percentage_common,
            'chilli_powder' => (float) $this->salt_percentage_chilli,
            'turmeric' => (float) $this->salt_percentage_turmeric,
            'coriander' => (float) $this->salt_percentage_coriander,
            'other_condiments' => (float) $this->salt_percentage_other,
        ];
    }
}