<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PaymentLink extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'token',
        'patient_id',
        'created_by',
        'description',
        'amount',
        'allow_partial_payment',
        'minimum_amount',
        'session_ids',
        'debt_ids',
        'status',
        'paid_amount',
        'payment_id',
        'expires_at',
        'paid_at',
        'auto_issue_dte',
        'dte_type',
        'allowed_payment_methods',
        'access_count',
        'max_access_count',
        'recipient_email',
        'email_sent_at',
        'email_sent_count',
        'metadata',
        'notes',
    ];

    protected $casts = [
        'amount' => 'integer',
        'allow_partial_payment' => 'boolean',
        'minimum_amount' => 'integer',
        'session_ids' => 'array',
        'debt_ids' => 'array',
        'paid_amount' => 'integer',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'auto_issue_dte' => 'boolean',
        'dte_type' => 'integer',
        'allowed_payment_methods' => 'array',
        'access_count' => 'integer',
        'max_access_count' => 'integer',
        'email_sent_at' => 'datetime',
        'email_sent_count' => 'integer',
        'metadata' => 'array',
    ];

    // ==================== RELACIONES ====================

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    // ==================== SCOPES ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '<=', now());
    }

    public function scopeByPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopePaid($query)
    {
        return $query->whereIn('status', ['paid', 'partially_paid']);
    }

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Verifica si el link está disponible
     */
    public function isAvailable(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        if ($this->expires_at->isPast()) {
            return false;
        }

        if ($this->access_count >= $this->max_access_count) {
            return false;
        }

        return true;
    }

    /**
     * Incrementa el contador de accesos
     */
    public function incrementAccessCount(): void
    {
        $this->increment('access_count');
    }

    /**
     * Marca como pagado
     */
    public function markAsPaid(int $paymentId, int $paidAmount): void
    {
        $status = $paidAmount >= $this->amount ? 'paid' : 'partially_paid';

        $this->update([
            'status' => $status,
            'payment_id' => $paymentId,
            'paid_amount' => $paidAmount,
            'paid_at' => now(),
        ]);
    }

    /**
     * Marca como expirado
     */
    public function markAsExpired(): void
    {
        if ($this->status === 'pending') {
            $this->update(['status' => 'expired']);
        }
    }

    /**
     * Marca como cancelado
     */
    public function cancel(): void
    {
        if ($this->status === 'pending') {
            $this->update(['status' => 'cancelled']);
        }
    }

    /**
     * Genera un token único
     */
    public static function generateToken(): string
    {
        do {
            $token = Str::random(64);
        } while (self::where('token', $token)->exists());

        return $token;
    }

    /**
     * Genera la URL pública del enlace de pago
     */
    public function getPublicUrl(): string
    {
        return route('payment-links.show', ['token' => $this->token]);
    }

    // ==================== ACCESSORS ====================

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getRemainingAmountAttribute(): int
    {
        return max(0, $this->amount - $this->paid_amount);
    }

    public function getExpiresInHoursAttribute(): int
    {
        if ($this->is_expired) {
            return 0;
        }

        return (int) now()->diffInHours($this->expires_at);
    }

    public function getCanBeAccessedAttribute(): bool
    {
        return $this->isAvailable();
    }
}
