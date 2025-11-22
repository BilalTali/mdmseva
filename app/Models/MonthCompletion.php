<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * MonthCompletion Model - Tracks month-end completion events
 */
class MonthCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'rice_config_id',
        'amount_config_id',
        'rice_closing_balance_primary',
        'rice_closing_balance_upper_primary',
        'amount_closing_balance_primary',
        'amount_closing_balance_upper_primary',
        'total_consumption_days',
        'total_rice_consumed',
        'total_amount_consumed',
        'completed_at',
        'completed_by',
        'notes'
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'rice_closing_balance_primary' => 'decimal:2',
        'rice_closing_balance_upper_primary' => 'decimal:2',
        'amount_closing_balance_primary' => 'decimal:2',
        'amount_closing_balance_upper_primary' => 'decimal:2',
        'total_consumption_days' => 'integer',
        'total_rice_consumed' => 'decimal:2',
        'total_amount_consumed' => 'decimal:2',
        'completed_at' => 'datetime'
    ];

    // ===============================================
    // RELATIONSHIPS
    // ===============================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function riceConfig(): BelongsTo
    {
        return $this->belongsTo(MonthlyRiceConfiguration::class, 'rice_config_id');
    }

    public function amountConfig(): BelongsTo
    {
        return $this->belongsTo(MonthlyAmountConfiguration::class, 'amount_config_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
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

    public function getTotalRiceClosingBalanceAttribute(): float
    {
        return round(
            ($this->rice_closing_balance_primary ?? 0) + 
            ($this->rice_closing_balance_upper_primary ?? 0),
            2
        );
    }

    public function getTotalAmountClosingBalanceAttribute(): float
    {
        return round(
            ($this->amount_closing_balance_primary ?? 0) + 
            ($this->amount_closing_balance_upper_primary ?? 0),
            2
        );
    }
}
