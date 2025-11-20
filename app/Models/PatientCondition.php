<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientCondition extends Model
{
    use HasFactory;

     protected $fillable = [
        'patient_id',
        'condition_id',
        'diagnosed_at',
        'active',
        'notes'
    ];

    protected $casts = [
        'diagnosed_at' => 'date',
        'active'  => 'boolean'
    ];
}
