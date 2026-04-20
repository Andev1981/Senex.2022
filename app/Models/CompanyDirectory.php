<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CompanyDirectory extends Model
{
    use HasFactory, Multitenantable;

    protected $table = 'companies_directory';

    protected $fillable = [
        'company_id',
        'rut',
        'business_name',
        'giro',
        'email',
        'phone',
        'address',
        'commune_id',
        'activity',
        'last_api_sync_at',
        'is_active'
    ];

    protected $casts = [
        'last_api_sync_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class);
    }

    /**
     * Relación con facturas donde esta empresa es el receptor
     */
    public function invoices(): MorphMany
    {
        return $this->morphMany(Invoice::class, 'entity');
    }

    // Accesor para compatibilidad con buscador unificado
    public function getFullNameAttribute()
    {
        return $this->business_name;
    }
}
