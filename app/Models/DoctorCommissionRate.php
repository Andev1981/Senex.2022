<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorCommissionRate extends Model
{


  public const TYPE_PERCENTAGE  = 'percentage';
  public const TYPE_FIXED       = 'fixed_amount';

  protected $fillable = [
    'doctor_id',
    'session_type_id',
    'commission_type',
    'commission_value',
    'effective_from',
    'effective_until',
    'is_active',
    'notes',
  ];

  protected $casts = [
    'commission_value' => 'integer',
    'effective_from'   => 'date',
    'effective_until'  => 'date',
    'is_active'        => 'boolean',
  ];

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function sessionType()
  {
    return $this->belongsTo(SessionType::class);
  }

  public function scopeActive($q)
  {
    return $q->where('is_active', true)
      ->where('effective_from', '<=', now()->toDateString())
      ->where(function ($w) {
        $w->whereNull('effective_until')
          ->orWhere('effective_until', '>=', now()->toDateString());
      });
  }
}
