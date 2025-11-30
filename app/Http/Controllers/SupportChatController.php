<?php

namespace App\Http\Controllers;

// ============================================
// FILE 5 of 10: Support Chat Controller (User Side)
// Location: app/Http/Controllers/SupportChatController.php
// 
// COMMAND TO CREATE:
// php artisan make:controller SupportChatController
// (Then replace content with this file)
// ============================================

use App\Models\SupportChat;
use App\Models\SupportMessage;
use App\Models\MessageAttachment;
use App\Events\NewSupportMessage;
use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SupportChatController extends Controller
{
    /**
     * Get or create support chat for current user
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        
        // Get or create active chat (order by last_message_at for reliability)
        $chat = SupportChat::forUser($user->id)
            ->active()
            ->with(['messages.user', 'messages.attachments', 'assignedAdmin'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->first();

        if (!$chat) {
            $chat = SupportChat::create([
                'user_id' => $user->id,
                'subject' => 'Support Request',
                'status' => 'open',
                'last_message_at' => now(),
            ]);
        }

        // Mark messages as read
        $chat->markAsRead($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'chat' => $chat,
                'messages' => $chat->messages()->with(['user', 'attachments'])->orderBy('created_at')->get(),
                'unread_count' => 0,
            ]
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        if (!$request->isJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported Media Type. Use application/json.'
            ], 415);
        }
        $request->validate([
            'chat_id' => 'required|exists:support_chats,id',
            'message' => 'required|string|max:5000',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $chat = SupportChat::findOrFail($request->chat_id);

        // Verify user owns this chat
        if ($chat->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Create message
        $message = SupportMessage::create([
            'support_chat_id' => $chat->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'is_admin' => false,
            'is_read' => false,
        ]);

        // Update chat last message time
        $chat->update(['last_message_at' => now()]);

        \Illuminate\Support\Facades\Log::info("Broadcasting message {$message->id} to chat {$chat->id}");
        // Broadcast message
        broadcast(new NewSupportMessage($message))->toOthers();

        // Trigger AI response if enabled for this chat
        if ($chat->shouldAIRespond()) {
            try {
                $aiService = app(\App\Services\AIAgentService::class);
                $aiMessage = $aiService->generateResponse($chat, $message);
                
                if ($aiMessage) {
                    // Broadcast AI response
                    broadcast(new NewSupportMessage($aiMessage))->toOthers();
                    \Illuminate\Support\Facades\Log::info("AI responded to chat {$chat->id}");
                }
            } catch (\Exception $e) {
                // Log but don't fail the user's message
                \Illuminate\Support\Facades\Log::error("AI response failed: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'data' => $message->load('user')
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, int $chatId): JsonResponse
    {
        if (!$request->isJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported Media Type. Use application/json.'
            ], 415);
        }
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $chat = SupportChat::findOrFail($chatId);

        // Verify user owns this chat
        if ($chat->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $chat->markAsRead($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }

    /**
     * Send typing indicator
     */
    public function typing(Request $request): JsonResponse
    {
        if (!$request->isJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported Media Type. Use application/json.'
            ], 415);
        }
        $request->validate([
            'chat_id' => 'required|exists:support_chats,id',
            'is_typing' => 'required|boolean',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $chat = SupportChat::findOrFail($request->chat_id);

        // Verify user owns this chat
        if ($chat->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Broadcast typing event
        broadcast(new UserTyping(
            $chat->id,
            $user->id,
            $user->name,
            $request->is_typing
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Close chat
     */
    public function close(int $chatId): JsonResponse
    {
        // No body expected; skip JSON check
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $chat = SupportChat::findOrFail($chatId);

        // Verify user owns this chat
        if ($chat->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $chat->close();

        return response()->json([
            'success' => true,
            'message' => 'Chat closed successfully'
        ]);
    }

    /**
     * Get unread messages count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        
        $count = SupportMessage::whereHas('chat', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('user_id', '!=', $user->id)
        ->where('is_read', false)
        ->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Upload file attachment
     */
    public function uploadAttachment(Request $request): JsonResponse
    {
        if (!$request->hasFile('file')) {
            return response()->json([
                'success' => false,
                'message' => 'No file provided'
            ], 400);
        }

        $request->validate([
            'chat_id' => 'required|exists:support_chats,id',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $chat = SupportChat::findOrFail($request->chat_id);

        // Verify user owns this chat
        if ($chat->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        
        // Determine file type
        $fileType = 'document';
        if (str_starts_with($mimeType, 'image/')) {
            $fileType = 'image';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            $fileType = 'audio';
        } elseif (str_starts_with($mimeType, 'video/')) {
            $fileType = 'video';
        }

        // Validate file types
        $allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            // Audio
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
            // Video
            'video/mp4', 'video/webm', 'video/ogg',
        ];

        if (!in_array($mimeType, $allowedMimes)) {
            return response()->json([
                'success' => false,
                'message' => 'File type not allowed. Allowed: images, PDF, Word, Excel, text files.'
            ], 422);
        }

        // Store file
        $path = $file->store('chat-attachments', 'public');

        // Create message with attachment
        $message = SupportMessage::create([
            'support_chat_id' => $chat->id,
            'user_id' => $user->id,
            'message' => $file->getClientOriginalName(),
            'is_admin' => false,
            'is_read' => false,
        ]);

        // Create attachment record
        $attachment = MessageAttachment::create([
            'support_message_id' => $message->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $file->getSize(),
            'mime_type' => $mimeType,
        ]);

        // Update chat last message time
        $chat->update(['last_message_at' => now()]);

        // Load relationships
        $message->load(['user', 'attachments']);

        // Broadcast message
        broadcast(new NewSupportMessage($message))->toOthers();

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }
}