<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeveloperMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperMessageController extends Controller
{
    /**
     * Display a listing of developer messages
     */
    public function index(): Response
    {
        $messages = DeveloperMessage::latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/DeveloperMessages/Index', [
            'messages' => $messages
        ]);
    }

    /**
     * Show the form for creating a new message
     */
    public function create(): Response
    {
        return Inertia::render('Admin/DeveloperMessages/Create');
    }

    /**
     * Store a newly created message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'message' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status' => 'required|boolean'
        ]);

        $data = [
            'name' => $validated['name'],
            'designation' => $validated['designation'],
            'role' => $validated['role'] ?? null,
            'message' => $validated['message'],
            'status' => $validated['status']
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('developer-messages', $filename, 'public');
            $data['image_path'] = $path;
        }

        $message = DeveloperMessage::create($data);

        return redirect()
            ->route('admin.developer-messages.index')
            ->with('success', 'Team member added successfully.');
    }

    /**
     * Show the form for editing the specified message
     */
    public function edit(DeveloperMessage $developerMessage): Response
    {
        return Inertia::render('Admin/DeveloperMessages/Edit', [
            'message' => $developerMessage
        ]);
    }

    /**
     * Update the specified message
     */
    public function update(Request $request, DeveloperMessage $developerMessage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'message' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status' => 'required|boolean'
        ]);

        $data = [
            'name' => $validated['name'],
            'designation' => $validated['designation'],
            'role' => $validated['role'] ?? null,
            'message' => $validated['message'],
            'status' => $validated['status']
        ];

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($developerMessage->image_path) {
                Storage::disk('public')->delete($developerMessage->image_path);
            }

            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('developer-messages', $filename, 'public');
            $data['image_path'] = $path;
        }

        $developerMessage->update($data);

        return redirect()
            ->route('admin.developer-messages.index')
            ->with('success', 'Team member updated successfully.');
    }

    /**
     * Remove the specified message
     */
    public function destroy(DeveloperMessage $developerMessage)
    {
        // Delete associated image if exists
        if ($developerMessage->image_path) {
            Storage::disk('public')->delete($developerMessage->image_path);
        }

        $developerMessage->delete();

        return redirect()
            ->route('admin.developer-messages.index')
            ->with('success', 'Developer message deleted successfully.');
    }

    /**
     * Get the active message for public display (API endpoint)
     */
    public function getActiveMessage()
    {
        $messages = DeveloperMessage::getActiveMessages();

        if ($messages->isEmpty()) {
            return response()->json([
                'success' => false,
                'messages' => []
            ]);
        }

        return response()->json([
            'success' => true,
            'messages' => $messages->map(function($msg) {
                return [
                    'id' => $msg->id,
                    'name' => $msg->name,
                    'designation' => $msg->designation,
                    'role' => $msg->role,
                    'message' => $msg->message,
                    'image_path' => $msg->image_path
                ];
            })
        ]);
    }
}
