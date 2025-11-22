<?php
// app/Http/Middleware/EnsureRiceConfiguration.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\MonthlyRiceConfiguration;
use Illuminate\Support\Facades\Auth;

class EnsureRiceConfiguration
{
    /**
     * Handle an incoming request.
     * Redirect to monthly configuration setup if not configured for current month
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for configuration routes themselves
        if ($request->is('monthly-rice-config*') || $request->is('api/monthly-rice-config*')) {
            return $next($request);
        }

        // Check if user has monthly rice configuration for current month
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $config = MonthlyRiceConfiguration::where('user_id', Auth::id())
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->first();

        if (!$config) {
            return redirect()->route('monthly-rice-config.index')
                ->with('warning', 'Please configure your rice inventory for ' . now()->format('F Y') . ' before proceeding.');
        }

        return $next($request);
    }
}