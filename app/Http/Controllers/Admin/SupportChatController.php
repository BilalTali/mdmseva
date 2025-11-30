<?php

namespace App\Http\Controllers\Admin;


// ============================================
// FILE 6 of 10: Admin Support Chat Controller
// Location: app/Http/Controllers/Admin/SupportChatController.php
// 
// COMMAND TO CREATE:
// php artisan make:controller Admin/SupportChatController
// (Then replace content with this file)
// ============================================



use App\Http\Controllers\Controller;
use App\Models\SupportChat;
use App\Models\SupportMessage;
use App\Events\NewSupportMessage;
use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SupportChatController extends Controller
{
    /**
     * Display list of all support chats (API endpoint)
     */
    public function index(): JsonResponse
    {
        $chats = SupportChat::with(['user', 'assignedAdmin', 'latestMessage.user', 'latestMessage.attachments'])
            ->withCount([
                'messages as unread_count' => function($q) {
                    $q->where('is_admin', false)
                      ->where('is_read', false);
                }
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get();

        $stats = [
            'total' => SupportChat::count(),
            'open' => SupportChat::where('status', 'open')->count(),
            'in_progress' => SupportChat::where('status', 'in_progress')->count(),
            'resolved' => SupportChat::where('status', 'resolved')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'chats' => $chats,
                'stats' => $stats,
            ]
        ]);
    }

    /**
     * Get single chat with messages
     */
    public function show(int $chatId): JsonResponse
    {
        $chat = SupportChat::with(['user', 'assignedAdmin', 'messages.user', 'messages.attachments'])
            ->findOrFail($chatId);

        // Mark messages as read for admin
        $chat->markAsRead(Auth::id());

        return response()->json([
            'success' => true,
            'data' => [
                'chat' => $chat,
                'messages' => $chat->messages()->with(['user', 'attachments'])->orderBy('created_at')->get(),
            ]
        ]);
    }

    /**
     * Send message as admin
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'chat_id' => 'required|exists:support_chats,id',
            'message' => 'required|string|max:5000',
        ]);

        $admin = Auth::user();
        $chat = SupportChat::findOrFail($request->chat_id);

        // Create message
        $message = SupportMessage::create([
            'support_chat_id' => $chat->id,
            'user_id' => $admin->id,
            'message' => $request->message,
            'is_admin' => true,
            'is_ai_generated' => false, // Explicitly mark as human admin
            'is_read' => false,
        ]);

        // Update chat - mark human admin takeover to disable AI
        $chat->update([
            'last_message_at' => now(),
            'status' => 'in_progress',
            'assigned_to' => $admin->id,
            'last_human_admin_at' => now(), // This disables AI for this chat
        ]);

        // Broadcast message
        broadcast(new NewSupportMessage($message))->toOthers();

        return response()->json([
            'success' => true,
            'data' => $message->load(['user', 'attachments'])
        ]);
    }

    /**
     * Assign chat to admin
     */
    public function assign(Request $request, int $chatId): JsonResponse
    {
        $request->validate([
            'admin_id' => 'required|exists:users,id',
        ]);

        $chat = SupportChat::findOrFail($chatId);
        $chat->update([
            'assigned_to' => $request->admin_id,
            'status' => 'in_progress',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat assigned successfully'
        ]);
    }

    /**
     * Update chat status
     */
    public function updateStatus(Request $request, int $chatId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $chat = SupportChat::findOrFail($chatId);
        $chat->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully'
        ]);
    }

    /**
     * Send typing indicator
     */
    public function typing(Request $request): JsonResponse
    {
        $request->validate([
            'chat_id' => 'required|exists:support_chats,id',
            'is_typing' => 'required|boolean',
        ]);

        $admin = Auth::user();
        
        broadcast(new UserTyping(
            $request->chat_id,
            $admin->id,
            $admin->name,
            $request->is_typing
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Get unread chats count for admin
     */
    public function unreadCount(): JsonResponse
    {
        $count = SupportChat::whereHas('messages', function($query) {
            $query->where('is_admin', false)
                  ->where('is_read', false);
        })->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Mark all messages in chat as read
     */
    public function markAsRead(int $chatId): JsonResponse
    {
        $chat = SupportChat::findOrFail($chatId);
        $chat->markAsRead(Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
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
            'file' => 'required|file|max:10240',
        ]);

        $admin = Auth::user();
        $chat = SupportChat::findOrFail($request->chat_id);

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        
        $fileType = 'document';
        if (str_starts_with($mimeType, 'image/')) {
            $fileType = 'image';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            $fileType = 'audio';
        } elseif (str_starts_with($mimeType, 'video/')) {
            $fileType = 'video';
        }

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
                'message' => 'File type not allowed.'
            ], 422);
        }

        $path = $file->store('chat-attachments', 'public');

        $message = SupportMessage::create([
            'support_chat_id' => $chat->id,
            'user_id' => $admin->id,
            'message' => $file->getClientOriginalName(),
            'is_admin' => true,
            'is_read' => false,
        ]);

        \App\Models\MessageAttachment::create([
            'support_message_id' => $message->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $file->getSize(),
            'mime_type' => $mimeType,
        ]);

        $chat->update(['last_message_at' => now()]);
        $message->load(['user', 'attachments']);
        broadcast(new NewSupportMessage($message))->toOthers();

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Disable AI for a chat (manual takeover)
     */
    public function disableAI(int $chatId): JsonResponse
    {
        $chat = SupportChat::findOrFail($chatId);
        $chat->disableAI();

        return response()->json([
            'success' => true,
            'message' => 'AI disabled for this chat. Admin has taken control.'
        ]);
    }
}