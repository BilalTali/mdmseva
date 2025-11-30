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
        
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' http://localhost:5173 http://127.0.0.1:5173; " .
               "style-src 'self' 'unsafe-inline' http://localhost:5173 http://127.0.0.1:5173; " .
               "img-src 'self' data: https: http://localhost:5173 http://127.0.0.1:5173; " .
               "font-src 'self' data: http://localhost:5173 http://127.0.0.1:5173; " .
               "connect-src 'self' ws: wss: http://localhost:5173 http://127.0.0.1:5173; " .
               "frame-ancestors 'self';";
        
        if ($isDev) {
            // Development: Report-Only mode - logs violations but doesn't block
            // This allows Vite dev server to work while still monitoring CSP
            $response->headers->set('Content-Security-Policy-Report-Only', $csp);
        } else {
            // Production: Enforced mode - blocks violations
            $response->headers->set('Content-Security-Policy', $csp);
        }
        
        return $response;
    }
}