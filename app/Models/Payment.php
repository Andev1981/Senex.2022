<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory, Multitenantable;

    protected $guarded = [
        'id'
    ];

    protected $fillable = [
        'company_id',
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


    public function patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function paymentAllocation() : HasOne
    {
        return $this->hasOne(PaymentAllocation::class);
    }

    public function invoice() : HasOne
    {
        return $this->hasOne(Invoice::class);
    }


}
