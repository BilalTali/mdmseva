<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * MonthlyAmountConfiguration Model - Month-based amount/financial tracking
 */
class MonthlyAmountConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'daily_amount_per_student_primary',
        'daily_amount_per_student_upper_primary',
        'opening_balance_primary',
        'opening_balance_upper_primary',
        'amount_received_primary',
        'amount_received_upper_primary',
        'total_available_primary',
        'total_available_upper_primary',
        'consumed_primary',
        'consumed_upper_primary',
        'closing_balance_primary',
        'closing_balance_upper_primary',
        'is_completed',
        'completed_at',
        'completed_by',
        'opening_carried_from_previous',
        'previous_month_id',
        'is_locked',
        // New rate fields
        'daily_pulses_primary',
        'daily_vegetables_primary',
        'daily_oil_primary',
        'daily_salt_primary',
        'daily_fuel_primary',
        'daily_pulses_middle',
        'daily_vegetables_middle',
        'daily_oil_middle',
        'daily_salt_middle',
        'daily_fuel_middle',
        // Salt percentages
        'salt_percentage_common',
        'salt_percentage_chilli',
        'salt_percentage_turmeric',
        'salt_percentage_coriander',
        'salt_percentage_other',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'daily_amount_per_student_primary' => 'decimal:2',
        'daily_amount_per_student_upper_primary' => 'decimal:2',
        'opening_balance_primary' => 'decimal:2',
        'opening_balance_upper_primary' => 'decimal:2',
        'amount_received_primary' => 'decimal:2',
        'amount_received_upper_primary' => 'decimal:2',
        'total_available_primary' => 'decimal:2',
        'total_available_upper_primary' => 'decimal:2',
        'consumed_primary' => 'decimal:2',
        'consumed_upper_primary' => 'decimal:2',
        'closing_balance_primary' => 'decimal:2',
        'closing_balance_upper_primary' => 'decimal:2',
        'is_completed' => 'boolean',
        'is_locked' => 'boolean',
        'opening_carried_from_previous' => 'boolean',
        'completed_at' => 'datetime',
        // New rate fields
        'daily_pulses_primary' => 'decimal:2',
        'daily_vegetables_primary' => 'decimal:2',
        'daily_oil_primary' => 'decimal:2',
        'daily_salt_primary' => 'decimal:2',
        'daily_fuel_primary' => 'decimal:2',
        'daily_pulses_middle' => 'decimal:2',
        'daily_vegetables_middle' => 'decimal:2',
        'daily_oil_middle' => 'decimal:2',
        'daily_salt_middle' => 'decimal:2',
        'daily_fuel_middle' => 'decimal:2',
        // Salt percentages
        'salt_percentage_common' => 'decimal:2',
        'salt_percentage_chilli' => 'decimal:2',
        'salt_percentage_turmeric' => 'decimal:2',
        'salt_percentage_coriander' => 'decimal:2',
        'salt_percentage_other' => 'decimal:2',
    ];

    // ===============================================
    // RELATIONSHIPS
    // ===============================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function previousMonth(): BelongsTo
    {
        return $this->belongsTo(MonthlyAmountConfiguration::class, 'previous_month_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function dailyConsumptions(): HasMany
    {
        return $this->hasMany(DailyConsumption::class, 'user_id', 'user_id')
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year);
    }

    // ===============================================
    // SCOPES
    // ===============================================

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopeNotCompleted($query)
    {
        return $query->where('is_completed', false);
    }

    // ===============================================
    // COMPUTED PROPERTIES
    // ===============================================

    public function getMonthNameAttribute(): string
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }

    public function getPeriodAttribute(): string
    {
        return "{$this->month_name} {$this->year}";
    }

    public function getTotalOpeningBalanceAttribute(): float
    {
        return round(
            ($this->opening_balance_primary ?? 0) + 
            ($this->opening_balance_upper_primary ?? 0),
            2
        );
    }

    public function getTotalAmountReceivedAttribute(): float
    {
        return round(
            ($this->amount_received_primary ?? 0) + 
            ($this->amount_received_upper_primary ?? 0),
            2
        );
    }

    public function getTotalAvailableAttribute(): float
    {
        return round(
            ($this->total_available_primary ?? 0) + 
            ($this->total_available_upper_primary ?? 0),
            2
        );
    }

    public function getTotalConsumedAttribute(): float
    {
        return round(
            ($this->consumed_primary ?? 0) + 
            ($this->consumed_upper_primary ?? 0),
            2
        );
    }

    public function getTotalClosingBalanceAttribute(): float
    {
        return round(
            ($this->closing_balance_primary ?? 0) + 
            ($this->closing_balance_upper_primary ?? 0),
            2
        );
    }

    // ===============================================
    // CORE METHODS
    // ===============================================

    /**
     * Recompute total available and closing balances
     */
    public function recomputeTotals(): void
    {
        $this->total_available_primary = 
            ($this->opening_balance_primary ?? 0) + 
            ($this->amount_received_primary ?? 0);
            
        $this->total_available_upper_primary = 
            ($this->opening_balance_upper_primary ?? 0) + 
            ($this->amount_received_upper_primary ?? 0);

        $this->closing_balance_primary = 
            $this->total_available_primary - ($this->consumed_primary ?? 0);
            
        $this->closing_balance_upper_primary = 
            $this->total_available_upper_primary - ($this->consumed_upper_primary ?? 0);
    }

    /**
     * Sync consumed amounts from daily consumption records
     */
    public function syncConsumedFromDaily(): void
    {
        $primaryRate = $this->daily_amount_per_student_primary ?? 0;
        $upperRate = $this->daily_amount_per_student_upper_primary ?? 0;

        $totalPrimary = DailyConsumption::where('user_id', $this->user_id)
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year)
            ->selectRaw('SUM(served_primary * ?) as total', [$primaryRate])
            ->value('total') ?? 0;

        $totalUpper = DailyConsumption::where('user_id', $this->user_id)
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year)
            ->selectRaw('SUM(served_middle * ?) as total', [$upperRate])
            ->value('total') ?? 0;

        $this->consumed_primary = round($totalPrimary, 2);
        $this->consumed_upper_primary = round($totalUpper, 2);
        $this->recomputeTotals();
    }

    /**
     * Check if configuration can be edited
     */
    public function canBeEdited(): bool
    {
        return !$this->is_locked && !$this->is_completed;
    }

    /**
     * Complete amount configuration
     */
    public function completeConfiguration(int $completedByUserId): bool
    {
        if ($this->is_completed || $this->is_locked) {
            return false;
        }

        $this->syncConsumedFromDaily();
        $this->is_completed = true;
        $this->completed_at = now();
        $this->completed_by = $completedByUserId;
        $this->save();

        return true;
    }

    /**
     * Create next month with carried balance
     */
    public static function createNextMonth(
        int $userId,
        MonthlyAmountConfiguration $previousConfig,
        array $overrides = []
    ): self {
        $nextMonth = $previousConfig->month == 12 ? 1 : $previousConfig->month + 1;
        $nextYear = $previousConfig->month == 12 ? $previousConfig->year + 1 : $previousConfig->year;

        $config = self::create(array_merge([
            'user_id' => $userId,
            'month' => $nextMonth,
            'year' => $nextYear,
            'daily_amount_per_student_primary' => $previousConfig->daily_amount_per_student_primary,
            'daily_amount_per_student_upper_primary' => $previousConfig->daily_amount_per_student_upper_primary,
            'opening_balance_primary' => $previousConfig->closing_balance_primary,
            'opening_balance_upper_primary' => $previousConfig->closing_balance_upper_primary,
            'amount_received_primary' => 0,
            'amount_received_upper_primary' => 0,
            'opening_carried_from_previous' => true,
            'previous_month_id' => $previousConfig->id,
            // Copy rates
            'daily_pulses_primary' => $previousConfig->daily_pulses_primary,
            'daily_vegetables_primary' => $previousConfig->daily_vegetables_primary,
            'daily_oil_primary' => $previousConfig->daily_oil_primary,
            'daily_salt_primary' => $previousConfig->daily_salt_primary,
            'daily_fuel_primary' => $previousConfig->daily_fuel_primary,
            'daily_pulses_middle' => $previousConfig->daily_pulses_middle,
            'daily_vegetables_middle' => $previousConfig->daily_vegetables_middle,
            'daily_oil_middle' => $previousConfig->daily_oil_middle,
            'daily_salt_middle' => $previousConfig->daily_salt_middle,
            'daily_fuel_middle' => $previousConfig->daily_fuel_middle,
            // Copy salt percentages
            'salt_percentage_common' => $previousConfig->salt_percentage_common,
            'salt_percentage_chilli' => $previousConfig->salt_percentage_chilli,
            'salt_percentage_turmeric' => $previousConfig->salt_percentage_turmeric,
            'salt_percentage_coriander' => $previousConfig->salt_percentage_coriander,
            'salt_percentage_other' => $previousConfig->salt_percentage_other,
        ], $overrides));

        $config->recomputeTotals();
        $config->save();

        return $config;
    }

    /**
     * Get or create for period
     */
    public static function getOrCreateForPeriod(
        int $userId,
        int $month,
        int $year,
        array $defaults = []
    ): self {
        $config = self::forUser($userId)
            ->forPeriod($month, $year)
            ->first();

        if ($config) {
            return $config;
        }

        // Check previous month
        $prevMonth = $month == 1 ? 12 : $month - 1;
        $prevYear = $month == 1 ? $year - 1 : $year;
        
        $previousConfig = self::forUser($userId)
            ->forPeriod($prevMonth, $prevYear)
            ->first();

        if ($previousConfig && $previousConfig->is_completed) {
            return self::createNextMonth($userId, $previousConfig, $defaults);
        }

        return self::create(array_merge([
            'user_id' => $userId,
            'month' => $month,
            'year' => $year,
            'opening_balance_primary' => 0,
            'opening_balance_upper_primary' => 0
        ], $defaults));
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

    /**
     * Calculate and set total for primary.
     */
    public function calculatePrimaryTotal()
    {
        $this->daily_amount_per_student_primary = 
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
        $this->daily_amount_per_student_upper_primary = 
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
        if ($this->user && $this->user->hasPrimaryStudents()) {
            $this->calculatePrimaryTotal();
        } else {
            $this->daily_amount_per_student_primary = 0;
        }

        if ($this->user && $this->user->hasMiddleStudents()) {
            $this->calculateMiddleTotal();
        } else {
            $this->daily_amount_per_student_upper_primary = 0;
        }
    }
}
