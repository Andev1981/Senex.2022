<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;

class PatientAccessCode extends Model
{
    use Multitenantable;
    /**
     * No usa updated_at
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'company_id',
        'patient_id',
        'code',
        'expires_at',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    // ============================================================================
    // RELACIONES
    // ============================================================================

    /**
     * Paciente al que pertenece este código
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    // ============================================================================
    // ACCESSORS
    // ============================================================================

    /**
     * Verificar si el código está expirado
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Verificar si el código fue usado
     */
    public function getIsUsedAttribute(): bool
    {
        return !is_null($this->used_at);
    }

    /**
     * Verificar si el código es válido (no usado y no expirado)
     */
    public function getIsValidAttribute(): bool
    {
        return !$this->is_used && !$this->is_expired;
    }

    // ============================================================================
    // SCOPES
    // ============================================================================

    /**
     * Códigos válidos (no usados y no expirados)
     */
    public function scopeValid($query)
    {
        return $query->whereNull('used_at')
                     ->where('expires_at', '>', now());
    }

    /**
     * Códigos de un paciente específico
     */
    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Códigos con un código específico
     */
    public function scopeWithCode($query, string $code)
    {
        return $query->where('code', $code);
    }

    /**
     * Códigos expirados
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Códigos usados
     */
    public function scopeUsed($query)
    {
        return $query->whereNotNull('used_at');
    }

    // ============================================================================
    // MÉTODOS DE ACCIÓN
    // ============================================================================

    /**
     * Marcar código como usado
     */
    public function markAsUsed(string $ipAddress, string $userAgent): bool
    {
        return $this->update([
            'used_at' => now(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Generar un nuevo código de 6 dígitos
     */
    public static function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Crear un nuevo código para un paciente
     */
    public static function createForPatient(int $patientId, int $expiresInMinutes = 15): self
    {
        return self::create([
            'patient_id' => $patientId,
            'code' => self::generateCode(),
            'expires_at' => now()->addMinutes($expiresInMinutes),
        ]);
    }

    /**
     * Invalidar todos los códigos anteriores de un paciente
     */
    public static function invalidatePreviousCodesForPatient(int $patientId): int
    {
        return self::where('patient_id', $patientId)
                   ->whereNull('used_at')
                   ->where('expires_at', '>', now())
                   ->update(['expires_at' => now()]);
    }

    /**
     * Limpiar códigos expirados (llamar desde cron job)
     */
    public static function cleanupExpired(int $daysOld = 7): int
    {
        return self::where('expires_at', '<', now()->subDays($daysOld))
                   ->delete();
    }

    /**
     * Validar y marcar como usado un código
     */
    public static function validateAndUse(
        int $patientId,
        string $code,
        string $ipAddress,
        string $userAgent
    ): ?self {
        $accessCode = self::forPatient($patientId)
                         ->withCode($code)
                         ->valid()
                         ->first();

        if (!$accessCode) {
            return null;
        }

        $accessCode->markAsUsed($ipAddress, $userAgent);

        return $accessCode;
    }
}