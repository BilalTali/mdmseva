<?php

namespace App\Events;
// ============================================
// FILE 4a of 10: NewSupportMessage Event
// Location: app/Events/NewSupportMessage.php
// 
// COMMAND TO CREATE:
// php artisan make:event NewSupportMessage
// 
// THEN REPLACE THE ENTIRE CONTENT WITH THIS FILE
// ============================================
use App\Models\SupportMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewSupportMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(SupportMessage $message)
    {
        $this->message = $message->load('user');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('support-chat.' . $this->message->support_chat_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'support.message';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'support_chat_id' => $this->message->support_chat_id,
            'user_id' => $this->message->user_id,
            'message' => $this->message->message,
            'is_admin' => $this->message->is_admin,
            'is_read' => $this->message->is_read,
            'sender_name' => $this->message->user->name ?? 'Unknown',
            'created_at' => $this->message->created_at->toISOString(),
        ];
    }
}