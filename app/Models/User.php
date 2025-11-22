<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Traits\HasRoles;

/**
 * User Model - Complete with All Relationships + RBAC using Spatie Permission
 * 
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $date_of_birth
 * @property string|null $address
 * @property string|null $udise
 * @property string|null $state
 * @property string|null $district
 * @property string|null $zone
 * @property int|null $district_id
 * @property int|null $zone_id
 * @property bool $is_active
 * @property string|null $school_name
 * @property string $school_type (primary|middle|secondary)
 * @property string|null $institute_address
 * @property string|null $school_pincode
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * School type constants
     */
    const SCHOOL_TYPE_PRIMARY = 'primary';      // Classes I-V
    const SCHOOL_TYPE_MIDDLE = 'middle';        // Classes I-VIII (both)
    const SCHOOL_TYPE_SECONDARY = 'secondary';  // Classes VI-VIII

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'date_of_birth',
        'address',
        'udise',
        'state',
        'district',
        'zone',
        'district_id',
        'zone_id',
        'is_active',
        'school_name',
        'school_type',
        'institute_address',
        'school_pincode',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // =========================================================================
    // LOCATION RELATIONSHIPS
    // =========================================================================

    /**
     * Get the district that owns this user.
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /**
     * Get the zone that owns this user.
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    // =========================================================================
    // RBAC HELPER METHODS (using Spatie's built-in methods)
    // =========================================================================

    /**
     * Check if user is an admin.
     * Uses Spatie's hasRole() method
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is a school.
     * Uses Spatie's hasRole() method
     *
     * @return bool
     */
    public function isSchool(): bool
    {
        return $this->hasRole('school');
    }

    // =========================================================================
    // RBAC SCOPES
    // =========================================================================

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive users.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope a query to filter by district.
     */
    public function scopeByDistrict(Builder $query, int $districtId): Builder
    {
        return $query->where('district_id', $districtId);
    }

    /**
     * Scope a query to filter by zone.
     */
    public function scopeByZone(Builder $query, int $zoneId): Builder
    {
        return $query->where('zone_id', $zoneId);
    }

    /**
     * Scope a query to only include users with 'school' role.
     */
    public function scopeSchools(Builder $query): Builder
    {
        return $query->role('school');
    }

    // =========================================================================
    // RBAC ACCESSORS
    // =========================================================================

    /**
     * Get full location string (Zone, District, State).
     */
    public function getFullLocationAttribute(): string
    {
        $parts = [];
        
        if ($this->zone) {
            $parts[] = $this->zone->name ?? $this->zone;
        }
        
        if ($this->district) {
            $parts[] = $this->district->name ?? $this->district;
        }
        
        if ($this->state) {
            $parts[] = $this->state;
        }
        
        return implode(', ', array_filter($parts));
    }

    /**
     * Get status badge text.
     */
    public function getStatusBadgeAttribute(): string
    {
        return $this->is_active ? 'Active' : 'Inactive';
    }

    // =========================================================================
    // EXISTING RELATIONSHIPS
    // =========================================================================

    /**
     * Get all daily consumption records for this user
     */
    public function dailyConsumptions(): HasMany
    {
        return $this->hasMany(DailyConsumption::class);
    }

    /**
     * Get rice configurations for this user
     */
    public function riceConfigurations(): HasMany
    {
        return $this->hasMany(MonthlyRiceConfiguration::class);
    }

    /**
     * Get amount configurations for this user
     */
    public function amountConfigurations(): HasMany
    {
        return $this->hasMany(AmountConfiguration::class);
    }

    /**
     * Get all rice reports for this user
     */
    public function riceReports(): HasMany
    {
        return $this->hasMany(RiceReport::class);
    }

    /**
     * Get all roll statements for this user (by UDISE matching)
     */
    public function rollStatements(): HasMany
    {
        // RollStatements are linked by UDISE code, not user_id
        return $this->hasMany(RollStatement::class, 'udise', 'udise');
    }

    /**
     * Get the latest roll statement for this user
     */
    public function getLatestRollStatement(): ?RollStatement
    {
        return RollStatement::where('udise', $this->udise)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Get latest rice report
     */
    public function getLatestRiceReport(): ?RiceReport
    {
        return $this->riceReports()
            ->latest('year')
            ->latest('month')
            ->first();
    }

    /**
     * Get enrollment data from latest roll statements
     * Aggregates data from multiple class entries for the most recent date
     */
    public function getEnrollmentData(): array
    {
        if (!$this->udise) {
            return [
                'primary' => 0,
                'middle' => 0,
                'total' => 0,
            ];
        }

        // Get the most recent date for this UDISE
        $latestDate = RollStatement::where('udise', $this->udise)
            ->orderBy('date', 'desc')
            ->value('date');

        if (!$latestDate) {
            return [
                'primary' => 0,
                'middle' => 0,
                'total' => 0,
            ];
        }

        // Get all class entries for that latest date
        $statements = RollStatement::where('udise', $this->udise)
            ->where('date', $latestDate)
            ->get();

        // Define primary classes (KG, 1-5)
        $primaryClasses = ['kg', '1', '2', '3', '4', '5'];
        
        // Define middle classes (6-8)
        $middleClasses = ['6', '7', '8'];

        // Calculate totals by filtering and summing
        $primaryTotal = $statements->filter(function ($stmt) use ($primaryClasses) {
            return in_array(strtolower($stmt->class), $primaryClasses);
        })->sum('total');

        $middleTotal = $statements->filter(function ($stmt) use ($middleClasses) {
            return in_array(strtolower($stmt->class), $middleClasses);
        })->sum('total');

        return [
            'primary' => (int) $primaryTotal,
            'middle' => (int) $middleTotal,
            'total' => (int) ($primaryTotal + $middleTotal),
        ];
    }

    // =========================================================================
    // SCHOOL TYPE HELPERS
    // =========================================================================

    /**
     * Check if school has primary students (Classes I-V)
     */
    public function hasPrimaryStudents(): bool
    {
        return in_array($this->school_type, [self::SCHOOL_TYPE_PRIMARY, self::SCHOOL_TYPE_MIDDLE]);
    }

    /**
     * Check if school has middle students (Classes VI-VIII)
     */
    public function hasMiddleStudents(): bool
    {
        return in_array($this->school_type, [self::SCHOOL_TYPE_MIDDLE, self::SCHOOL_TYPE_SECONDARY]);
    }

    /**
     * Get required sections for this school type
     */
    public function getRequiredSections(): array
    {
        $sections = [];
        if ($this->hasPrimaryStudents()) $sections[] = 'primary';
        if ($this->hasMiddleStudents()) $sections[] = 'middle';
        return $sections;
    }

    /**
     * Check if school is primary only
     */
    public function isPrimaryOnly(): bool
    {
        return $this->school_type === self::SCHOOL_TYPE_PRIMARY;
    }

    /**
     * Check if school is secondary only
     */
    public function isSecondaryOnly(): bool
    {
        return $this->school_type === self::SCHOOL_TYPE_SECONDARY;
    }

    /**
     * Check if school has both sections
     */
    public function hasBothSections(): bool
    {
        return $this->school_type === self::SCHOOL_TYPE_MIDDLE;
    }

    /**
     * Get school type label
     */
    public function getSchoolTypeLabel(): string
    {
        return match($this->school_type) {
            self::SCHOOL_TYPE_PRIMARY => 'Primary School (I-V)',
            self::SCHOOL_TYPE_MIDDLE => 'Middle School (I-VIII)',
            self::SCHOOL_TYPE_SECONDARY => 'Secondary School (VI-VIII)',
            default => 'Unknown',
        };
    }

    // =========================================================================
    // CONSUMPTION HELPERS
    // =========================================================================

    /**
     * Get latest daily consumption record
     */
    public function getLatestConsumption(): ?DailyConsumption
    {
        return $this->dailyConsumptions()
            ->latest('date')
            ->first();
    }

    /**
     * Get consumption for specific date
     */
    public function getConsumptionForDate(string $date): ?DailyConsumption
    {
        return $this->dailyConsumptions()
            ->where('date', $date)
            ->first();
    }

    /**
     * Check if consumption exists for date
     */
    public function hasConsumptionForDate(string $date): bool
    {
        return $this->dailyConsumptions()
            ->where('date', $date)
            ->exists();
    }

    /**
     * Get total consumption records count
     */
    public function getTotalConsumptionRecords(): int
    {
        return $this->dailyConsumptions()->count();
    }

    /**
     * Get consumption records for current month
     */
    public function getCurrentMonthConsumptions()
    {
        return $this->dailyConsumptions()
            ->currentMonth()
            ->orderedByDate('desc')
            ->get();
    }

    /**
     * Get total rice consumed
     */
    public function getTotalRiceConsumed(): float
    {
        return (float) $this->dailyConsumptions()->sum('rice_consumed');
    }

    /**
     * Get total students served (all time)
     */
    public function getTotalStudentsServed(): int
    {
        $consumptions = $this->dailyConsumptions()->get();
        return $consumptions->sum(fn($c) => ($c->served_primary ?? 0) + ($c->served_middle ?? 0));
    }

    /**
     * Get average daily rice consumption
     */
    public function getAverageDailyRice(): float
    {
        $count = $this->dailyConsumptions()->count();
        if ($count === 0) return 0;
        return round($this->getTotalRiceConsumed() / $count, 2);
    }

    /**
     * Get average students served per day
     */
    public function getAverageDailyStudents(): float
    {
        $count = $this->dailyConsumptions()->count();
        if ($count === 0) return 0;
        return round($this->getTotalStudentsServed() / $count, 2);
    }

    // =========================================================================
    // CONFIGURATION HELPERS
    // =========================================================================

    /**
     * Get latest rice configuration
     */
    public function getLatestRiceConfiguration(): ?MonthlyRiceConfiguration
    {
        return $this->riceConfigurations()
            ->latest()
            ->first();
    }

    /**
     * Get current/active rice configuration (singular accessor)
     * Used by controller as: $user->riceConfiguration
     */
    public function getRiceConfigurationAttribute(): ?MonthlyRiceConfiguration
    {
        return $this->getLatestRiceConfiguration();
    }

    /**
     * Get latest amount configuration
     */
    public function getLatestAmountConfiguration(): ?AmountConfiguration
    {
        return $this->amountConfigurations()
            ->latest()
            ->first();
    }

    /**
     * Check if rice configuration exists
     */
    public function hasRiceConfiguration(): bool
    {
        return $this->riceConfigurations()->exists();
    }

    /**
     * Check if amount configuration exists
     */
    public function hasAmountConfiguration(): bool
    {
        return $this->amountConfigurations()->exists();
    }

    /**
     * Get current rice balance
     *
     * Uses the latest rice configuration closing balances as the single
     * source of truth for stock (primary + upper primary), instead of the
     * last daily consumption record. This ensures the value reflects the
     * true configured balance, even if it is negative.
     */
    public function getCurrentRiceBalance(): float
    {
        $config = $this->getLatestRiceConfiguration();

        if (!$config) {
            return 0.0;
        }

        $primary = $config->closing_balance_primary ?? 0;
        $upper   = $config->closing_balance_upper_primary ?? 0;

        return (float) ($primary + $upper);
    }

    // =========================================================================
    // STATISTICS HELPERS
    // =========================================================================

    /**
     * Get comprehensive consumption statistics
     */
    public function getConsumptionStats(): array
    {
        return [
            'total_records' => $this->getTotalConsumptionRecords(),
            'total_rice_consumed' => $this->getTotalRiceConsumed(),
            'total_students_served' => $this->getTotalStudentsServed(),
            'current_rice_balance' => $this->getCurrentRiceBalance(),
            'avg_daily_rice' => $this->getAverageDailyRice(),
            'avg_daily_students' => $this->getAverageDailyStudents(),
            'has_rice_config' => $this->hasRiceConfiguration(),
            'has_amount_config' => $this->hasAmountConfiguration(),
        ];
    }

    /**
     * Get monthly consumption summary
     */
    public function getMonthlyConsumptionSummary(int $year, int $month): array
    {
        $records = $this->dailyConsumptions()
            ->forMonth($month, $year)
            ->get();
        
        return [
            'total_records' => $records->count(),
            'total_rice' => $records->sum('rice_consumed'),
            'total_amount' => $records->sum('amount_consumed'),
            'total_students' => $records->sum(fn($r) => ($r->served_primary ?? 0) + ($r->served_middle ?? 0)),
            'total_primary' => $records->sum('served_primary'),
            'total_middle' => $records->sum('served_middle'),
            'avg_daily_rice' => $records->avg('rice_consumed'),
        ];
    }

    // =========================================================================
    // RICE REPORT HELPERS
    // =========================================================================

    /**
     * Check if rice report exists for a specific period
     */
    public function hasRiceReportForPeriod(int $month, int $year): bool
    {
        return $this->riceReports()
            ->where('month', $month)
            ->where('year', $year)
            ->exists();
    }

    /**
     * Get rice report for specific period
     */
    public function getRiceReportForPeriod(int $month, int $year): ?RiceReport
    {
        return $this->riceReports()
            ->where('month', $month)
            ->where('year', $year)
            ->first();
    }

    /**
     * Get total rice reports count
     */
    public function getTotalRiceReports(): int
    {
        return $this->riceReports()->count();
    }

    /**
     * Get rice reports statistics
     */
    public function getRiceReportsStats(): array
    {
        $reports = $this->riceReports;
        
        return [
            'total_reports' => $reports->count(),
            'total_rice_consumed' => $reports->sum('total_rice_consumed'),
            'average_daily_consumption' => $reports->avg('average_daily_consumption'),
            'latest_report' => $this->getLatestRiceReport(),
        ];
    }

    // =========================================================================
    // VALIDATION HELPERS
    // =========================================================================

    /**
     * Check if user can create consumption entry
     */
    public function canCreateConsumption(): bool
    {
        return $this->hasRiceConfiguration();
    }

    /**
     * Get validation errors for creating consumption
     */
    public function getConsumptionValidationErrors(): array
    {
        $errors = [];
        
        if (!$this->hasRiceConfiguration()) {
            $errors[] = 'Rice configuration is required. Please set up your rice stock first.';
        }
        
        return $errors;
    }

    /**
     * Check if user can generate rice report for a period
     */
    public function canGenerateRiceReport(int $month, int $year): array
    {
        $errors = [];
        
        // Check if rice configuration exists
        if (!$this->hasRiceConfiguration()) {
            $errors[] = 'Rice configuration is required. Please set up your rice stock first.';
        }
        
        // Check if consumption data exists for the period
        $hasConsumption = $this->dailyConsumptions()
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->exists();
            
        if (!$hasConsumption) {
            $errors[] = "No consumption data found for the selected period.";
        }
        
        return [
            'can_generate' => empty($errors),
            'errors' => $errors,
        ];
    }
}