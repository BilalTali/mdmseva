<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * MonthlyRiceConfiguration Model - Month-based rice inventory tracking
 * 
 * Each month has its own rice configuration with:
 * - Opening balance (carried from previous or manually set)
 * - Rice lifted (government supply)
 * - Rice arranged (alternative sources)
 * - Consumed (auto-synced from daily consumption)
 * - Closing balance (carried to next month)
 */
class MonthlyRiceConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'school_type',
        'daily_consumption_primary',
        'daily_consumption_upper_primary',
        'opening_balance_primary',
        'opening_balance_upper_primary',
        'rice_lifted_primary',
        'rice_lifted_upper_primary',
        'rice_arranged_primary',
        'rice_arranged_upper_primary',
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
        'locked_at',
        'locked_by',
        'lock_reason',
        'unlocked_at',
        'unlocked_by',
        'unlock_reason',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'daily_consumption_primary' => 'integer',
        'daily_consumption_upper_primary' => 'integer',
        'opening_balance_primary' => 'decimal:2',
        'opening_balance_upper_primary' => 'decimal:2',
        'rice_lifted_primary' => 'decimal:2',
        'rice_lifted_upper_primary' => 'decimal:2',
        'rice_arranged_primary' => 'decimal:2',
        'rice_arranged_upper_primary' => 'decimal:2',
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
        'locked_at' => 'datetime',
        'unlocked_at' => 'datetime',
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
        return $this->belongsTo(MonthlyRiceConfiguration::class, 'previous_month_id');
    }

    public function nextMonth(): HasMany
    {
        return $this->hasMany(MonthlyRiceConfiguration::class, 'previous_month_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function unlockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'unlocked_by');
    }

    public function dailyConsumptions(): HasMany
    {
        return $this->hasMany(DailyConsumption::class, 'user_id', 'user_id')
            ->whereMonth('date', $this->month)
            ->whereYear('date', $this->year);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(RiceInventoryActivity::class, 'user_id', 'user_id')
            ->where('month', $this->month)
            ->where('year', $this->year);
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

    public function scopeLocked($query)
    {
        return $query->where('is_locked', true);
    }

    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('month', $now->month)
                    ->where('year', $now->year);
    }

    public function scopeLatestFirst($query)
    {
        return $query->orderBy('year', 'desc')->orderBy('month', 'desc');
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

    public function getTotalRiceLiftedAttribute(): float
    {
        return round(
            ($this->rice_lifted_primary ?? 0) + 
            ($this->rice_lifted_upper_primary ?? 0),
            2
        );
    }

    public function getTotalRiceArrangedAttribute(): float
    {
        return round(
            ($this->rice_arranged_primary ?? 0) + 
            ($this->rice_arranged_upper_primary ?? 0),
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
            ($this->rice_lifted_primary ?? 0) + 
            ($this->rice_arranged_primary ?? 0);
            
        $this->total_available_upper_primary = 
            ($this->opening_balance_upper_primary ?? 0) + 
            ($this->rice_lifted_upper_primary ?? 0) + 
            ($this->rice_arranged_upper_primary ?? 0);

        $this->closing_balance_primary = 
            $this->total_available_primary - ($this->consumed_primary ?? 0);
            
        $this->closing_balance_upper_primary = 
            $this->total_available_upper_primary - ($this->consumed_upper_primary ?? 0);
    }

    /**
     * Sync consumed amounts from daily consumption records for this month
     */
    public function syncConsumedFromDaily(): void
    {
        $primaryRate = ($this->daily_consumption_primary ?? 100) / 1000;
        $upperRate = ($this->daily_consumption_upper_primary ?? 150) / 1000;

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
     * Check if month can be completed
     */
    public function canBeCompleted(): bool
    {
        return !$this->is_completed && !$this->is_locked;
    }

    /**
     * Check if configuration can be edited
     */
    public function canBeEdited(): bool
    {
        return !$this->is_locked;
    }

    /**
     * Complete this month and create completion record
     */
    public function completeMonth(int $completedByUserId, ?string $notes = null): bool
    {
        if (!$this->canBeCompleted()) {
            return false;
        }

        DB::beginTransaction();
        try {
            // Sync consumed amounts before completing
            $this->syncConsumedFromDaily();
            $this->save();

            // Mark as completed
            $this->is_completed = true;
            $this->completed_at = now();
            $this->completed_by = $completedByUserId;
            $this->save();

            // Get amount configuration for this month
            $amountConfig = MonthlyAmountConfiguration::forUser($this->user_id)
                ->forPeriod($this->month, $this->year)
                ->first();

            // Create completion log
            MonthCompletion::create([
                'user_id' => $this->user_id,
                'month' => $this->month,
                'year' => $this->year,
                'rice_config_id' => $this->id,
                'amount_config_id' => $amountConfig?->id,
                'rice_closing_balance_primary' => $this->closing_balance_primary,
                'rice_closing_balance_upper_primary' => $this->closing_balance_upper_primary,
                'amount_closing_balance_primary' => $amountConfig?->closing_balance_primary,
                'amount_closing_balance_upper_primary' => $amountConfig?->closing_balance_upper_primary,
                'total_consumption_days' => $this->dailyConsumptions()->count(),
                'total_rice_consumed' => $this->total_consumed,
                'total_amount_consumed' => ($amountConfig?->consumed_primary ?? 0) + ($amountConfig?->consumed_upper_primary ?? 0),
                'completed_at' => now(),
                'completed_by' => $completedByUserId,
                'notes' => $notes
            ]);

            Log::info('Month completed', [
                'user_id' => $this->user_id,
                'period' => $this->period,
                'closing_balance' => $this->total_closing_balance
            ]);

            // Auto-create next month configuration with carried opening balances if it doesn't exist yet
            $nextMonth = $this->month == 12 ? 1 : $this->month + 1;
            $nextYear = $this->month == 12 ? $this->year + 1 : $this->year;

            $nextExists = self::forUser($this->user_id)
                ->forPeriod($nextMonth, $nextYear)
                ->exists();

            if (!$nextExists) {
                self::createNextMonth($this->user_id, $this);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete month', [
                'user_id' => $this->user_id,
                'period' => $this->period,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create next month configuration with carried forward balances
     */
    public static function createNextMonth(
        int $userId,
        ?MonthlyRiceConfiguration $previousConfig = null,
        array $overrides = []
    ): self {
        DB::beginTransaction();
        try {
            if ($previousConfig) {
                // Calculate next month/year
                $nextMonth = $previousConfig->month == 12 ? 1 : $previousConfig->month + 1;
                $nextYear = $previousConfig->month == 12 ? $previousConfig->year + 1 : $previousConfig->year;

                $config = self::create(array_merge([
                    'user_id' => $userId,
                    'month' => $nextMonth,
                    'year' => $nextYear,
                    'school_type' => $previousConfig->school_type,
                    'daily_consumption_primary' => $previousConfig->daily_consumption_primary,
                    'daily_consumption_upper_primary' => $previousConfig->daily_consumption_upper_primary,
                    'opening_balance_primary' => $previousConfig->closing_balance_primary,
                    'opening_balance_upper_primary' => $previousConfig->closing_balance_upper_primary,
                    'rice_lifted_primary' => 0,
                    'rice_lifted_upper_primary' => 0,
                    'rice_arranged_primary' => 0,
                    'rice_arranged_upper_primary' => 0,
                    'opening_carried_from_previous' => true,
                    'previous_month_id' => $previousConfig->id
                ], $overrides));
            } else {
                // Create for current month (no previous)
                $now = now();
                $config = self::create(array_merge([
                    'user_id' => $userId,
                    'month' => $now->month,
                    'year' => $now->year,
                    'opening_balance_primary' => 0,
                    'opening_balance_upper_primary' => 0,
                    'rice_lifted_primary' => 0,
                    'rice_lifted_upper_primary' => 0,
                    'rice_arranged_primary' => 0,
                    'rice_arranged_upper_primary' => 0
                ], $overrides));
            }

            $config->recomputeTotals();
            $config->save();

            Log::info('Next month configuration created', [
                'user_id' => $userId,
                'period' => $config->period,
                'carried_from_previous' => $config->opening_carried_from_previous
            ]);

            DB::commit();
            return $config;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create next month configuration', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get or create configuration for specific period
     * ✅ UPDATED: Always carries forward from previous month, regardless of completion status
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

        // Check if previous month exists to carry balance
        $prevMonth = $month == 1 ? 12 : $month - 1;
        $prevYear = $month == 1 ? $year - 1 : $year;
        
        $previousConfig = self::forUser($userId)
            ->forPeriod($prevMonth, $prevYear)
            ->first();

        // ✅ UPDATED: Carry forward regardless of completion status
        if ($previousConfig) {
            // Sync consumed amounts to get current closing balance
            $previousConfig->syncConsumedFromDaily();
            $previousConfig->save();
            
            Log::info('Creating next month with carry-forward', [
                'user_id' => $userId,
                'new_period' => "{$month}/{$year}",
                'previous_period' => "{$prevMonth}/{$prevYear}",
                'previous_completed' => $previousConfig->is_completed,
                'carried_balance_primary' => $previousConfig->closing_balance_primary,
                'carried_balance_upper' => $previousConfig->closing_balance_upper_primary,
            ]);
            
            return self::createNextMonth($userId, $previousConfig, $defaults);
        }

        // Create fresh configuration (no previous month exists)
        return self::create(array_merge([
            'user_id' => $userId,
            'month' => $month,
            'year' => $year,
            'opening_balance_primary' => 0,
            'opening_balance_upper_primary' => 0
        ], $defaults));
    }
}
