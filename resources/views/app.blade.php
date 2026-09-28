<!DOCTYPE html>
<html lang="ar" dir="rtl" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'Adoul') }} - منصة إدارة مكاتب العدول بالمغرب</title>

    <!-- Google Fonts for Moroccan & Legal Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- PWA & Mobile Meta Tags -->
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#047857">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Adoul">

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="h-full font-sans antialiased bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 selection:bg-emerald-600 selection:text-white">
    @inertia

    <!-- Production-grade PWA Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    // Registration successful
                }).catch(function(err) {
                    // Registration failed (e.g. non-HTTPS local domain in some browsers)
                });
            });
        }
    </script>
</body>
</html>