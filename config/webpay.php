<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Webpay Plus Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para integración con Transbank Webpay Plus.
    | SDK recomendado: transbank/transbank-sdk ^5.0
    |
    */

    // Ambiente: 'integration' o 'production'
    'environment' => env('WEBPAY_ENVIRONMENT', 'integration'),

    // Credenciales de Producción
    'commerce_code' => env('WEBPAY_COMMERCE_CODE', '597055555532'),
    'api_key' => env('WEBPAY_API_KEY', '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'),

    // URL de retorno después del pago
    'return_url' => env('WEBPAY_RETURN_URL', env('APP_URL') . '/payments/webpay/return'),

    // Configuración de timeouts (en segundos)
    'timeout' => [
        'connection' => env('WEBPAY_TIMEOUT_CONNECTION', 30),
        'request' => env('WEBPAY_TIMEOUT_REQUEST', 60),
    ],

    // Prefijo para buy_order (ayuda a identificar origen)
    'buy_order_prefix' => env('WEBPAY_BUY_ORDER_PREFIX', 'WP'),

    // Configuración de logging
    'logging' => [
        'enabled' => env('WEBPAY_LOGGING_ENABLED', true),
        'channel' => env('WEBPAY_LOGGING_CHANNEL', 'daily'),
    ],

    // Configuración de reintentos en caso de error
    'retry' => [
        'enabled' => env('WEBPAY_RETRY_ENABLED', true),
        'max_attempts' => env('WEBPAY_RETRY_MAX_ATTEMPTS', 3),
        'delay_ms' => env('WEBPAY_RETRY_DELAY_MS', 1000),
    ],

    // Montos mínimos y máximos (en CLP)
    'limits' => [
        'min_amount' => env('WEBPAY_MIN_AMOUNT', 50), // $50 CLP mínimo
        'max_amount' => env('WEBPAY_MAX_AMOUNT', 10000000), // $10M CLP máximo
    ],

    // Métodos de pago habilitados
    'payment_methods' => [
        'credit_card' => true,
        'debit_card' => true,
        'prepaid_card' => true,
    ],

    // Configuración de DTE automático
    'auto_issue_dte' => [
        'enabled' => env('WEBPAY_AUTO_ISSUE_DTE', false),
        'default_type' => env('WEBPAY_DTE_DEFAULT_TYPE', 39), // 39 = Boleta Electrónica
    ],
];
