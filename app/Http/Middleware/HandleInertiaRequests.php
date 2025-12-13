<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use App\Models\Company; // Importar el modelo Company

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * Incluimos 'current_company' y 'current_company_id' aquí.
     */
    public function share(Request $request): array
    {
        // 1. Obtener el contexto de autenticación y compañía.
        $authData = $this->getAuthContext($request);

        return [
            ...parent::share($request),
            'auth' => $authData['auth'],
            // 🎯 INYECTAMOS EL CONTEXTO DE LA COMPAÑÍA FUERA DE 'auth'
            'current_company' => $authData['current_company'], 
            'current_company_id' => $authData['current_company'] ? $authData['current_company']['id'] : null,
            'all_companies' => $authData['all_companies'],
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'type' => fn() => $request->session()->get('type', 'info'),
            ],
        ];
    }

    /**
     * Obtener el contexto de autenticación y la compañía activa.
     */
    private function getAuthContext(Request $request): array
    {
        $user = $request->user();
        $currentCompany = null;
        $contextCompanyId = null;
        $allCompanies = [];
        
       

        // --- Manejo del Guardia 'Patient' (solo datos básicos) ---
        if (Auth::guard('patient')->check()) {
            $patient = Auth::guard('patient')->user();
            return [
                'auth' => [
                    'user' => $patient?->only('id', 'name', 'email', 'rut', 'company_id'),
                    'guard' => 'patient',
                    'roles' => [],
                    'permissions' => [],
                ],
                'current_company' => null, // Los pacientes no suelen cambiar de contexto
            ];
        }

        // --- Manejo del Guardia 'web' (Admin/Staff) ---
        if ($user) {
            // 1. Determinar el company_id activo
            
            // 🎯 Priorizar el ID de la SESIÓN (Para Superadmin que usa el selector)
            $contextCompanyId = $request->session()->get('current_company_id');

            // 🎯 Si no hay ID en sesión O el usuario tiene un ID fijo, usar el de la DB
            if (!$contextCompanyId && $user->company_id) {
                 $contextCompanyId = $user->company_id;
            }

            // 2. Cargar el objeto de la Compañía (Solo si tenemos una ID válida)
            if ($contextCompanyId) {
                // Buscamos solo los campos esenciales para el frontend
                $currentCompany = Company::select(['id', 'business_name', 'rut', 'giro', 'email', 'phone'])
                                         ->find($contextCompanyId);
            }
        }

        if ($user && $user->isSuperAdmin()) { // 👈 Aquí se usa
            $allCompanies = Company::select(['id', 'business_name', 'rut', 'giro', 'email', 'phone'])->get()->toArray();
        } else {
            $allCompanies = [];
        }

        /* dd($user,  $user->isSuperAdmin(), $allCompanies); */
        
        // 3. Devolver el contexto
        return [
            'auth' => [
                'user' => $user?->only('id', 'name', 'email'),
                'guard' => 'web',
                'roles' => fn() => $user?->getRoleNames() ?? [],
                'permissions' => fn() => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            // Convertir el modelo a array para inyectarlo en Inertia
            'current_company' => $currentCompany ? $currentCompany->toArray() : null, 
            'all_companies' => $allCompanies
        ];
    }
}