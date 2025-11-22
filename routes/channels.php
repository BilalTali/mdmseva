<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\SupportChat;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('support-chat.{chatId}', function ($user, $chatId) {
    \Illuminate\Support\Facades\Log::info("Channel Auth Request: User {$user->id} for Chat {$chatId}");
    $chat = SupportChat::find($chatId);
    
    if (!$chat) {
        \Illuminate\Support\Facades\Log::warning("Channel Auth Failed: Chat {$chatId} not found");
        return false;
    }

    // Admin can access any chat
    if ($user->hasRole('admin')) {
        \Illuminate\Support\Facades\Log::info("Channel Auth Success: User {$user->id} is Admin");
        return true;
    }

    // User can only access their own chat
    $isOwner = (int) $chat->user_id === (int) $user->id;
    if ($isOwner) {
        \Illuminate\Support\Facades\Log::info("Channel Auth Success: User {$user->id} is Owner");
    } else {
        \Illuminate\Support\Facades\Log::warning("Channel Auth Failed: User {$user->id} is not Owner of Chat {$chatId}");
    }
    return $isOwner;
});
