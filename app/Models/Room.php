<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Room extends Model
{


  protected $fillable = ['branch_id', 'name', 'capacity','status'];

  protected $casts = ['capacity' => 'integer'];

  public function branch()
  {
    return $this->belongsTo(Branch::class);
  }
}
