<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    use HasFactory;

    protected $guarded = [
        'id'
    ];


    public function doctor(){
        return $this->belongsTo(Doctor::class);
    }

    public function patient(){
        return $this->belongsTo(Patient::class);
    }

    public function solicitud_type(){
        return $this->belongsTo(SolicitudType::class);
    }

    public function images(){
        return $this->hasMany(Image::class);
    }

    public function prescriptions(){
        return $this->hasMany(Prescription::class);
    }

    public function payment(){
        return $this->belongsTo(Payment::class);
    }

}
