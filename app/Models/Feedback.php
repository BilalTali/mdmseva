<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Feedback extends Model
{
    protected $table = 'feedback';
    
    protected $fillable = [
        'user_id', 'name', 'email', 'phone', 'school_name', 'udise_code',
        'state', 'district', 'zone', 'subject', 'message', 'rating', 'type',
        'category', 'status', 'priority', 'admin_response', 'responded_at',
        'responded_by', 'ip_address', 'user_agent', 'metadata'
    ];

    protected $casts = [
        'rating' => 'integer',
        'responded_at' => 'datetime',
        'metadata' => 'array'
    ];

    public function respondedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function scopeNew(Builder $query): Builder
    {
        return $query->where('status', 'new');
    }

    public function scopeUnresolved(Builder $query): Builder
    {
        return $query->whereIn('status', ['new', 'in_progress']);
    }

    public function markAsResolved(User $admin, string $response = null): void
    {
        $this->update([
            'status' => 'resolved',
            'admin_response' => $response,
            'responded_by' => $admin->id,
            'responded_at' => now()
        ]);
    }
}
