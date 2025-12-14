<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'insurance_id',
        'coverage_percentage',
        'max_sessions',
        'type',
        'total_sessions',
        'price',
        'valid_months',
        'start_date',
        'end_date',
        'description',
        'is_active',
    ];

    protected $casts = [
        'max_sessions' => 'integer',
        'total_sessions' => 'integer',
        'price' => 'integer',
        'valid_months' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];


    public function insurance()
    {
        return $this->belongsTo(Insurance::class);
    }

}