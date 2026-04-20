<?php
return [
  'rut_empresa' => env('DTE_RUT_EMPRESA'),
  'ambiente' => env('DTE_AMBIENTE','certification'),

  'certificado' => [
    'path' => storage_path('app/'.env('DTE_CERTIFICADO_PATH')),
    'password'  => env('DTE_CERTIFICADO_PASSWORD'),
  ],
];
