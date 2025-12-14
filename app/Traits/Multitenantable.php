<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Multitenantable
{
    public static function bootMultitenantable()
    {
        // 1. Al consultar (Select): Filtra automáticamente por la empresa en sesión
        static::addGlobalScope('company_id', function (Builder $builder) {
            $companyId = session('current_company_id');
            
            if ($companyId) {
                $builder->where($builder->getQuery()->from . '.company_id', $companyId);
            } elseif (auth()->check() && auth()->user()->isSuperAdmin()) {
                // Si es Superadmin y no hay empresa en sesión, NO aplicamos filtro.
                // Esto evita que las consultas fallen en la "Vista Global".
            }
        });

        // 2. Al crear (Insert): Asigna automáticamente la empresa activa
        static::creating(function ($model) {
            if (!$model->company_id) {
                $model->company_id = session('current_company_id');
            }
        });
    }
}