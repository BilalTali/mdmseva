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
        'is_locked'
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
        'completed_at' => 'datetime'
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
            'previous_month_id' => $previousConfig->id
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
}
