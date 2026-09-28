<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*', 'api/*', 'login', 'logout', 'dashboard', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [
        '#.*\.accesspoint\.ma#',
        '#.*\.adoul\.test#',
        '#.*\.adol\.test#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'X-Inertia',
        'X-Inertia-Location',
        'X-Inertia-Version',
        'X-CSRF-TOKEN',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,

];
