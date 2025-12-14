<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Appointment extends Model
{
  use Multitenantable;
   
  protected $fillable = [
    'company_id',
    'branch_id',
    'room_id',
    'patient_id',
    'doctor_id',
    'room_id',
    'start_at',
    'end_at',
    'status',
    'check_in_at',
    'started_at',
    'completed_at',
    'notes',
    'meta',
  ];

  protected $casts = [
    'start_at' => 'datetime',
    'end_at' => 'datetime',
    'check_in_at' => 'datetime',
    'started_at' => 'datetime',
    'completed_at' => 'datetime',
    'meta' => 'array',
  ];

  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function room()
  {
    return $this->belongsTo(Room::class);
  }

  public function treatmentSession()
  {
    return $this->hasOne(TreatmentSession::class);
  }

  // ==== Scopes ====

  public function scopeUpcoming($q)
  {
    return $q->where('start_at', '>=', Carbon::now())->orderBy('start_at');
  }

  public function scopeToday($q)
  {
    return $q->whereDate('start_at', Carbon::today());
  }
}
