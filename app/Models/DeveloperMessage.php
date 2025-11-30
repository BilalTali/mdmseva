<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class DeveloperMessage extends Model
{
    protected $table = 'developer_messages';
    
    protected $fillable = [
        'name',
        'designation',
        'role',
        'title',
        'message',
        'image_path',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Scope a query to only include active messages.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    /**
     * Get ALL active messages for display
     */
    public static function getActiveMessages()
    {
        return static::where('status', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Set this message as active (allows multiple active messages)
     */
    public function setAsActive(): void
    {
        // Allow multiple active messages now
        $this->update(['status' => true]);
    }
}
