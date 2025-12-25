<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

trait BelongsToTenant
{
  public static function bootBelongsToTenant()
  {
    // =========================================================
    // 1. AL CREAR (Inyección de datos)
    // =========================================================
    static::creating(function ($model) {
      if (Auth::check()) {
        $user = Auth::user();

        // --- COMPANY ID ---
        if (in_array('company_id', $model->getFillable())) {
          // Lógica de Prioridad:
          // 1. Si ya viene seteado manualmente en el código ($model->company_id), lo respetamos.
          // 2. Si hay una 'active_company_id' en la sesión (contexto actual), la usamos.
          // 3. Si no, usamos la company_id fija del usuario.

          $sessionCompany = Session::get('active_company_id'); // Asegúrate de guardar esto al cambiar de empresa

          $model->company_id = $model->company_id
            ?? $sessionCompany
            ?? $user->company_id;
        }

        // --- BRANCH ID ---
        if (in_array('branch_id', $model->getFillable())) {
          $sessionBranch = Session::get('active_branch_id');

          // Nota: Si el usuario tiene una branch fija, podrías agregarla como fallback aquí también
          $model->branch_id = $model->branch_id ?? $sessionBranch;
        }
      }
    });

    // =========================================================
    // 2. AL LEER (Global Scope / Filtro Automático)
    // =========================================================
    static::addGlobalScope('tenant', function (Builder $builder) {

      // A. MODO DEDICADO (Cliente VIP / Single Tenant)
      // Si en .env tienes TENANCY_MODE=single, no filtramos nada.
      if (config('app.tenancy_mode') === 'single') {
        return;
      }

      // B. MODO SAAS (Multi-Empresa)
      if (Auth::check()) {
        $user = Auth::user();

        // Excepción Superadmin: Ve todo (o solo lo de la sesión activa)
        if ($user->hasRole(['superadmin', 'admin'])) {
          $sessionCompany = Session::get('active_company_id');
          if ($sessionCompany) {
            $builder->where('company_id', $sessionCompany);
          }
          return;
        }

        // Usuario Normal: Filtramos por su Company ID
        // Usamos $builder->getModel() para no instanciar uno nuevo
        $model = $builder->getModel();
        if (in_array('company_id', $model->getFillable())) {
          $builder->where('company_id', $user->company_id);
        }
      }
    });
  }
}
