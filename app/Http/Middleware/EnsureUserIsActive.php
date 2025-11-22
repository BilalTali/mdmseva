<?php
// File Location: app/Http/Middleware/EnsureUserIsActive.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     * 
     * Ensures that school users have active accounts.
     * Admin users are exempt from this check.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Skip check if not authenticated
        if (!$user) {
            return $next($request);
        }

        // Skip check if user is admin (admins are always active)
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Check if school user is inactive
        if (!$user->is_active) {
            // Logout the user
            Auth::logout();

            // Invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect to login with error message
            return redirect()->route('login')
                ->with('error', 'Your account has been deactivated. Please contact the administrator for assistance.');
        }

        return $next($request);
    }
}