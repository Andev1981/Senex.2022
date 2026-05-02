<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;


class Room extends Model
{
  use Multitenantable;


  protected $fillable = ['company_id', 'branch_id', 'name', 'capacity','status'];

  protected $casts = ['capacity' => 'integer'];

  public function branch()
  {
    return $this->belongsTo(Branch::class);
  }
}
