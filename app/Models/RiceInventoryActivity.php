<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ✅ UPDATED: RiceInventoryActivity Model - Added ARRANGED Action
 */
class RiceInventoryActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'config_id',
        'month',
        'year',
        'action',
        'amount_primary',
        'amount_upper_primary',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'amount_primary' => 'decimal:2',
        'amount_upper_primary' => 'decimal:2',
    ];

    // ✅ Action constants
    public const ACTION_OPENED = 'opened';
    public const ACTION_LIFTED = 'lifted';
    public const ACTION_ARRANGED = 'arranged';  // ✅ NEW ACTION
    public const ACTION_CONSUMED = 'consumed';
    public const ACTION_ADJUSTED = 'adjusted';
    public const ACTION_EDITED = 'edited';
    public const ACTION_RESET = 'reset';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(MonthlyRiceConfiguration::class, 'config_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForConfig($query, int $configId)
    {
        return $query->where('config_id', $configId);
    }

    public function scopeForPeriod($query, int $month, int $year)
    {
        return $query->where('month', $month)->where('year', $year);
    }

    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function getFormattedPeriodAttribute(): string
    {
        $monthName = date('F', mktime(0, 0, 0, $this->month, 1));
        return "{$monthName} {$this->year}";
    }

    public function getDescriptionAttribute(): string
    {
        $monthName = date('F', mktime(0, 0, 0, $this->month, 1));
        
        switch ($this->action) {
            case self::ACTION_OPENED:
                return "Opening balance set for {$monthName} {$this->year}";
            
            case self::ACTION_LIFTED:
                return "Rice lifted from government supply";
            
            case self::ACTION_ARRANGED:  // ✅ NEW
                return "Rice arranged from alternative sources";
            
            case self::ACTION_CONSUMED:
                return "Rice consumed for {$monthName} {$this->year}";
            
            case self::ACTION_ADJUSTED:
                return "Balance adjusted for {$monthName} {$this->year}";
            
            case self::ACTION_EDITED:
                return "Configuration edited for {$monthName} {$this->year}";
            
            case self::ACTION_RESET:
                return "Configuration reset for {$monthName} {$this->year}";
            
            default:
                return "Unknown action for {$monthName} {$this->year}";
        }
    }

    /**
     * ✅ Get action display label with icon
     */
    public function getActionLabelAttribute(): string
    {
        return match($this->action) {
            self::ACTION_OPENED => '🆕 Opened',
            self::ACTION_LIFTED => '📦 Lifted',
            self::ACTION_ARRANGED => '🤝 Arranged',  // ✅ NEW
            self::ACTION_CONSUMED => '🍚 Consumed',
            self::ACTION_ADJUSTED => '⚖️ Adjusted',
            self::ACTION_EDITED => '✏️ Edited',
            self::ACTION_RESET => '🔄 Reset',
            default => '❓ Unknown',
        };
    }

    /**
     * ✅ Get total amount for this activity
     */
    public function getTotalAmountAttribute(): float
    {
        return round(
            ($this->amount_primary ?? 0) + 
            ($this->amount_upper_primary ?? 0),
            2
        );
    }

    /**
     * ✅ Get color class for action badge
     */
    public function getActionColorAttribute(): string
    {
        return match($this->action) {
            self::ACTION_OPENED => 'bg-blue-100 text-blue-800',
            self::ACTION_LIFTED => 'bg-green-100 text-green-800',
            self::ACTION_ARRANGED => 'bg-purple-100 text-purple-800',
            self::ACTION_CONSUMED => 'bg-orange-100 text-orange-800',
            self::ACTION_ADJUSTED => 'bg-yellow-100 text-yellow-800',
            self::ACTION_EDITED => 'bg-indigo-100 text-indigo-800',
            self::ACTION_RESET => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
}