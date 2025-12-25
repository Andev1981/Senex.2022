<?php

namespace App\Http\Controllers\Admin\SessionTypes;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\SessionType;
use App\Http\Requests\UpdateBranchSessionTypeRequest;
use Illuminate\Http\JsonResponse;

class BranchSessionTypeController extends Controller
{
    /**
     * Actualiza la configuración de un Tipo de Sesión para una Sucursal específica.
     */
    public function update(
        UpdateBranchSessionTypeRequest $request,
        SessionType $sessionType,
        Branch $branch
    ): JsonResponse {
        // 1. Obtenemos los datos validados
        $data = $request->validated();

        // 2. LÓGICA DE HERENCIA INTELIGENTE
        // Comparamos el valor enviado con el valor Global.
        // Si son iguales, guardamos NULL en la BD.
        // ¿Por qué? Para que si mañana cambias el precio Global, la sucursal se actualice sola.

        $priceToSave = ($data['custom_price_clp'] == $sessionType->base_price_clp)
            ? null
            : $data['custom_price_clp'];

        $durationToSave = ($data['custom_duration_minutes'] == $sessionType->duration_minutes)
            ? null
            : $data['custom_duration_minutes'];

        // Asumimos que el default global de activo es TRUE.
        // Si el global está inactivo, el servicio muere en todos lados igual.
        // Aquí verificamos si la sucursal quiere algo distinto al "Siempre activo".
        $isActiveToSave = $data['is_active_in_branch'];

        // 3. LIMPIEZA DE BASE DE DATOS (OPCIONAL PERO RECOMENDADA)
        // Si todo es "default" (Precios null, Duración null y Activo true),
        // Borramos el registro pivote para no llenar la BD de basura.
        if (is_null($priceToSave) && is_null($durationToSave) && $isActiveToSave === true) {
            $sessionType->branchSettings()->detach($branch->id);

            return response()->json([
                'message' => 'Configuración restaurada a los valores globales de la empresa.',
                'status' => 'inherited'
            ]);
        }

        // 4. GUARDAR LA EXCEPCIÓN (Upsert)
        // Usamos syncWithoutDetaching para crear o actualizar solo este registro
        $sessionType->branchSettings()->syncWithoutDetaching([
            $branch->id => [
                'custom_price_clp'        => $priceToSave,
                'custom_duration_minutes' => $durationToSave,
                'is_active_in_branch'     => $isActiveToSave,
                'custom_code'             => $data['custom_code'] ?? null,
            ]
        ]);

        return response()->json([
            'message' => 'Configuración personalizada guardada correctamente.',
            'status' => 'customized'
        ]);
    }

    /**
     * Método auxiliar para cargar la data en el modal de edición
     */
    public function show(SessionType $sessionType, Branch $branch)
    {
        // Obtenemos la configuración calculada (usando el método que creamos antes en el Modelo)
        // O recuperamos el registro raw si queremos mostrarle al usuario qué es heredado

        $pivot = $sessionType->branchSettings()
            ->where('branch_id', $branch->id)
            ->first()
            ?->pivot;

        return response()->json([
            'global_config' => [
                'price' => $sessionType->base_price_clp,
                'duration' => $sessionType->duration_minutes,
                'is_active' => $sessionType->is_active
            ],
            'branch_config' => [
                // Si enviamos null, el frontend sabrá que es "Heredado"
                'custom_price' => $pivot?->custom_price_clp,
                'custom_duration' => $pivot?->custom_duration_minutes,
                'is_active' => $pivot?->is_active_in_branch ?? true, // Default true si no existe pivote
                'is_customized' => !is_null($pivot)
            ]
        ]);
    }
}
