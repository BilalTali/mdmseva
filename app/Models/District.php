<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class District extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'state',
        'code',
    ];

    /**
     * Get the zones for this district.
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }

    /**
     * Get the users (schools) in this district.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Scope a query to only include Jammu & Kashmir districts.
     */
    public function scopeJammuKashmir(Builder $query): Builder
    {
        return $query->where('state', 'Jammu and Kashmir');
    }

    /**
     * Scope a query to only include Ladakh districts.
     */
    public function scopeLadakh(Builder $query): Builder
    {
        return $query->where('state', 'Ladakh');
    }
}