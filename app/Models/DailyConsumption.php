<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use App\Models\MonthlyRiceConfiguration;
use App\Models\MonthlyAmountConfiguration;

/**
 * DailyConsumption Model - Uses dynamic rates from MonthlyRiceConfiguration
 *
 * This model tracks the daily Mid-Day Meal consumption for a school.
 * It stores the number of students served in primary and middle sections,
 * the rice consumed (now calculated automatically), and the remaining balance.
 *
 * Rice consumed is calculated using the configured rate per student FOR THE SPECIFIC MONTH.
 * Amount consumed is calculated based on configured rates.
 *
 * ✅ UPDATED: Uses MonthlyRiceConfiguration based on consumption date (month/year)
 * ✅ Data isolation: Each consumption record is tied to its month's configuration
 *
 * Note on terminology:
 * - Primary section → Class 1-5
 * - Middle section → Class 6-8 (called "upper_primary" in configs)
 *
 * @property int $id
 * @property int $user_id
 * @property string $date
 * @property int $month
 * @property int $year
 * @property int $students_primary
 * @property int $students_middle
 * @property float $rice_consumed_primary
 * @property float $rice_consumed_middle
 * @property float $total_rice_consumed
 * @property float $amount_pulses_primary
 * @property float $amount_vegetables_primary
 * @property float $amount_oil_primary
 * @property float $amount_salt_primary
 * @property float $amount_fuel_primary
 * @property float $total_amount_primary
 * @property float $amount_pulses_middle
 * @property float $amount_vegetables_middle
 * @property float $amount_oil_middle
 * @property float $amount_salt_middle
 * @property float $amount_fuel_middle
 * @property float $total_amount_middle
 * @property float $grand_total_amount
 * @property array|null $salt_breakdown
 * @property string|null $remarks
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 * @property-read MonthlyRiceConfiguration $riceConfig
 * @property-read float $primary_rice
 * @property-read float $middle_rice
 * @property-read float $total_rice
 * @property-read int $total_served
 */
class DailyConsumption extends Model
{
    use HasFactory;

