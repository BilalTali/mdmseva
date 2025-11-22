<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * Display feedback management page
     */
    public function index(Request $request): Response
    {
        $query = Feedback::with('respondedBy:id,name')
            ->latest();

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('school_name', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $feedback = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Feedback::count(),
            'new' => Feedback::where('status', 'new')->count(),
            'in_progress' => Feedback::where('status', 'in_progress')->count(),
            'resolved' => Feedback::where('status', 'resolved')->count(),
            'average_rating' => round(Feedback::avg('rating'), 1),
            'urgent' => Feedback::where('priority', 'urgent')->count(),
        ];

        return Inertia::render('Admin/Feedback/Index', [
            'feedback' => $feedback,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
                'type' => $request->type,
                'priority' => $request->priority,
                'rating' => $request->rating,
                'search' => $request->search,
            ]
        ]);
    }

    /**
     * Show individual feedback details
     */
    public function show(Feedback $feedback): Response
    {
        $feedback->load('respondedBy:id,name,email');

        return Inertia::render('Admin/Feedback/Show', [
            'feedback' => $feedback
        ]);
    }

    /**
     * Update feedback status
     */
    public function updateStatus(Request $request, Feedback $feedback)
    {
        $request->validate([
            'status' => 'required|in:new,in_progress,resolved,closed',
            'admin_response' => 'nullable|string|max:2000'
        ]);

        $feedback->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response,
            'responded_by' => auth()->id(),
            'responded_at' => now()
        ]);

        return redirect()->back()->with('success', 'Feedback updated successfully.');
    }

    /**
     * Respond to feedback
     */
    public function respond(Request $request, Feedback $feedback)
    {
        $request->validate([
            'response' => 'required|string|max:2000',
            'status' => 'nullable|in:in_progress,resolved,closed'
        ]);

        $feedback->update([
            'admin_response' => $request->response,
            'status' => $request->status ?? 'resolved',
            'responded_by' => auth()->id(),
            'responded_at' => now()
        ]);

        // Here you could send an email notification to the user
        // Mail::to($feedback->email)->send(new FeedbackResponse($feedback));

        return redirect()->back()->with('success', 'Response sent successfully.');
    }

    /**
     * Bulk update feedback items
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'feedback_ids' => 'required|array',
            'feedback_ids.*' => 'exists:feedback,id',
            'action' => 'required|in:mark_resolved,mark_in_progress,delete',
        ]);

        $feedbackItems = Feedback::whereIn('id', $request->feedback_ids);

        switch ($request->action) {
            case 'mark_resolved':
                $feedbackItems->update([
                    'status' => 'resolved',
                    'responded_by' => auth()->id(),
                    'responded_at' => now()
                ]);
                $message = 'Selected feedback marked as resolved.';
                break;

            case 'mark_in_progress':
                $feedbackItems->update([
                    'status' => 'in_progress',
                    'responded_by' => auth()->id(),
                    'responded_at' => now()
                ]);
                $message = 'Selected feedback marked as in progress.';
                break;

            case 'delete':
                $feedbackItems->delete();
                $message = 'Selected feedback deleted.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Get feedback analytics data
     */
    public function analytics()
    {
        $analytics = [
            'ratings_distribution' => Feedback::selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating')
                ->get(),
            
            'monthly_trends' => Feedback::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get(),
            
            'type_distribution' => Feedback::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            
            'status_distribution' => Feedback::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            
            'average_response_time' => $this->calculateAverageResponseTime(),
            
            'top_issues' => $this->getTopIssues()
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }

    private function calculateAverageResponseTime()
    {
        $responded = Feedback::whereNotNull('responded_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as avg_hours')
            ->first();

        return $responded ? round($responded->avg_hours, 1) : 0;
    }

    private function getTopIssues()
    {
        // Simple keyword extraction from messages
        $messages = Feedback::where('created_at', '>=', now()->subDays(30))
            ->pluck('message');

        $keywords = [];
        foreach ($messages as $message) {
            $words = str_word_count(strtolower($message), 1);
            foreach ($words as $word) {
                if (strlen($word) > 4) { // Only consider words longer than 4 characters
                    $keywords[$word] = ($keywords[$word] ?? 0) + 1;
                }
            }
        }

        arsort($keywords);
        return array_slice($keywords, 0, 10, true);
    }
}
