<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * MonthlyConfiguration Model
 * 
 * Tracks monthly configuration completion status and opening/closing balances
 * for proper month-to-month transitions in the MDM Seva application.
 */
class MonthlyConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'rice_config_completed',
        'amount_config_completed',
        'opening_balance_primary',
        'opening_balance_upper_primary',
        'closing_balance_primary',
        'closing_balance_upper_primary',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'rice_config_completed' => 'boolean',
        'amount_config_completed' => 'boolean',
        'opening_balance_primary' => 'decimal:2',
        'opening_balance_upper_primary' => 'decimal:2',
        'closing_balance_primary' => 'decimal:2',
        'closing_balance_upper_primary' => 'decimal:2',
    ];

    /**
     * Get the user that owns this monthly configuration
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if both rice and amount configurations are completed
     */
    public function isFullyConfigured(): bool
    {
        return $this->rice_config_completed && $this->amount_config_completed;
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by period (month and year)
     */
    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    /**
     * Get the previous month's configuration
     */
    public function getPreviousMonth(): ?self
    {
        $prevMonth = $this->month == 1 ? 12 : $this->month - 1;
        $prevYear = $this->month == 1 ? $this->year - 1 : $this->year;

        return static::forUser($this->user_id)
            ->forPeriod($prevMonth, $prevYear)
            ->first();
    }

    /**
     * Get the next month's configuration
     */
    public function getNextMonth(): ?self
    {
        $nextMonth = $this->month == 12 ? 1 : $this->month + 1;
        $nextYear = $this->month == 12 ? $this->year + 1 : $this->year;

        return static::forUser($this->user_id)
            ->forPeriod($nextMonth, $nextYear)
            ->first();
    }

    /**
     * Transfer closing balance to next month's opening balance
     * Creates next month's configuration if it doesn't exist
     */
    public function transferClosingToOpening(): self
    {
        $nextMonth = $this->month == 12 ? 1 : $this->month + 1;
        $nextYear = $this->month == 12 ? $this->year + 1 : $this->year;

        $nextConfig = static::firstOrCreate(
            [
                'user_id' => $this->user_id,
                'month' => $nextMonth,
                'year' => $nextYear,
            ],
            [
                'opening_balance_primary' => $this->closing_balance_primary,
                'opening_balance_upper_primary' => $this->closing_balance_upper_primary,
                'rice_config_completed' => false,
                'amount_config_completed' => false,
            ]
        );

        // Update opening balances if record already existed
        if (!$nextConfig->wasRecentlyCreated) {
            $nextConfig->update([
                'opening_balance_primary' => $this->closing_balance_primary,
                'opening_balance_upper_primary' => $this->closing_balance_upper_primary,
            ]);
        }

        return $nextConfig;
    }

    /**
     * Get formatted period string (e.g., "January 2025")
     */
    public function getFormattedPeriodAttribute(): string
    {
        return Carbon::create($this->year, $this->month, 1)->format('F Y');
    }

    /**
     * Get month name
     */
    public function getMonthNameAttribute(): string
    {
        return Carbon::create($this->year, $this->month, 1)->format('F');
    }

    /**
     * Calculate and update closing balances based on rice configuration
     * and daily consumptions for this month
     */
    public function updateClosingBalances(): void
    {
        $riceConfig = MonthlyRiceConfiguration::where('user_id', $this->user_id)->latest()->first();
        
        if (!$riceConfig) {
            return;
        }

        // Get total available for this month
        $totalAvailablePrimary = $this->opening_balance_primary + 
            ($riceConfig->rice_lifted_primary ?? 0) + 
            ($riceConfig->rice_arranged_primary ?? 0);
            
        $totalAvailableUpperPrimary = $this->opening_balance_upper_primary + 
            ($riceConfig->rice_lifted_upper_primary ?? 0) + 
            ($riceConfig->rice_arranged_upper_primary ?? 0);

        // Get consumed amounts for this specific month
        $primaryRate = $riceConfig->daily_consumption_primary / 1000;
        $middleRate = $riceConfig->daily_consumption_upper_primary / 1000;

        $totalConsumedPrimary = DailyConsumption::where('user_id', $this->user_id)
            ->whereYear('date', $this->year)
            ->whereMonth('date', $this->month)
            ->selectRaw('SUM(served_primary * ?) as total', [$primaryRate])
            ->value('total') ?? 0;

        $totalConsumedMiddle = DailyConsumption::where('user_id', $this->user_id)
            ->whereYear('date', $this->year)
            ->whereMonth('date', $this->month)
            ->selectRaw('SUM(served_middle * ?) as total', [$middleRate])
            ->value('total') ?? 0;

        // Calculate closing balances (can be negative)
        $this->closing_balance_primary = round($totalAvailablePrimary - $totalConsumedPrimary, 2);
        $this->closing_balance_upper_primary = round($totalAvailableUpperPrimary - $totalConsumedMiddle, 2);
        
        $this->save();
    }

    /**
     * Get or create monthly configuration for a specific period
     */
    public static function getOrCreateForPeriod(int $userId, int $month, int $year): self
    {
        return static::firstOrCreate(
            [
                'user_id' => $userId,
                'month' => $month,
                'year' => $year,
            ],
            [
                'rice_config_completed' => false,
                'amount_config_completed' => false,
                'opening_balance_primary' => 0,
                'opening_balance_upper_primary' => 0,
                'closing_balance_primary' => 0,
                'closing_balance_upper_primary' => 0,
            ]
        );
    }
}
