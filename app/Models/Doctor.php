<?php

namespace App\Models;

use App\Models\Concerns\HasAddresses;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory, HasAddresses;

    protected $fillable = [
        'avatar',
        'rut',
        'birth',
        'phone',
        'address_id',
        'status',
        'user_id',
        'branch_id',
        'name',
        'last_name',
        'rut',
        'specialty',
        'is_active',
    ];

    protected $dates = ['birth'];

    protected $casts = [
        'is_active' => 'bool',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function commissionRates()
    {
        return $this->hasMany(DoctorCommissionRate::class);
    }

    public function applyTypes()
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
