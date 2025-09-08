<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{


  protected $fillable = [
    'doctor_id',
    'timezone',
    'rrule',
    'start_time',
    'end_time',
    'valid_from',
    'valid_until',
    'is_active',
    'meta',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'valid_from' => 'date',
    'valid_until' => 'date',
    'meta' => 'array',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }
}
