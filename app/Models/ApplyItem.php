<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplyItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',
        'patient_id',
        'application_id',
        'application_type_id',
        'application_type_user_id',
        'price',
        'status',
        'fecha_atencion',
        'numero_sesion',
        'comments',
        'estado_pago',
    ];

    public function applicationType()
    {
        return $this->belongsTo(ApplicationType::class);
    }

    public function applicationTypeUser()
    {
        return $this->belongsTo(ApplicationTypeUser::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'id');
    }

    public function assign()
    {
        return $this->hasOne(Assign::class);
    }

    public function payment()
    {
        return $this->hasOne(PaymentIncome::class);
    }
}
