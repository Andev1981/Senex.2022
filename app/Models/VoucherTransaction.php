<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoucherTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'payment_id',
        'treatment_session_id',
        'transaction_type',
        'amount_clp',
        'sessions_used',
        'balance_before',
        'balance_after',
        'sessions_before',
        'sessions_after',
        'description',
        'processed_by',
    ];

    protected $casts = [
        'amount_clp' => 'integer',
        'sessions_used' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'sessions_before' => 'integer',
        'sessions_after' => 'integer',
    ];

    // ==================== RELACIONES ====================

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(TreatmentSession::class, 'treatment_session_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // ==================== SCOPES ====================

    public function scopeByType($query, string $type)
    {
        return $query->where('transaction_type', $type);
    }

    public function scopeUsages($query)
    {
        return $query->where('transaction_type', 'usage');
    }

    public function scopeByVoucher($query, int $voucherId)
    {
        return $query->where('voucher_id', $voucherId);
    }

    // ==================== ACCESSORS ====================

    public function getAmountChangeAttribute(): int
    {
        return $this->balance_after - $this->balance_before;
    }

    public function getSessionsChangeAttribute(): int
    {
        return $this->sessions_after - $this->sessions_before;
    }
}
