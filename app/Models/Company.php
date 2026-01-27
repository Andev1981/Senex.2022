<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Facades\Storage;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'rut',
        'business_name',
        'giro',
        'email',
        'phone',

    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute()
    {
        $logo = $this->logo;
        if (!$logo) return null;
        
        // Si el path ya es una URL completa (ej: S3), retornarla
        if (filter_var($logo->path, FILTER_VALIDATE_URL)) {
            return $logo->path;
        }

        // Si no, generar la URL del storage
        return Storage::url($logo->path);
    }



    protected static function booted()
    {
        static::created(function ($company) {
            $company->branches()->create([
                'name' => 'Sucursal Principal', // Nombre genérico, el estado 'Casa Matriz' lo da is_main
                'codigo_sucursal_sii' => '0',
                'email' => $company->email,
                'phone' => $company->phone,
                'is_main' => true,
                'active' => true,
            ]);
        });
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    // Configuración DTE (1 a 1)
    public function dteConfiguration(): HasOne
    {
        return $this->hasOne(DteConfiguration::class);
    }

    // Folios Autorizados - CAF (1 a Muchos) -> ESTA FALTABA
    public function authorizedFolios(): HasMany
    {
        return $this->hasMany(AuthorizedFolio::class);
    }

    // Logo (Polimórfica)
    public function logo(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable')->where('type', 'logo');
    }
}
