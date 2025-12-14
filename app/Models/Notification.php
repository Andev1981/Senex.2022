<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;


class Notification extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
    'patient_id',
    'allergies',
    'conditions',
    'medications',
    'surgeries',
    'immunizations',
    'family_history',
    'social_history',
    'alerts',
    'emergency_name',
    'emergency_phone',
    'emergency_relation',
    'general_notes',
  ];

  protected $casts = [
    'allergies'       => 'array',
    'conditions'      => 'array',
    'medications'     => 'array',
    'surgeries'       => 'array',
    'immunizations'   => 'array',
    'family_history'  => 'array',
    'social_history'  => 'array',
    'alerts'          => 'array',
  ];

  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  // helpers
  public function addAlert(string $text): void
  {
    $alerts = $this->alerts ?? [];
    $alerts[] = ['text' => $text, 'at' => now()->toISOString()];
    $this->alerts = $alerts;
    $this->save();
  }
}
