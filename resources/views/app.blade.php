<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- SEO Meta Tags -->
        <title inertia>{{ config('app.name', 'MDM SEVA Portal') }}</title>
        <meta name="description" content="MDM SEVA Portal - Comprehensive Mid Day Meal Management System for efficient tracking and reporting of school meal programs.">
        <meta name="keywords" content="MDM, Mid Day Meal, School Meal Management, SEVA Portal, Education">
        <meta name="author" content="Department of Education">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'MDM SEVA Portal') }}">
        <meta property="og:description" content="MDM SEVA Portal - Mid Day Meal Management System">
        <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">
        <meta property="og:site_name" content="MDM SEVA Portal">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ config('app.name', 'MDM SEVA Portal') }}">
        <meta name="twitter:description" content="MDM SEVA Portal - Mid Day Meal Management System">
        <meta name="twitter:image" content="{{ asset('images/og-image.jpg') }}">

        <!-- Canonical URL -->
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

        <!-- Fonts - Temporarily disabled to test CSS transition parsing error -->
        <!-- <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" /> -->
        
        <!-- CSS Fix for external font transition parsing errors -->
        <style>
            /* Fix for Google Fonts CSS transition parsing errors */
            @supports (transition: all) {
                .transition {
                    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-primary antialiased">
        @inertia
    </body>
</html>
