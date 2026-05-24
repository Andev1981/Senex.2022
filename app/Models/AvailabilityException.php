<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailabilityException extends Model
{
    use HasFactory, Multitenantable;

    protected $table = 'availability_exceptions';

    protected $fillable = [
        'company_id',
        'doctor_id',
        'date',
        'end_date',
        'action',
        'override_start_time',
        'override_end_time',
        'room_id',
        'modality',
        'reason',
        'meta',
    ];

    protected $casts = [
        'date' => 'date',
        'end_date' => 'date',
        'meta' => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
