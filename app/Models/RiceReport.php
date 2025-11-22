<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiceReport extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'school_type',
        'opening_balance',
        'closing_balance',
        'total_primary_students',
        'total_primary_rice',
        'total_middle_students',
        'total_middle_rice',
        'total_rice_consumed',
        'total_serving_days',
        'average_daily_consumption',
        'daily_records',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'total_primary_students' => 'integer',
        'total_primary_rice' => 'decimal:2',
        'total_middle_students' => 'integer',
        'total_middle_rice' => 'decimal:2',
        'total_rice_consumed' => 'decimal:2',
        'total_serving_days' => 'integer',
        'average_daily_consumption' => 'decimal:2',
        'daily_records' => 'array',
    ];

    /**
     * Relationship: Report belongs to a User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: Get month name (e.g., "March")
     */
    public function getMonthNameAttribute(): string
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }

    /**
     * Accessor: Get period (e.g., "March 2024")
     */
    public function getPeriodAttribute(): string
    {
        return $this->month_name . ' ' . $this->year;
    }

    /**
     * Accessor: Get formatted period for display
     */
    public function getFormattedPeriodAttribute(): string
    {
        return $this->period;
    }

    /**
     * Scope: Filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter by period (month and year)
     */
    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    /**
     * Scope: Order by latest period (year DESC, month DESC)
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('year', 'desc')->orderBy('month', 'desc');
    }

    /**
     * Scope: Order by most recent creation date
     */
    public function scopeRecentFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Get daily summary formatted for display
     *
     * @return array
     */
    public function getDailySummary(): array
    {
        if (!$this->daily_records) {
            return [];
        }

        return collect($this->daily_records)->map(function ($record) {
            return [
                'date' => $record['date'] ?? '',
                'day' => $record['day'] ?? '',
                'served_primary' => $record['served_primary'] ?? 0,
                'served_middle' => $record['served_middle'] ?? 0,
                'primary_rice' => number_format($record['primary_rice'] ?? 0, 2),
                'middle_rice' => number_format($record['middle_rice'] ?? 0, 2),
                'total_rice' => number_format($record['total_rice'] ?? 0, 2),
                'balance_after' => number_format($record['balance_after'] ?? 0, 2),
                'remarks' => $record['remarks'] ?? '',
            ];
        })->toArray();
    }

    /**
     * Get totals grouped by section
     *
     * @return array
     */
    public function getTotalsBySection(): array
    {
        return [
            'primary' => [
                'students' => $this->total_primary_students,
                'rice' => $this->total_primary_rice,
                'formatted_rice' => number_format($this->total_primary_rice, 2),
            ],
            'middle' => [
                'students' => $this->total_middle_students,
                'rice' => $this->total_middle_rice,
                'formatted_rice' => number_format($this->total_middle_rice, 2),
            ],
            'grand_total' => [
                'students' => $this->total_primary_students + $this->total_middle_students,
                'rice' => $this->total_rice_consumed,
                'formatted_rice' => number_format($this->total_rice_consumed, 2),
                'serving_days' => $this->total_serving_days,
                'average_daily' => number_format($this->average_daily_consumption, 2),
            ],
        ];
    }
}