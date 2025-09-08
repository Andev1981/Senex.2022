<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Plan extends Model
{


  public const TYPE_ANNUAL      = 'annual';
  public const TYPE_SESSIONPACK = 'session_pack';
  public const TYPE_UNLIMITED   = 'unlimited';

  protected $fillable = [

    'name',
    'type',
    'total_sessions',
    'price',
    'valid_months',
    'session_types',
    'is_active',
  ];

  protected $casts = [
    'total_sessions' => 'integer',
    'price'          => 'decimal:2',
    'valid_months'   => 'integer',
    'session_types'  => 'array',   // [session_type_id, ...]
    'is_active'      => 'boolean',
  ];

  // Plan admite cierto tipo de sesión
  public function allowsSessionType(?int $sessionTypeId): bool
  {
    if (!$sessionTypeId) return false;
    $allowed = $this->session_types ?? [];
    return in_array((int)$sessionTypeId, array_map('intval', $allowed), true);
  }

  // Scopes útiles
  public function scopeActive($q)
  {
    return $q->where('is_active', true);
  }
  public function scopeForType($q, string $type)
  {
    return $q->where('type', $type);
  }
}
