<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $guarded = [
        'id'
    ];

    protected $fillable = [
        'patient_id',
        'treatment_id',
        'payment_date',
        'transaction_reference',
        'amount',
        'copay',
        'insurance_covered',
        'payment_method',
        'status',
        'paid_at',
        'invoice',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'date'
    ];


    public function patient(){
        return $this->belongsTo(Patient::class);
    }

    public function treatment(){
        return $this->belongsTo(Treatment::class);
    }

    public function doctor(){
        return $this->belongsTo(Doctor::class);
    }


}
