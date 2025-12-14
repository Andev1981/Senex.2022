<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $authData = $this->getAuthContext($request);

        return [
            ...parent::share($request),
            'auth' => $authData['auth'],
            
            // Contexto de Compañía
            'current_company' => $authData['current_company'], 
            'current_company_id' => $authData['current_company'] ? $authData['current_company']['id'] : null,

            // Contexto de Sucursal
            'current_branch' => $authData['current_branch'], 
            'current_branch_id' => $authData['current_branch'] ? $authData['current_branch']['id'] : null,

            // Listados para Switchers
            'all_companies' => $authData['all_companies'],
            'available_branches' => $authData['available_branches'],

            // Mensajes Flash
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'type' => fn() => $request->session()->get('type', 'info'),
            ],
        ];
    }

    private function getAuthContext(Request $request): array
    {
        $user = $request->user();
        $currentCompany = null;
        $contextCompanyId = null;
        $allCompanies = [];
        $activeBranch = null;
        $availableBranches = collect();

        // 1. Guardia Patient (Sin cambios)
        if (Auth::guard('patient')->check()) {
            $patient = Auth::guard('patient')->user();
            return [
                'auth' => [
                    'user' => $patient?->only('id', 'name', 'email', 'rut', 'company_id'),
                    'guard' => 'patient',
                    'roles' => [],
                    'permissions' => [],
                ],
                'current_company' => null,
                'current_branch' => null,
                'available_branches' => [],
                'all_companies' => [],
            ];
        }

        if ($user) {
            // --- 2. DETERMINAR ID DE EMPRESA (Lógica simplificada y segura) ---
            
            // Prioridad 1: Lo que el Superadmin eligió en el Switcher (Sesión)
            $contextCompanyId = $request->session()->get('current_company_id');

            // Prioridad 2: Si no hay sesión, usamos el company_id del usuario
            if (!$contextCompanyId && $user->company_id) {
                $contextCompanyId = $user->company_id;
            }

            // Prioridad 3: Si sigue siendo null (Superadmin recién logueado), tomamos la primera
            if (!$contextCompanyId && $user->isSuperAdmin()) {
                $firstCompany = Company::first();
                $contextCompanyId = $firstCompany ? $firstCompany->id : null;
            }

            // --- 3. CARGAR OBJETO COMPAÑÍA ---
            if ($contextCompanyId) {
                // Usamos withoutGlobalScopes() por pura seguridad, aunque ya quitamos el trait
                $currentCompany = Company::withoutGlobalScopes()
                    ->select(['id', 'business_name', 'rut', 'giro', 'email', 'phone'])
                    ->find($contextCompanyId);
            }

            // --- 4. DETERMINAR SUCURSALES DISPONIBLES ---
            if ($user->isSuperAdmin()) {
                $allCompanies = Company::select(['id', 'business_name', 'rut'])->get();
                if ($contextCompanyId) {
                    $availableBranches = Branch::where('company_id', $contextCompanyId)
                        ->select('id', 'name')->get();
                }
            } else {
                // Usuarios normales: Solo sus sucursales en ESA empresa
                $availableBranches = $user->branches()
                    ->where('branches.company_id', $contextCompanyId)
                    ->select('branches.id', 'branches.name')->get();
            }

            // --- 5. DETERMINAR SUCURSAL ACTIVA (Solo lectura) ---
            $activeBranchId = $request->session()->get('active_branch_id');

            if (!$activeBranchId && $availableBranches->isNotEmpty()) {
                // Intentar buscar la principal asignada al usuario
                $mainBranch = $user->branches()
                    ->where('branches.company_id', $contextCompanyId)
                    ->wherePivot('is_main', true)
                    ->first();
                
                $activeBranchId = $mainBranch ? $mainBranch->id : $availableBranches->first()->id;
            }

            if ($activeBranchId && $availableBranches->isNotEmpty()) {
                $activeBranch = $availableBranches->firstWhere('id', $activeBranchId);
            }
        }

        return [
            'auth' => [
                'user' => $user?->only('id', 'name', 'email'),
                'guard' => 'web',
                'roles' => fn() => $user?->getRoleNames() ?? [],
                'permissions' => fn() => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'current_company' => $currentCompany ? $currentCompany->toArray() : null,
            'all_companies' => $allCompanies,
            'current_branch' => $activeBranch ? (is_array($activeBranch) ? $activeBranch : $activeBranch->toArray()) : null,
            'available_branches' => $availableBranches,
        ];
    }
}