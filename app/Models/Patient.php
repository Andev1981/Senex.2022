<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'last_name',
        'email',
        'avatar',
        'rut',
        'birth',
        'phone',
        'address_id',
        'status',
        'payment_status',
        'orden',
    ];



    public function applications()
    {
        return $this->hasMany(Application::class);
    }
    public function address()
    {
        return $this->hasOne(Address::class, 'id', 'address_id');
    }

    public function applyItems()
    {
        return $this->hasMany(ApplyItem::class);
    }

    public function lastAttention()
    {
        return $this->hasOne(ApplyItem::class)->latestOfMany(); // usa created_at o fecha
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function pacientes()
    {
        return $this->hasMany(PacienteKine::class);
    }

    public function getComunaNombreAttribute()
    {
        if (!$this->address || !$this->address->comuna) {
            return null;
        }
        return $this->address->comuna->name ?? null;
    }

    public function getDoctorNombreAttribute()
    {
        if (!$this->lastAttention || !$this->lastAttention->doctor) {
            return null;
        }
        return $this->lastAttention->doctor->name . ' ' . $this->lastAttention->doctor->last_name ?? null;
    }

    public function getDireccionAttribute()
    {
        if (!$this->address || !$this->address->address || !$this->address->number) {
            return null;
        }
        if (!$this->address->number) {
            return $this->address->address . ' ' . $this->address->number ?? null;
        }
        return $this->address->address ?? null;
    }

    public function getAgeAttribute()
    {
        if (!$this->birth || !Carbon::hasFormat($this->birth, 'Y-m-d')) {
            return null;
        }

        return Carbon::parse($this->birth)->age . ' años';
    }

    protected $appends = [
        'comuna_nombre',
        'doctor_nombre',
        'age',
        'direccion',
    ];
}
