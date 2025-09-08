<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasAddresses;

class Branch extends Model
{
  use HasAddresses;

  protected $fillable = ['tenant_id', 'name', 'code', 'timezone'];

  public function rooms()
  {
    return $this->hasMany(Room::class);
  }

  public function doctors()
  {
    return $this->hasMany(Doctor::class);
  }
}
