<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY') ?: base64_decode('cmVfWlF2cmRTZ3hfS0s0TVJkSEtzTXJRdnNHY1J2dE5rQ1lw'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID') ?: 'Ov23liaGFMbw7ABOai7u',
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_REDIRECT_URI') ?: (rtrim(env('APP_URL', 'https://www.sysengacademy.site'), '/') . '/api/auth/github/callback'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID') ?: '314182861423-0bodo7ijvgl1eno6h6ff8mnn0t4rfi4t.apps.googleusercontent.com',
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI') ?: (rtrim(env('APP_URL', 'https://www.sysengacademy.site'), '/') . '/api/auth/google/callback'),
    ],
];
