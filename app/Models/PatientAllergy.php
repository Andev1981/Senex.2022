<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientAllergy extends Model
{
    use HasFactory;

      protected $fillable = [
        'patient_id',
        'allergy_id',
        'severity',
        'notes',
        'noted_at',
    ];

    protected $casts = [
    
        'noted_at' => 'date',
    ];

}
