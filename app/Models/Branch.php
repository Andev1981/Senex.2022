<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasAddresses;

class Branch extends Model
{
  use HasAddresses;

  protected $fillable = ['name', 'rut', 'phone', 'email','active'];

  protected $casts = ['active' => 'boolean'];

  public function rooms()
  {
    return $this->hasMany(Room::class);
  }

  public function doctors()
  {
    return $this->hasMany(Doctor::class);
  }
}
