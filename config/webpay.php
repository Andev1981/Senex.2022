<?php
return [
  'environment' => env('WEBPAY_ENV', 'integration'),
  'commerce_code' => env('WEBPAY_COMMERCE_CODE'),
  'api_key' => env('WEBPAY_API_KEY'),
  'return_url' => env('WEBPAY_RETURN_URL'),
  'final_url' => env('WEBPAY_FINAL_URL'), // URL final donde vuelve el browser (ok/abort/timeout)
];
