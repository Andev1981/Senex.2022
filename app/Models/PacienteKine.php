<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PacienteKine extends Model
{
    use HasFactory;
    protected $fillable = [
        'patient_id',
        'kine_id',
    ];


    public function kine()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function paciente()
    {
        return $this->belongsTo(Patient::class);
    }
}
