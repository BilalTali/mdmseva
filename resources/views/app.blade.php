<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

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

        <!-- JSON-LD for AI and SEO -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@type": "Organization",
            "name": "MDM SEVA Portal",
            "description": "Comprehensive Mid Day Meal Management System for efficient tracking and reporting of school meal programs."
        }
        </script>



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