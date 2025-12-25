<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;


class PayrollDetail extends Model
{

  use Multitenantable;

  protected $fillable = [
    'company_id',
    'payroll_id',
    'treatment_session_id',
    'session_type_name',
    'patient_amount_clp',
    'doctor_amount_clp',
    'commission_rate',
    'notes',
  ];

  protected $casts = [
    'patient_amount_clp' => 'decimal:2',
    'doctor_amount_clp'  => 'decimal:2',
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
