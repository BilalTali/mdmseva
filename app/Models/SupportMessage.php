<?php

namespace App\Models;

// ============================================
// FILE 3 of 10: SupportMessage Model
// Location: app/Models/SupportMessage.php
// 
// COMMAND TO CREATE:
// php artisan make:model SupportMessage
// (Then replace content with this file)
// ============================================

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'support_chat_id',
        'user_id',
        'message',
        'is_admin',
        'is_ai_generated',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'is_ai_generated' => 'boolean',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected $appends = ['sender_name', 'message_type'];

    /**
     * Get the chat this message belongs to
     */
    public function chat(): BelongsTo
    {
        return $this->belongsTo(SupportChat::class, 'support_chat_id');
    }

    /**
     * Get the user who sent this message
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get attachments for this message
     */
    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class, 'support_message_id');
    }

    /**
     * Get sender name attribute
     */
    public function getSenderNameAttribute(): string
    {
        return $this->user ? $this->user->name : 'Unknown';
    }

    /**
     * Get message type attribute ('user', 'admin', or 'ai')
     */
    public function getMessageTypeAttribute(): string
    {
        if (!$this->is_admin) return 'user';
        return $this->is_ai_generated ? 'ai' : 'admin';
    }

    /**
     * Mark message as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Scope to get unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope to get messages for a chat
     */
    public function scopeForChat($query, int $chatId)
    {
        return $query->where('support_chat_id', $chatId);
    }
}