<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title inertia><?php echo e(config('app.name', 'MDM SEVA Portal')); ?></title>
        <meta name="description" content="MDM SEVA Portal - Comprehensive Mid Day Meal Management System for efficient tracking and reporting of school meal programs.">
        <meta name="keywords" content="MDM, Mid Day Meal, School Meal Management, SEVA Portal, Education">
        <meta name="author" content="Department of Education">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="<?php echo e(url()->current()); ?>">
        <meta property="og:title" content="<?php echo e(config('app.name', 'MDM SEVA Portal')); ?>">
        <meta property="og:description" content="MDM SEVA Portal - Mid Day Meal Management System">
        <meta property="og:image" content="<?php echo e(asset('images/og-image.jpg')); ?>">
        <meta property="og:site_name" content="MDM SEVA Portal">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="<?php echo e(url()->current()); ?>">
        <meta name="twitter:title" content="<?php echo e(config('app.name', 'MDM SEVA Portal')); ?>">
        <meta name="twitter:description" content="MDM SEVA Portal - Mid Day Meal Management System">
        <meta name="twitter:image" content="<?php echo e(asset('images/og-image.jpg')); ?>">

        <!-- Canonical URL -->
        <link rel="canonical" href="<?php echo e(url()->current()); ?>">

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="<?php echo e(asset('favicon.ico')); ?>">

        <!-- JSON-LD for AI and SEO -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MDM SEVA Portal",
            "description": "Comprehensive Mid Day Meal Management System for efficient tracking and reporting of school meal programs."
        }
        </script>



        <!-- Scripts -->
        <?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"]); ?>
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
    </head>
    <body class="font-primary antialiased">
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
    </body>
</html><?php /**PATH C:\Users\TASLEEMAH\Documents\mdmseva\resources\views/app.blade.php ENDPATH**/ ?>