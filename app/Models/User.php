<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\PermissionRegistrar;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'company_id',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime'
    ];

    public function doctor(): HasOne
    {
        return $this->hasOne(Doctor::class);
    }

    public function company() : HasOne
    {
        return $this->hasOne(Company::class);
    }

    public function roles_all() : MorphToMany
    {
        return $this->morphToMany(
            config('permission.models.role'),
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.model_morph_key'),
            PermissionRegistrar::$pivotRole
        );
    }

    /**
     * Verifica si el usuario tiene el rol de Superadministrador.
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        // El Superadministrador puede no estar asociado a ninguna compañía específica
        // o su company_id se maneja de forma especial (ej., company_id = 0 o null).
        
        return $this->hasRole('superadmin'); 
        
        // O si quieres que todos los permisos se apliquen a él:
        // return $this->hasRole(['Superadmin', 'GlobalAdmin']); 
    }

}
