<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'last_name',
        'avatar',
        'rut',
        'birth',
        'phone',
        'address_id',
        'status',
    ];

    protected $dates = ['birth'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function sessions_items()
    {
        return $this->hasMany(ApplyItem::class);
    }

    public function applyTypes()
    {
        return $this->hasMany(ApplicationTypeUser::class);
    }

    public function apply_types()
    {
        return $this->hasMany(ApplicationTypeUser::class);
    }

    public function getAgeAttribute()
    {
        if (!$this->birth || !Carbon::hasFormat($this->birth, 'Y-m-d')) {
            return null;
        }

        return Carbon::parse($this->birth)->age . ' años';
    }

    public function getEmailAttribute()
    {
        return $this->user ? $this->user->email : null;
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

    protected $appends = [
        'age',
        'email',
        'direccion',
    ];
}
