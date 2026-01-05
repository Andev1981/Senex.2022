<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientSearchController extends Controller
{
    /**
     * Busca pacientes aplicando filtros de contexto (Multi-Tenant).
     */
    public function search(Request $request)
    {
        // 1. Obtener los parámetros de la búsqueda
        $query = $request->input('q');
        
        // 2. Establecer el contexto del usuario actual (Asumiendo Company ID)
        $userCompanyId = auth()->user()->company_id; 
        
        // 3. Validar el término de búsqueda para eficiencia
        if (strlen($query) < 3) {
            return response()->json([]);
        }

        // 4. Construir la consulta con filtros de seguridad
        $patients = Patient::select('id', 'name', 'run')
            // Filtrar por la compañía del usuario (SEGURIDAD CRÍTICA)
            ->where('company_id', $userCompanyId) 
            
            // Aplicar el filtro de búsqueda por nombre o RUN
            ->where(function ($q) use ($query) {
                // Búsqueda LIKE por nombre
                $q->where('name', 'LIKE', '%' . $query . '%') 
                  // Búsqueda por RUN
                  ->orWhere('run', 'LIKE', '%' . $query . '%'); 
            })
            ->limit(10) // Limitar resultados por eficiencia
            ->get();
        
        // 5. Devolver la respuesta en formato JSON
        return response()->json($patients);
    }
}
