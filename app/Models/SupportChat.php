<?php

namespace App\Models;

// ============================================
// FILE 2 of 10: SupportChat Model
// Location: app/Models/SupportChat.php
// 
// COMMAND TO CREATE:
// php artisan make:model SupportChat
// (Then replace content with this file)
// ============================================


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportChat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'status',
        'assigned_to',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the user who created the chat
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin assigned to this chat
     */
    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get all messages in this chat
     */
    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class);
    }

    /**
     * Get unread messages count for a specific user
     */
    public function unreadMessagesCount(int $userId): int
    {
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Mark all messages as read for a specific user
     */
    public function markAsRead(int $userId): void
    {
        $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Get the latest message
     */
    public function latestMessage()
    {
        return $this->hasOne(SupportMessage::class)->latest();
    }

    /**
     * Scope to get active chats
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['open', 'in_progress']);
    }

    /**
     * Scope to get chats for a specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get chats assigned to admin
     */
    public function scopeAssignedTo($query, int $adminId)
    {
        return $query->where('assigned_to', $adminId);
    }

    /**
     * Check if chat is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['open', 'in_progress']);
    }

    /**
     * Close the chat
     */
    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    /**
     * Reopen the chat
     */
    public function reopen(): void
    {
        $this->update(['status' => 'open']);
    }
}