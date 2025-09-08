<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PayrollDetail extends Model
{


  protected $fillable = [
    'payroll_id',
    'treatment_session_id',
    'session_type_name',
    'patient_amount',
    'doctor_amount',
    'commission_rate',
    'notes',
  ];

  protected $casts = [
    'patient_amount' => 'decimal:2',
    'doctor_amount'  => 'decimal:2',
    'commission_rate' => 'decimal:2', // si guardas % aplicado
  ];

  public function payroll()
  {
    return $this->belongsTo(Payroll::class);
  }

  public function treatmentSession()
  {
    return $this->belongsTo(TreatmentSession::class);
  }
}
