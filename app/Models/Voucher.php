<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Voucher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'patient_id',
        'type',
        'monetary_value',
        'sessions_quantity',
        'sessions_remaining',
        'discount_percentage',
        'initial_balance',
        'current_balance',
        'used_balance',
        'status',
        'issued_date',
        'activation_date',
        'expiration_date',
        'last_used_at',
        'allowed_treatments',
        'allowed_session_types',
        'is_transferable',
        'source',
        'external_id',
        'metadata',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'monetary_value' => 'integer',
        'sessions_quantity' => 'integer',
        'sessions_remaining' => 'integer',
        'discount_percentage' => 'decimal:2',
        'initial_balance' => 'integer',
        'current_balance' => 'integer',
        'used_balance' => 'integer',
        'issued_date' => 'date',
        'activation_date' => 'date',
        'expiration_date' => 'date',
        'last_used_at' => 'datetime',
        'allowed_treatments' => 'array',
        'allowed_session_types' => 'array',
        'is_transferable' => 'boolean',
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

    public function transactions(): HasMany
    {
        return $this->hasMany(VoucherTransaction::class);
    }

    // ==================== SCOPES ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where(function($q) {
                        $q->whereNull('expiration_date')
                          ->orWhere('expiration_date', '>=', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->where('expiration_date', '<', now())
                    ->where('status', '!=', 'expired');
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }

    public function scopeWithBalance($query)
    {
        return $query->where('current_balance', '>', 0);
    }

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Verifica si el bono está disponible para uso
     */
    public function isAvailable(): bool
    {
        if (!in_array($this->status, ['active', 'partially_used'])) {
            return false;
        }

        if ($this->expiration_date && $this->expiration_date->isPast()) {
            return false;
        }

        if ($this->type === 'monetary' && $this->current_balance <= 0) {
            return false;
        }

        if ($this->type === 'sessions' && $this->sessions_remaining <= 0) {
            return false;
        }

        return true;
    }

    /**
     * Activa el bono
     */
    public function activate(): bool
    {
        if ($this->status !== 'pending_activation') {
            return false;
        }

        $this->update([
            'status' => 'active',
            'activation_date' => now(),
        ]);

        $this->transactions()->create([
            'transaction_type' => 'activation',
            'amount' => $this->initial_balance,
            'balance_before' => 0,
            'balance_after' => $this->initial_balance,
            'sessions_before' => 0,
            'sessions_after' => $this->sessions_quantity,
            'description' => 'Activación inicial del bono',
        ]);

        return true;
    }

    /**
     * Usa el bono para un pago
     */
    public function useForPayment(int $amount, ?int $paymentId = null, ?int $sessionId = null): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        if ($this->type === 'monetary' && $amount > $this->current_balance) {
            return false;
        }

        $balanceBefore = $this->current_balance;
        $sessionsBefore = $this->sessions_remaining;

        // Actualizar saldos según tipo
        $newBalance = $this->current_balance;
        $newSessions = $this->sessions_remaining;

        if ($this->type === 'monetary') {
            $newBalance = $this->current_balance - $amount;
        } elseif ($this->type === 'sessions') {
            $newSessions = $this->sessions_remaining - 1;
            $amount = 0; // Las sesiones no tienen valor monetario directo
        }

        // Determinar nuevo estado
        $newStatus = $this->status;
        if ($newBalance === 0 || $newSessions === 0) {
            $newStatus = 'fully_used';
        } elseif ($newBalance < $this->initial_balance || $newSessions < $this->sessions_quantity) {
            $newStatus = 'partially_used';
        }

        // Actualizar bono
        $this->update([
            'current_balance' => $newBalance,
            'sessions_remaining' => $newSessions,
            'used_balance' => $this->used_balance + $amount,
            'status' => $newStatus,
            'last_used_at' => now(),
        ]);

        // Registrar transacción
        $this->transactions()->create([
            'transaction_type' => 'usage',
            'payment_id' => $paymentId,
            'treatment_session_id' => $sessionId,
            'amount' => $amount,
            'sessions_used' => $this->type === 'sessions' ? 1 : 0,
            'balance_before' => $balanceBefore,
            'balance_after' => $newBalance,
            'sessions_before' => $sessionsBefore,
            'sessions_after' => $newSessions,
            'description' => 'Uso de bono en pago',
        ]);

        return true;
    }

    /**
     * Calcula el monto disponible para un tratamiento/sesión específica
     */
    public function availableAmountFor(?int $treatmentId = null, ?int $sessionTypeId = null): int
    {
        if (!$this->isAvailable()) {
            return 0;
        }

        // Verificar restricciones de tratamiento
        if ($treatmentId && $this->allowed_treatments) {
            if (!in_array($treatmentId, $this->allowed_treatments)) {
                return 0;
            }
        }

        // Verificar restricciones de tipo de sesión
        if ($sessionTypeId && $this->allowed_session_types) {
            if (!in_array($sessionTypeId, $this->allowed_session_types)) {
                return 0;
            }
        }

        return $this->current_balance;
    }

    /**
     * Marca el bono como expirado
     */
    public function markAsExpired(): bool
    {
        if ($this->status === 'expired') {
            return false;
        }

        $this->update(['status' => 'expired']);

        $this->transactions()->create([
            'transaction_type' => 'expiration',
            'amount' => 0,
            'balance_before' => $this->current_balance,
            'balance_after' => $this->current_balance,
            'description' => 'Bono expirado automáticamente',
        ]);

        return true;
    }

    /**
     * Transfiere el bono a otro paciente
     */
    public function transferTo(int $newPatientId, int $userId): bool
    {
        if (!$this->is_transferable) {
            return false;
        }

        if (!$this->isAvailable()) {
            return false;
        }

        $oldPatientId = $this->patient_id;

        $this->update(['patient_id' => $newPatientId]);

        $this->transactions()->create([
            'transaction_type' => 'transfer',
            'amount' => 0,
            'balance_before' => $this->current_balance,
            'balance_after' => $this->current_balance,
            'processed_by' => $userId,
            'description' => "Transferido del paciente #{$oldPatientId} al paciente #{$newPatientId}",
        ]);

        return true;
    }

    /**
     * Genera un código único para el bono
     */
    public static function generateCode(string $prefix = 'IMED'): string
    {
        $year = now()->year;
        $random = strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
        
        return "{$prefix}-{$year}-{$random}";
    }

    // ==================== ACCESSORS ====================

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiration_date && $this->expiration_date->isPast();
    }

    public function getIsFullyUsedAttribute(): bool
    {
        return $this->status === 'fully_used' || 
               $this->current_balance === 0 || 
               $this->sessions_remaining === 0;
    }

    public function getUsagePercentageAttribute(): float
    {
        if ($this->initial_balance === 0) {
            return 0;
        }

        return round(($this->used_balance / $this->initial_balance) * 100, 2);
    }

    public function getRemainingDaysAttribute(): ?int
    {
        if (!$this->expiration_date) {
            return null;
        }

        return now()->diffInDays($this->expiration_date, false);
    }
}
