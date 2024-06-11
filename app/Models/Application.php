<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'derivado',
        'desde',
        'comments',
        'user_id', //User Doctor
        'patient_id',
        'status',
        'type_payment', // 0 = Por sesión, 1 = Por tratamiento, 2= Mensual por sesiones, 3= Por adelantado  
        'type_value',
    ];

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function items()
    {
        return $this->hasMany(ApplyItem::class);
    }

    public function assigns()
    {
        return $this->hasMany(Assign::class);
    }
}
