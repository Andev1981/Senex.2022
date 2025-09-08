<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory, HasAddresses;

    protected $fillable = [
        'user_id',
        'name',
        'last_name',
        'email',
        'avatar',
        'rut',
        'birth_date',
        'phone',
        'address_id',
        'status',
        'payment_status',
        'orden',
    ];


    protected $casts = [
        'birth_date' => 'date',
    ];

    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function treatments()
    {
        return $this->hasMany(Treatment::class);
    }


    public function address()
    {
        return $this->hasOne(Address::class, 'id', 'address_id');
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }


    public function pacientes()
    {
        return $this->hasMany(PacienteKine::class);
    }

    public function getAgeAttribute()
    {
        if (!$this->birth_date || !Carbon::hasFormat($this->birth_date, 'Y-m-d')) {
            return null;
        }

        return Carbon::parse($this->birth_date)->age . ' años';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    protected $appends = [
        'age',
    ];
}
