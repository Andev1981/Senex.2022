<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{


  protected $fillable = [
    'business_name',
    'rut',
    'address',
    'city',
    'region',
    'economic_activity_code',
    'tax_rate',
    'sii_resolution_number',
    'sii_resolution_date',
    'invoice_api_credentials',
    'webpay_credentials',
  ];

  protected $casts = [
    'tax_rate' => 'integer',
    'sii_resolution_date' => 'date',
    'invoice_api_credentials' => 'array', // ej. ['provider'=>'LibreDTE','api_key'=>'...']
    'webpay_credentials'     => 'array',  // ej. ['commerce_code'=>'...','api_key'=>'...','environment'=>'TEST']
  ];
}
