<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'duration_minutes',
        'requires_diagnosis',
        'requires_referral',
        'default_doctor_commission_clp',
        'specialty',
    ];

    protected $casts = [
        'requires_diagnosis' => 'boolean',
        'requires_referral' => 'boolean',
        'default_doctor_commission_clp' => 'decimal:2',
        'duration_minutes' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
