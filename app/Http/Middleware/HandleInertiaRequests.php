<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
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

            // Mensajes Flash (Genérico)
            'flash' => array_filter([
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
                'type' => $request->session()->get('type'),
            ]),

            //Datos generales de la app
            'appVersion' => config('app.version'),
            'appName' => config('app.name'),
            'env' => config('app.env'),
            'projectPath' => str_replace('\\', '/', base_path()),
            'currentRouteName' => Route::currentRouteName(),
            'dev_users' => config('app.env') === 'local' 
                ? (function() use ($request) {
                    $users = \App\Models\User::with('roles')->orderBy('id')->take(50)->get();
                    $currentUser = $request->user();
                    
                    if ($currentUser && !$users->contains('id', $currentUser->id)) {
                        // Recargar roles por seguridad y añadir a la colección
                        $currentUser->load('roles');
                        $users->push($currentUser);
                    }
                    
                    return $users->sortBy('id')->map(function($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'roles' => $u->getRoleNames(),
                        ];
                    })->values();
                })()
                : [],
            'gitInfo' => config('app.env') === 'local' ? Cache::remember('git_info', 300, function () {
                try {
                    $branch = trim(exec('git rev-parse --abbrev-ref HEAD'));
                    $hash = trim(exec('git log -1 --format=%h'));
                    return "git: $branch @ $hash";
                } catch (\Throwable $e) {
                    return null;
                }
            }) : null,
            'pendingJobsCount' => config('app.env') === 'local' ? DB::table('jobs')->count() : 0,
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

            // --- 2. DETERMINAR ID DE EMPRESA (Con auto-reparación) ---
            $contextCompanyId = $request->session()->get('current_company_id');

            if (!$contextCompanyId) {
                // Intentamos recuperar del perfil del usuario
                if ($user->company_id) {
                    $contextCompanyId = $user->company_id;
                }
                // Si es Superadmin y no tiene empresa asignada, tomamos la primera
                elseif ($user->isSuperAdmin()) {
                    $firstCompany = Company::first();
                    $contextCompanyId = $firstCompany ? $firstCompany->id : null;
                }

                // 🎯 CRUCIAL: Si encontramos un ID, lo guardamos en la sesión 
                // para que en la siguiente petición no sea null.
                if ($contextCompanyId) {
                    $request->session()->put('current_company_id', $contextCompanyId);
                }
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
