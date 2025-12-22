<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorPatientAssignment extends Model
{
    use SoftDeletes, Multitenantable;

    protected $table = 'doctor_patient_assignments';

    protected $fillable = [
        'company_id',
        'branch_id',
        'doctor_id',
        'patient_id',
        'role',
        'started_at',
        'ended_at',
        'notes',
        'meta',
    ];

    protected $casts = [
        'started_at' => 'date',
        'ended_at'   => 'date',
        'meta'       => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /* Helpers */
    public function scopeActive($q)
    {
        return $q->whereNull('ended_at');
    }
}
