<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanySwitchController extends Controller
{
    public function switch(Request $request)
    {
        // 1. Validar la entrada
        $validated = $request->validate([
            // La ID debe ser un entero, puede ser nulo (para la vista global) y debe existir en la tabla 'companies'
            'company_id' => ['nullable', 'integer', 'exists:companies,id'], 
        ]);

        $companyId = $validated['company_id'];
        $user = auth()->user();

        // 🎯 Si no hay ID en sesión O el usuario tiene un ID fijo, usar el de la DB
            if (!$companyId && $user->company_id) {
                 $companyId = $user->company_id;
            }

            // 2. Cargar el objeto de la Compañía (Solo si tenemos una ID válida)
            if ($companyId) {
                // Buscamos solo los campos esenciales para el frontend
                $currentCompany = Company::select(['id', 'business_name', 'rut', 'giro', 'email', 'phone'])
                                         ->find($companyId);
            }
        
        // 2. Almacenar el ID seleccionado en la Sesión de Laravel
        if ($companyId && $currentCompany) {
            $request->session()->put('current_company_id', $companyId);
            $request->session()->put('current_company', $currentCompany);
        } else {
            // Si selecciona "Vista Global" (valor nulo), se elimina la clave de sesión
            $request->session()->forget('current_company_id');
            $request->session()->forget('current_company');
        }

        // 3. Responder a Inertia (recarga la página para aplicar el nuevo contexto global)
        return back(); 
    }
}