<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientContact extends Model
{
    use HasFactory;


    protected $fillable = [
        'patient_id',
        'name',
        'relationship',
        'phone',
        'email',
        'type',
        'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];


}
