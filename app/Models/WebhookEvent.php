<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class WebhookEvent extends Model
{


  protected $fillable = [

    'provider',
    'event_type',
    'idempotency_key',
    'payload',
    'processed_at',
  ];

  protected $casts = [
    'payload'     => 'array',
    'processed_at' => 'datetime',
  ];

  // Helper para marcar como procesado
  public function markProcessed(): void
  {
    $this->processed_at = now();
    $this->save();
  }
}
