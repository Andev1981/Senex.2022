<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class PatientContact extends Model
{
    use HasFactory, Notifiable;


    protected $fillable = [
        'patient_id',
        'name',
        'rut',
        'relationship',
        'phone',
        'email',
        'type',
        'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];
}
