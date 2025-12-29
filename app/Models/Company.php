<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;

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


    protected static function booted()
    {
        static::created(function ($company) {
            $company->branches()->create([
                'name' => 'Casa Matriz',
                'codigo_sucursal_sii' => '0', // O el código que uses para la casa matriz
                'email' => $company->email,
                'phone' => $company->phone,
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
