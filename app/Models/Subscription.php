<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'saas_plan_id',
        'status',
        'next_billing_date',
        'trial_ends_at',
    ];

    protected $casts = [
        'next_billing_date' => 'date',
        'trial_ends_at' => 'date',
    ];

    public function saasPlan()
    {
        return $this->belongsTo(SaaSPlan::class);
    }
}
