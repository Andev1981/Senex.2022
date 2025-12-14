<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
    'patient_id',
    'recorded_by_user_id',
    'recorded_at',
    'height_cm',
    'weight_kg',
    'bmi',
    'bp_systolic',
    'bp_diastolic',
    'blood_type',
    'heart_rate',
    'resp_rate',
    'temperature_c',
    'spo2',
    'meta',
  ];

  protected $casts = [
    'recorded_at' => 'datetime',
    'height_cm'   => 'decimal:1',
    'weight_kg'   => 'decimal:1',
    'bmi'         => 'decimal:2',
    'meta'        => 'array',
  ];

  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function recordedBy()
  {
    return $this->belongsTo(User::class, 'recorded_by_user_id');
  }

  // auto BMI si no viene
  protected static function booted(): void
  {
    static::saving(function (self $v) {
      if (!$v->bmi && $v->height_cm && $v->weight_kg) {
        $m = ((float) $v->height_cm) / 100;
        if ($m > 0) $v->bmi = round(((float)$v->weight_kg) / ($m * $m), 2);
      }
    });
  }
}
