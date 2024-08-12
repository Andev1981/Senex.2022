<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PacienteKine extends Model
{
    use HasFactory;
    protected $fillable = [
        'doctor_id',
        'patient_id',
    ];


    public function kine()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'id');
    }

    public function paciente()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }
}
