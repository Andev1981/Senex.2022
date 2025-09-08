<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PlanSessionConsumption extends Model
{


  protected $fillable = [

    'patient_plan_id',
    'treatment_session_id',
    'sessions_consumed',
    'consumed_at',
    'notes',
  ];

  protected $casts = [
    'sessions_consumed' => 'integer',
    'consumed_at'       => 'datetime',
  ];

  public function patientPlan()
  {
    return $this->belongsTo(PatientPlan::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }
}
