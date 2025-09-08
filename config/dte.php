<?php
return [
  'provider' => env('DTE_PROVIDER', 'libredte'),

  'libredte' => [
    'base_url' => env('LIBREDTE_BASE_URL', 'https://libredte.cl'),
    'api_key'  => env('LIBREDTE_API_KEY'),
    'issuer_rut' => env('LIBREDTE_ISSUER_RUT'), // 12345678-9
  ],
];
