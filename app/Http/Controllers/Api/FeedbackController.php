<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class FeedbackController extends Controller
{
    /**
     * Submit feedback from welcome page
     */
    public function store(StoreFeedbackRequest $request)
    {
        if (!$request->isJson()) {
            return response()->json([
                'success' => false,
                'error' => 'Unsupported Media Type. Use application/json.'
            ], 415);
        }
        // Rate limiting - 3 submissions per hour per IP
        $key = 'feedback_submission:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'error' => 'Too many feedback submissions. Please try again in ' . ceil($seconds / 60) . ' minutes.'
            ], 429);
        }

        $data = $request->validated();

        try {
            // Determine priority based on rating and type
            $priority = $this->determinePriority($data['rating'], $data['type'] ?? null);

            $feedback = Feedback::create([
                'name' => $data['name'],
                'email' => strtolower(trim($data['email'])),
                'phone' => $data['phone'] ?? null,
                'school_name' => $data['school_name'] ?? null,
                'udise_code' => $data['udise_code'],
                'state' => $data['state'],
                'district' => $data['district'],
                'zone' => $data['zone'],
                'message' => $data['message'],
                'rating' => $data['rating'],
                'type' => $data['type'] ?? 'general',
                'priority' => $priority,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'source' => 'welcome_page',
                    'submitted_at' => now()->toISOString(),
                    'browser' => $this->getBrowserInfo($request->userAgent()),
                    'location' => array_filter([
                        'state' => $data['state'],
                        'district' => $data['district'],
                        'zone' => $data['zone'],
                    ])
                ]
            ]);

            // Hit the rate limiter
            RateLimiter::hit($key, 3600); // 1 hour

            // Send notification to admins (you can implement this later)
            // event(new FeedbackSubmitted($feedback));

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback! We will get back to you soon.',
                'feedback_id' => $feedback->id
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to submit feedback. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get feedback statistics for admin dashboard
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => Feedback::count(),
                'new' => Feedback::where('status', 'new')->count(),
                'in_progress' => Feedback::where('status', 'in_progress')->count(),
                'resolved' => Feedback::where('status', 'resolved')->count(),
                'average_rating' => round(Feedback::avg('rating'), 1),
                'by_type' => [
                    'general' => Feedback::where('type', 'general')->count(),
                    'bug_report' => Feedback::where('type', 'bug_report')->count(),
                    'feature_request' => Feedback::where('type', 'feature_request')->count(),
                    'support' => Feedback::where('type', 'support')->count(),
                ],
                'recent_count' => Feedback::where('created_at', '>=', now()->subDays(7))->count(),
                'response_rate' => $this->calculateResponseRate()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch feedback statistics'
            ], 500);
        }
    }

    private function determinePriority($rating, $type)
    {
        // Low ratings get higher priority
        if ($rating <= 2) {
            return 'high';
        }
        
        if ($type === 'bug_report') {
            return 'high';
        }
        
        if ($type === 'support') {
            return 'medium';
        }
        
        return $rating <= 3 ? 'medium' : 'low';
    }

    private function getBrowserInfo($userAgent)
    {
        // Simple browser detection
        if (strpos($userAgent, 'Chrome') !== false) {
            return 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            return 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            return 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            return 'Edge';
        }
        
        return 'Unknown';
    }

    private function calculateResponseRate()
    {
        $total = Feedback::count();
        if ($total === 0) return 0;
        
        $responded = Feedback::whereNotNull('admin_response')->count();
        return round(($responded / $total) * 100, 1);
    }

    /**
     * Public testimonials feed for welcome page
     */
    public function publicTestimonials()
    {
        $testimonials = Feedback::with('respondedBy:id,name')
            ->where('rating', '>=', 4)
            ->orderByRaw('CASE WHEN responded_at IS NULL THEN 1 ELSE 0 END')
            ->orderByDesc('responded_at')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(function (Feedback $feedback) {
                $name = $feedback->name ?? 'MDM User';
                $first = Str::substr($name, 0, 1);
                $second = Str::substr($name, 1, 1) ?: $first;
                $avatar = Str::upper($first . $second);

                return [
                    'id' => $feedback->id,
                    'name' => $name,
                    'role' => $feedback->school_name
                        ?: ($feedback->metadata['source'] ?? 'School Administrator'),
                    'udise_code' => $feedback->udise_code,
                    'phone' => $feedback->phone,
                    'state' => $feedback->state,
                    'district' => $feedback->district,
                    'zone' => $feedback->zone,
                    'message' => $feedback->message,
                    'rating' => (int) ($feedback->rating ?? 0),
                    'avatar' => $avatar,
                    'type' => $feedback->type,
                    'status' => $feedback->status,
                    'admin_response' => $feedback->admin_response,
                    'responded_by' => $feedback->respondedBy
                        ? ['name' => $feedback->respondedBy->name]
                        : null,
                    'responded_at' => optional($feedback->responded_at)->toIso8601String(),
                    'submitted_at' => optional($feedback->created_at)->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }
}
