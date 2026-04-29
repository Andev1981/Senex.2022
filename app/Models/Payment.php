<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory, Multitenantable;

    protected $guarded = [
        'id'
    ];

    protected $fillable = [
        'uuid',
        'user_id',
        'company_id',
        'branch_id',
        'patient_id',
        'liquidation_insurance_id',
        'amount_clp', // Copago final
        'amount_gross_clp', // Copago final
        'amount_insurance_primary_clp', // Copago final
        'amount_insurance_secondary_clp', // Copago final
        'discount_clp',
        'payment_date',
        'transaction_reference',
        'payment_method',
        'status',
        'paid_at',
        'webpay_token',
        'webpay_buy_order',
        'webpay_session_id',
        'webpay_authorization_code',
        'webpay_payment_type_code',
        'webpay_response_code',
        'webpay_installments',
        'webpay_card_detail',
        'webpay_raw_response',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array', // Crucial para recuperar el carrito en el commit
        'webpay_card_detail' => 'array',
        'payment_date' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function liquidationInsurance(): BelongsTo
    {
        return $this->belongsTo(Insurance::class, 'liquidation_insurance_id');
    }

    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function receivables(): HasMany
    {
        return $this->hasMany(Receivable::class);
    }
}
