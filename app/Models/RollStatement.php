<?php
// Location: app/Models/RollStatement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RollStatement extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'roll_statements';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'date',
        'udise',
        'academic_year',
        'class',
        'boys',
        'girls',
        'total',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'date' => 'date',
        'user_id' => 'integer',
        'boys' => 'integer',
        'girls' => 'integer',
        'total' => 'integer',
    ];

    /**
     * Boot method to automatically calculate total.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($rollStatement) {
            $rollStatement->total = $rollStatement->boys + $rollStatement->girls;
        });
    }

    /**
     * Relationship: Roll statement belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by user ID.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by academic year.
     */
    public function scopeAcademicYear($query, $year)
    {
        if ($year) {
            return $query->where('academic_year', $year);
        }
        return $query;
    }

    /**
     * Scope to filter by month.
     */
    public function scopeMonth($query, $month)
    {
        if ($month) {
            // $month format: YYYY-MM
            return $query->whereYear('date', substr($month, 0, 4))
                        ->whereMonth('date', substr($month, 5, 2));
        }
        return $query;
    }

    /**
     * Scope to search by UDISE or date.
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('udise', 'like', "%{$search}%")
                  ->orWhere('date', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Check if the roll statement can be edited.
     * Only statements from the current month can be edited.
     */
    public function getCanBeEditedAttribute()
    {
        $currentMonth = Carbon::now()->format('Y-m');
        $statementMonth = Carbon::parse($this->date)->format('Y-m');
        
        return $currentMonth === $statementMonth;
    }

    /**
     * Check if the roll statement can be deleted.
     * Only statements from the current month can be deleted.
     */
    public function getCanBeDeletedAttribute()
    {
        $currentMonth = Carbon::now()->format('Y-m');
        $statementMonth = Carbon::parse($this->date)->format('Y-m');
        
        return $currentMonth === $statementMonth;
    }

    /**
     * Get formatted date.
     */
    public function getFormattedDateAttribute()
    {
        return Carbon::parse($this->date)->format('F d, Y');
    }

    /**
     * Get class label.
     */
    public function getClassLabelAttribute()
    {
        $labels = [
            'kg' => 'KG',
            '1' => 'Class 1',
            '2' => 'Class 2',
            '3' => 'Class 3',
            '4' => 'Class 4',
            '5' => 'Class 5',
            '6' => 'Class 6',
            '7' => 'Class 7',
            '8' => 'Class 8',
        ];

        return $labels[$this->class] ?? $this->class;
    }

    /**
     * Get the month name from date.
     */
    public function getMonthNameAttribute()
    {
        return Carbon::parse($this->date)->format('F Y');
    }
} 