<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicalNote extends Model
{

  protected $fillable = [
    'patient_id',
    'doctor_id',
    'treatment_session_id',
    'appointment_id',
    // SOAP
    'subjective',
    'objective',
    'assessment',
    'plan',
    // estructuras clínicas
    'diagnoses',
    'procedures',
    'goals',
    'forms',
    // firma
    'is_signed',
    'signed_at',
    'signed_by_user_id',
    'meta',
  ];

  protected $casts = [
    'diagnoses' => 'array',   // [{code, system, text}]
    'procedures' => 'array',   // [{code, text, units}]
    'goals'     => 'array',   // [{text, due}]
    'forms'     => 'array',   // [{name, fields: {...}}]
    'is_signed' => 'boolean',
    'signed_at' => 'datetime',
    'meta'      => 'array',
  ];

  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function doctor()
  {
    return $this->belongsTo(Doctor::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  public function appointment()
  {
    return $this->belongsTo(Appointment::class);
  }

  public function attachments()
  {
    return $this->hasMany(MedicalAttachment::class);
  }

  // helpers
  public function sign(int $userId): void
  {
    $this->is_signed = true;
    $this->signed_at = now();
    $this->signed_by_user_id = $userId;
    $this->save();
  }
}