    /**
     * ✅ REMOVED: Hardcoded rice rates
     * Now uses dynamic rates from MonthlyRiceConfiguration
     */

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'date',
        'day',
        'served_primary',
        'served_middle',
        'rice_consumed',
        'rice_balance_after',
        'amount_consumed',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'date' => 'date',
        'served_primary' => 'integer',
        'served_middle' => 'integer',
        'rice_consumed' => 'decimal:2',
        'rice_balance_after' => 'decimal:2',
        'amount_consumed' => 'decimal:2',
    ];

    /**
     * The accessors to append to model's array form.
     */
    protected $appends = [
        'primary_rice',
        'middle_rice',
        'total_rice',
        'total_served',
        'formatted_date',
    ];

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Get the user that owns the consumption record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ✅ UPDATED: Get the monthly rice configuration for this consumption record's month
     * Uses the consumption date to look up the correct month/year configuration
     */
    public function riceConfig(): ?MonthlyRiceConfiguration
    {
        $date = \Carbon\Carbon::parse($this->date);
        
        return MonthlyRiceConfiguration::where('user_id', $this->user_id)
            ->where('month', $date->month)
            ->where('year', $date->year)
            ->first();
    }

    // =========================================================================
    // ACCESSORS (Calculated Fields) - ✅ FIXED to use dynamic rates
    // =========================================================================

    /**
     * ✅ FIXED: Get calculated rice consumption for primary section using CONFIGURED rate
     */
    public function getPrimaryRiceAttribute(): float
    {
        $config = $this->riceConfig();
        $rateKg = $config 
            ? ($config->daily_consumption_primary / 1000)
            : 0.1; // Fallback only if no config exists
        
        return round(($this->served_primary ?? 0) * $rateKg, 2);
    }

    /**
     * ✅ FIXED: Get calculated rice consumption for middle section using CONFIGURED rate
     */
    public function getMiddleRiceAttribute(): float
    {
        $config = $this->riceConfig();
        $rateKg = $config 
            ? ($config->daily_consumption_upper_primary / 1000)
            : 0.15; // Fallback only if no config exists
        
        return round(($this->served_middle ?? 0) * $rateKg, 2);
    }

    /**
     * Get total calculated rice consumption
     */
    public function getTotalRiceAttribute(): float
    {
        return round($this->primary_rice + $this->middle_rice, 2);
    }

    /**
     * Get total students served (both sections)
     */
    public function getTotalServedAttribute(): int
    {
        return ($this->served_primary ?? 0) + ($this->served_middle ?? 0);
    }

    /**
     * Get formatted date (e.g., "Jan 15, 2024")
     */
    public function getFormattedDateAttribute(): ?string
    {
        return $this->date ? $this->date->format('M d, Y') : null;
    }

    /**
     * Get short day name (e.g., "Mon")
     */
    public function getShortDayAttribute(): ?string
    {
        return $this->date ? $this->date->format('D') : null;
    }

    /**
     * Get amount breakdown if MonthlyAmountConfiguration exists
     */
    public function getAmountBreakdownAttribute(): ?array
    {
        $date = \Carbon\Carbon::parse($this->date);

        $amountConfig = MonthlyAmountConfiguration::where('user_id', $this->user_id)
            ->where('month', $date->month)
            ->where('year', $date->year)
            ->first();

        // Fallback to latest if not found (though ideally should exist)
        if (!$amountConfig) {
            $amountConfig = MonthlyAmountConfiguration::where('user_id', $this->user_id)
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->first();
        }

        if (!$amountConfig) {
            return null;
        }

        $service = app(\App\Services\ConsumptionCalculationService::class);
        
        return $service->calculateAmountConsumption(
            $this->served_primary ?? 0,
            $this->served_middle ?? 0,
            $amountConfig
        );
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    /**
     * Scope: Filter by user
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope: Current month only
     */
    public function scopeCurrentMonth(Builder $query): Builder
    {
        return $query->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year);
    }

    /**
     * Scope: Specific month and year
     */
    public function scopeForMonth(Builder $query, int $month, int $year): Builder
    {
        return $query->whereMonth('date', $month)
                    ->whereYear('date', $year);
    }

    /**
     * Scope: Order by date
     */
    public function scopeOrderedByDate(Builder $query, string $direction = 'desc'): Builder
    {
        return $query->orderBy('date', $direction);
    }

    /**
     * Scope: Records with primary students
     */
    public function scopeHasPrimaryServed(Builder $query): Builder
    {
        return $query->where('served_primary', '>', 0);
    }

    /**
     * Scope: Records with middle students
     */
    public function scopeHasMiddleServed(Builder $query): Builder
    {
        return $query->where('served_middle', '>', 0);
    }

    /**
     * Scope: Filter by school type
     */
    public function scopeForSchoolType(Builder $query, string $schoolType): Builder
    {
        return match($schoolType) {
            'primary' => $query->where('served_primary', '>', 0),
            'secondary' => $query->where('served_middle', '>', 0),
            'middle' => $query, // Has both sections
            default => $query
        };
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Check if this record has primary section data
     */
    public function hasPrimaryData(): bool
    {
        return ($this->served_primary ?? 0) > 0;
    }

    /**
     * Check if this record has middle section data
     */
    public function hasMiddleData(): bool
    {
        return ($this->served_middle ?? 0) > 0;
    }

    /**
     * Get served sections
     */
    public function getServedSections(): array
    {
        $sections = [];
        if ($this->hasPrimaryData()) $sections[] = 'primary';
        if ($this->hasMiddleData()) $sections[] = 'middle';
        return $sections;
    }

    /**
     * Check if stock is low after consumption
     */
    public function hasLowStock(): bool
    {
        return $this->rice_balance_after < 10;
    }

    /**
     * Check if stock is moderate
     */
    public function hasModerateStock(): bool
    {
        return $this->rice_balance_after >= 10 && $this->rice_balance_after < 50;
    }

    /**
     * Get balance status color class
     */
    public function getBalanceColorClass(): string
    {
        if ($this->rice_balance_after < 10) return 'text-red-600';
        if ($this->rice_balance_after < 50) return 'text-orange-600';
        return 'text-green-600';
    }

    /**
     * Check if record is from today
     */
    public function isToday(): bool
    {
        return $this->date->isToday();
    }

    /**
     * Check if record is from this week
     */
    public function isThisWeek(): bool
    {
        return $this->date ? $this->date->isCurrentWeek() : false;
    }

    /**
     * Check if record is from this month
     */
    public function isThisMonth(): bool
    {
        return $this->date ? $this->date->isCurrentMonth() : false;
    }

    /**
     * Get days ago
     */
    public function daysAgo(): int
    {
        return $this->date->diffInDays(now());
    }

    /**
     * Get human-readable time difference
     */
    public function timeAgo(): string
    {
        return $this->date->diffForHumans();
    }

    /**
     * ✅ UPDATED: Get rice rate for section from monthly configuration
     * Requires date parameter to find the correct month's configuration
     */
    public static function getRiceRate(int $userId, string $section, \Carbon\Carbon $date): float
    {
        $config = MonthlyRiceConfiguration::where('user_id', $userId)
            ->where('month', $date->month)
            ->where('year', $date->year)
            ->first();
        
        if (!$config) {
            // Fallback to default rates if no config for this month
            return match($section) {
                'primary' => 0.1,
                'middle' => 0.15,
                default => throw new \InvalidArgumentException("Invalid section: {$section}")
            };
        }
        
        return match($section) {
            'primary' => $config->daily_consumption_primary / 1000,
            'middle' => $config->daily_consumption_upper_primary / 1000,
            default => throw new \InvalidArgumentException("Invalid section: {$section}")
        };
    }

    /**
     * Get summary array for API
     */
    public function toSummary(): array
    {
        return [
            'id' => $this->id,
            'date' => $this->formatted_date,
            'day' => $this->day,
            'sections_served' => $this->getServedSections(),
            'total_students' => $this->total_served,
            'rice' => [
                'primary' => $this->primary_rice,
                'middle' => $this->middle_rice,
                'total' => $this->total_rice,
                'balance_after' => $this->rice_balance_after,
            ],
            'amount' => [
                'consumed' => $this->amount_consumed,
                'breakdown' => $this->amount_breakdown,
            ],
            'remarks' => $this->remarks,
        ];
    }

    // =========================================================================
    // STATIC HELPERS
    // =========================================================================

    /**
     * Check if date already has a record
     */
    public static function dateExists(int $userId, string $date, ?int $excludeId = null): bool
    {
        $query = static::forUser($userId)->where('date', $date);
        if ($excludeId) $query->where('id', '!=', $excludeId);
        return $query->exists();
    }

    /**
     * Get total rice consumed for user
     */
    public static function getTotalRiceConsumed(int $userId): float
    {
        return (float) static::forUser($userId)->sum('rice_consumed');
    }

    /**
     * Get average daily consumption
     */
    public static function getAverageDailyConsumption(int $userId): float
    {
        $count = static::forUser($userId)->count();
        if ($count === 0) return 0;
        return round(static::getTotalRiceConsumed($userId) / $count, 2);
    }

    // =========================================================================
    // MODEL EVENTS
    // =========================================================================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set day name when date is set
        static::saving(function ($consumption) {
            if ($consumption->isDirty('date') && $consumption->date) {
                $consumption->day = $consumption->date->format('l');
            }
        });
    }
}