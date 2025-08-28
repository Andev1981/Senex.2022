<?php

return [
  'certificado_path' => storage_path('app/' . env('LIBREDTE_CERTIFICADO_PATH')),
  'certificado_clave' => env('LIBREDTE_CERTIFICADO_CLAVE'),
  'emisor_rut' => env('LIBREDTE_EMISOR_RUT'),
  'ambiente' => env('LIBREDTE_AMBIENTE', 'homologacion'),
];
// 'ambiente' puede ser 'produccion' o 'homologacion'