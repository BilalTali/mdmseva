<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking attacks
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        
        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // Enable XSS protection (legacy browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // Referrer policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions policy - restrict access to sensitive features
        $response->headers->set('Permissions-Policy', 
            'camera=(), microphone=(), geolocation=(self), payment=()'
        );
        
        // Prevent Adobe Flash/PDF from loading content
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        
        // Content Security Policy
        // Development: Report-Only mode (allows Vite HMR without blocking)
        // Production: Enforced mode (strict security)
        $isDev = config('app.env') === 'local' || config('app.debug');
        
        // FORCE PERMISSIVE CSP FOR DEBUGGING
        // This ensures Vite works regardless of APP_ENV settings
        $csp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
        $response->headers->set('Content-Security-Policy', $csp);
        
        /* 
        Original Logic (commented out for debugging):
        if ($isDev) {
            $csp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
            $response->headers->set('Content-Security-Policy', $csp);
        } else {
            // Production: Strict security
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-inline'; " .
                   "style-src 'self' 'unsafe-inline'; " .
                   "img-src 'self' data: https:; " .
                   "font-src 'self' data:; " .
                   "connect-src 'self' ws: wss:; " .
                   "frame-ancestors 'self';";
            $response->headers->set('Content-Security-Policy', $csp);
        }
        */
        
        return $response;
    }
}