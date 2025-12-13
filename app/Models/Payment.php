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
        'branch_id',
        'liquidation_payor_id ',
        'transaction_reference',
        'amount_clp',
        'copay_clp',
        'insurance_covered_clp',
        'payment_method',
        'status',
        'paid_at',
        'payment_date',
        'webpay_token',
        'webpay_buy_order',
        'webpay_session_id',
        'webpay_authorization_code',
        'webpay_payment_type',
        'webpay_response_code',
        'webpay_installments',
        'webpay_card_detail',
        'webpay_transaction_date',
        'webpay_raw_response',
        'invoice_id',
        'notes',
    ];

    protected $casts = [
        'paid_at' => 'date',
        'payment_date' => 'date',
        'webpay_transaction_date' => 'date'
    ];


    public function patient(){
        return $this->belongsTo(Patient::class);
    }

    public function doctor(){
        return $this->belongsTo(Doctor::class);
    }


}
