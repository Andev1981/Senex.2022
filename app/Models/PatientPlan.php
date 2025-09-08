<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PatientPlan extends Model
{


  public const STATUS_ACTIVE   = 'active';
  public const STATUS_EXPIRED  = 'expired';
  public const STATUS_EXHAUSTED = 'exhausted';
  public const STATUS_PAUSED   = 'paused';

  protected $fillable = [
    'tenant_id',
    'patient_id',
    'plan_id',
    'purchased_at',
    'expiry_date',
    'sessions_included',
    'sessions_used',
    'status',
    'payment_transaction_id',
  ];

  protected $casts = [
    'purchased_at'      => 'datetime',
    'expiry_date'       => 'date',
    'sessions_included' => 'integer',
    'sessions_used'     => 'integer',
  ];

  // ===== Relaciones =====
  public function patient()
  {
    return $this->belongsTo(Patient::class);
  }

  public function plan()
  {
    return $this->belongsTo(Plan::class);
  }

  public function paymentTransaction()
  {
    return $this->belongsTo(PaymentTransaction::class);
  }

  public function consumptions()
  {
    return $this->hasMany(PlanSessionConsumption::class);
  }

  // ===== Helpers de estado =====
  public function isExpired(): bool
  {
    return $this->expiry_date ? Carbon::today()->gt($this->expiry_date) : false;
  }

  public function hasSessionsLeft(): bool
  {
    // ilimitado no tiene tope
    if (optional($this->plan)->type === Plan::TYPE_UNLIMITED) return true;

    $included = (int)($this->sessions_included ?? 0);
    $used     = (int)($this->sessions_used ?? 0);
    return $included > 0 && $used < $included;
  }

  public function remainingSessions(): ?int
  {
    if (optional($this->plan)->type === Plan::TYPE_UNLIMITED) return null;
    $included = (int)($this->sessions_included ?? 0);
    $used     = (int)($this->sessions_used ?? 0);
    return max(0, $included - $used);
  }

  public function isUsable(): bool
  {
    return $this->status === self::STATUS_ACTIVE
      && !$this->isExpired()
      && $this->hasSessionsLeft();
  }

  // ¿Cubre un tipo de sesión específico?
  public function coversSessionType(?int $sessionTypeId): bool
  {
    $p = $this->plan;
    return $p && $p->allowsSessionType($sessionTypeId);
  }

  // Marcar uso de 1 sesión (no guarda consumo; úsalo desde servicio)
  public function incrementUsage(int $qty = 1): void
  {
    if ($qty <= 0) return;
    // ilimitado no incrementa contador de tope, igual registramos consumo para auditoría
    if (optional($this->plan)->type !== Plan::TYPE_UNLIMITED) {
      $this->sessions_used = (int)$this->sessions_used + $qty;
    }
    // actualizar estado si corresponde
    if ($this->isExpired()) {
      $this->status = self::STATUS_EXPIRED;
    } elseif (!$this->hasSessionsLeft() && optional($this->plan)->type !== Plan::TYPE_UNLIMITED) {
      $this->status = self::STATUS_EXHAUSTED;
    } else {
      $this->status = self::STATUS_ACTIVE;
    }
    $this->save();
  }

  // Scopes
  public function scopeActive($q)
  {
    return $q->where('status', self::STATUS_ACTIVE);
  }

  public function scopeNotExpired($q)
  {
    return $q->where(function ($qq) {
      $qq->whereNull('expiry_date')->orWhere('expiry_date', '>=', now()->toDateString());
    });
  }
}
