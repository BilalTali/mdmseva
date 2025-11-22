<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SetCacheHeaders Middleware
 * 
 * Sets appropriate Cache-Control headers for browser caching
 * Improves performance by reducing server requests for static content
 */
class SetCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $cacheControl = 'public, max-age=31536000'): Response
    {
        $response = $next($request);
        
        // Only cache successful responses
        if ($response->isSuccessful()) {
            // Set Cache-Control header
            $response->headers->set('Cache-Control', $cacheControl);
            
            // Set ETag for conditional requests
            if (!$response->headers->has('ETag')) {
                $etag = md5($response->getContent());
                $response->headers->set('ETag', $etag);
            }
            
            // Check if client has cached version
            if ($request->header('If-None-Match') === $response->headers->get('ETag')) {
                $response->setNotModified();
            }
        }
        
        return $response;
    }
}
