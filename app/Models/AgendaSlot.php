<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgendaSlot extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'branch_id',
        'room_id',
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'is_available'
    ];

    protected $casts = [
        'is_available' => 'boolean'
    ];
}
