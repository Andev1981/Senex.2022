<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */
    /*
    |--------------------------------------------------------------------------
    | Twilio (SMS y WhatsApp)
    |--------------------------------------------------------------------------
    */
    'twilio' => [
        // [ESTE BLOQUE ES LA CLAVE]
        'sid' => env('TWILIO_SID', env('TWILIO_SID')),
        'token' => env('TWILIO_TOKEN', env('TWILIO_TOKEN')),

        // [IMPORTANTE] Usar los nombres de tus variables de entorno para los números
        'sms_from' => env('TWILIO_SMS_FROM'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Webpay (Transbank)
    |--------------------------------------------------------------------------
    */
    'webpay' => [
        'environment' => env('WEBPAY_ENVIRONMENT', 'integration'), // integration o production
        'commerce_code' => env('WEBPAY_COMMERCE_CODE'),
        'api_key' => env('WEBPAY_API_KEY'),
    ],

    /*  'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ], */

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

];
