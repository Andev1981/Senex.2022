<?php

namespace App\Models;

use App\Models\User;
use App\Models\SolicitudType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Price extends Model
{
    use HasFactory;

    protected $guarded = [
        'id'
    ];

    public function solicitudType()
    {
        return $this->belongsTo(SolicitudType::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}

