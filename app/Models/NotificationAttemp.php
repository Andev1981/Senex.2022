<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;


class NotificationAttemp extends Model
{
  use Multitenantable;

  protected $fillable = [
    'company_id',
    'patient_id',
    'event_key ',
    'channel',
    'status',
    'error_message',
    'sent_at',
  ];



  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

}
