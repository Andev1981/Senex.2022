<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientInsurance extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'patient_id',
        "insurance_id",
        "plan_id",
        "member_id",
        "start_date",
        "end_date",
        "status",
        "is_primary",
        "notes",
    ];

    protected $casts = [
        "start_date" => "date",
        "end_date" => "date",
        "is_primary" => "boolean"
    ];

    public function patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function insurance() : BelongsTo
    {
        return $this->belongsTo(Insurance::class);
    }
    
    public function plan() : BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    
}
