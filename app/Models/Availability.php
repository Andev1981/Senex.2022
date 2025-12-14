<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
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
