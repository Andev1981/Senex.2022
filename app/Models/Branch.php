<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasAddresses;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
  use HasAddresses;

  protected $fillable = ['company_id', 'codigo_sucursal_sii','is_main','name', 'rut', 'phone', 'email', 'is_main', 'active'];

  protected $casts = [
    'active' => 'boolean',
    'is_main' => 'boolean',
  ];

  public function rooms() : HasMany
  {
    return $this->hasMany(Room::class);
  }

  public function doctors() : HasMany
  {
    return $this->hasMany(Doctor::class);
  }

  public function users() : BelongsToMany
  {
      return $this->belongsToMany(User::class)
                  ->withTimestamps();
  }
}
