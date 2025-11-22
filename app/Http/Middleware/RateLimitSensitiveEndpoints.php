<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * RateLimitSensitiveEndpoints Middleware
 * 
 * Applies rate limiting to sensitive endpoints to prevent abuse
 * - Login: 5 attempts per minute
 * - Registration: 3 attempts per minute
 * - Password reset: 3 attempts per minute
 * - Feedback: 10 attempts per minute
 */
class RateLimitSensitiveEndpoints
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1): Response
    {
        // Parse limit (format: "max_attempts,decay_minutes")
        // Legacy support if first arg contains comma
        if (is_string($maxAttempts) && str_contains($maxAttempts, ',')) {
            [$maxAttempts, $decayMinutes] = explode(',', $maxAttempts);
        }
        
        // Create unique key based on IP and route
        $key = $this->resolveRequestSignature($request);
        
        // Check rate limit
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'message' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.',
                'retry_after' => $seconds,
            ], 429);
        }
        
        // Increment attempt counter
        RateLimiter::hit($key, $decayMinutes * 60);
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
        ]);
        
        return $response;
    }
    
    /**
     * Resolve the request signature for rate limiting
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function resolveRequestSignature(Request $request): string
    {
        // Use IP address + route name for uniqueness
        return sha1(
            $request->ip() . '|' . $request->route()->getName()
        );
    }
}
