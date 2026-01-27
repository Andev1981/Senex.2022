<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyDirectory extends Model
{
    protected $table = 'companies_directory';

    protected $fillable = [
        'rut',
        'business_name',
        'activity',
        'last_api_sync_at',
    ];

    protected $casts = [
        'last_api_sync_at' => 'datetime',
    ];
}
