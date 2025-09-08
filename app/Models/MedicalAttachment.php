<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class MedicalAttachment extends Model
{


  protected $fillable = [
    'tenant_id',
    'patient_id',
    'clinical_note_id',
    'treatment_session_id',
    'title',
    'mime_type',
    'size_bytes',
    'storage_path',
    'tags',
    'meta',
  ];

  protected $casts = [
    'size_bytes' => 'integer',
    'tags'       => 'array',
    'meta'       => 'array',
  ];

  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function clinicalNote()
  {
    return $this->belongsTo(ClinicalNote::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }

  // helper: URL pública (ajústalo a tu Storage)
  public function url(): ?string
  {
    return $this->storage_path
      ? \Storage::disk('public')->url($this->storage_path)
      : null;
  }
}
