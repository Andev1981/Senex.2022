<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class NotificationAttemp extends Model
{


  protected $fillable = [
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
