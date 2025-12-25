<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dte extends Model
{
    use HasFactory, Multitenantable;

    // Relación inversa: "Dime quién me generó"
    public function origin()
    {
        return $this->morphTo();
    }
}
