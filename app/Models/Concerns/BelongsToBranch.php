<?php

namespace App\Models\Concerns;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait BelongsToBranch
 * 
 * Agrega funcionalidad común para modelos que pertenecen a una sucursal
 * 
 * @property int|null $branch_id
 * @property Branch|null $branch
 */
trait BelongsToBranch
{
    /**
     * Relación con la sucursal
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Scope: filtrar por sucursal
     */
    public function scopeForBranch(Builder $query, int|Branch $branch): Builder
    {
        $branchId = $branch instanceof Branch ? $branch->id : $branch;
        
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope: filtrar por múltiples sucursales
     */
    public function scopeForBranches(Builder $query, array $branchIds): Builder
    {
        return $query->whereIn('branch_id', $branchIds);
    }

    /**
     * Scope: solo registros sin sucursal asignada
     */
    public function scopeWithoutBranch(Builder $query): Builder
    {
        return $query->whereNull('branch_id');
    }

    /**
     * Verificar si pertenece a una sucursal específica
     */
    public function isFromBranch(int|Branch $branch): bool
    {
        $branchId = $branch instanceof Branch ? $branch->id : $branch;
        
        return $this->branch_id === $branchId;
    }

    /**
     * Boot del trait - eventos automáticos
     */
    protected static function bootBelongsToBranch(): void
    {
        // Al crear un registro, asignar sucursal por defecto si está configurada
        static::creating(function ($model) {
            if (!$model->branch_id && config('app.default_branch_id')) {
                $model->branch_id = config('app.default_branch_id');
            }
        });
    }
}