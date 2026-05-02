<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
    'branch_id',
    'room_id',
    'doctor_id',
    'timezone',
    'rrule',
    'modality',
    'start_time',
    'end_time',
    'lunch_start_time',
    'lunch_end_time',
    'valid_from',
    'valid_until',
    'is_active',
    'meta',
  ];

  protected $casts = [
    'modality' => \App\Enums\ServiceModalityEnum::class,
    'is_active' => 'boolean',
    'valid_from' => 'date',
    'valid_until' => 'date',
    'meta' => 'array',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function branch()
  {
    return $this->belongsTo(Branch::class);
  }

  public function room()
  {
    return $this->belongsTo(Room::class);
  }
}
