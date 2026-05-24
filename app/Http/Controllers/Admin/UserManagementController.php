<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->hasRole(['superadmin', 'admin'])) {
                abort(403, 'Acceso restringido a administradores.');
            }
            return $next($request);
        });
    }

    public function index()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin');

        $usersQuery = User::with(['roles', 'branches', 'company']);
        $companiesQuery = Company::query();
        $branchesQuery = Branch::query();

        if (!$isSuperAdmin) {
            $usersQuery->where('company_id', $user->company_id);
            $companiesQuery->where('id', $user->company_id);
            $branchesQuery->where('company_id', $user->company_id);
        }

        return Inertia::render('admin/Users/Index', [
            'users' => $usersQuery->get(),
            'roles' => Role::with('permissions')
                ->when(!$isSuperAdmin, function($query) {
                    return $query->where('name', '!=', 'superadmin');
                })
                ->get(),
            'companies' => $companiesQuery->get(),
            'branches' => $branchesQuery->get(),
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        $isSuperAdmin = $currentUser->hasRole('superadmin');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
            'roles' => 'required|array',
            'permissions' => 'array', // Permisos directos
            'branches' => 'array',
        ]);

        $user = DB::transaction(function () use ($request, $isSuperAdmin, $currentUser) {
            $companyId = $isSuperAdmin ? $request->company_id : $currentUser->company_id;
            
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'company_id' => $companyId,
            ]);

            $roles = $request->roles;
            if (!$isSuperAdmin) {
                $roles = array_diff($roles, ['superadmin']);
            }
            
            $user->syncRoles($roles);
            
            if ($request->has('permissions')) {
                $user->syncPermissions($request->permissions);
            }
            
            if ($request->has('branches')) {
                // Filtrar sucursales para asegurar que pertenecen a la empresa
                $validBranches = Branch::where('company_id', $companyId)
                    ->whereIn('id', $request->branches)
                    ->pluck('id');
                $user->branches()->sync($validBranches);

                // 🎯 Si es Kine, crear/sincronizar perfil de Doctor
                if ($user->hasRole('kine')) {
                    $doctor = \App\Models\Doctor::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'company_id' => $companyId,
                            'name' => $user->name,
                            'email' => $user->email,
                        ]
                    );

                    $doctorBranches = [];
                    foreach ($validBranches as $bId) {
                        $doctorBranches[$bId] = [
                            'status' => 'active',
                            'mobile_app_access' => true,
                            'can_create_sessions' => $request->boolean('can_create_sessions', true),
                            'can_view_sessions' => $request->boolean('can_view_sessions', true),
                            'can_manage_schedule' => $request->boolean('can_manage_schedule', true),
                            'status_changed_at' => now(),
                        ];
                    }
                    $doctor->branches()->sync($doctorBranches);
                }
            }

            return $user;
        });

        // 🎯 Enviar Notificación de Bienvenida
        try {
            $user->notify(new \App\Notifications\UserWelcomeNotification($user, $request->password));
        } catch (\Exception $e) {
            \Log::warning("No se pudo enviar email de bienvenida a {$user->email}: " . $e->getMessage());
        }

        return back()->with('success', 'Usuario creado correctamente y notificado por email.');
    }

    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        $isSuperAdmin = $currentUser->hasRole('superadmin');

        // Verificar que un admin normal no edite a alguien de otra empresa
        if (!$isSuperAdmin && $user->company_id !== $currentUser->company_id) {
            abort(403, 'No tienes permiso para editar este usuario.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
            'roles' => 'required|array',
            'branches' => 'array',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $user, $isSuperAdmin, $currentUser) {
            $companyId = $isSuperAdmin ? ($request->company_id ?? $user->company_id) : $user->company_id;

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'company_id' => $companyId,
            ];

            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            $roles = $request->roles;
            if (!$isSuperAdmin) {
                $roles = array_diff($roles, ['superadmin']);
                // Si el usuario ya era superadmin
                if ($user->hasRole('superadmin')) {
                    $roles[] = 'superadmin';
                }
            }

            $user->syncRoles($roles);
            
            if ($request->has('permissions')) {
                $user->syncPermissions($request->permissions);
            }
            
            if ($request->has('branches')) {
                $validBranches = Branch::where('company_id', $companyId)
                    ->whereIn('id', $request->branches)
                    ->pluck('id')
                    ->toArray();
                
                $user->branches()->sync($validBranches);

                // 🎯 Si es Kine, sincronizar también el perfil de Doctor
                if ($user->hasRole('kine') && $user->doctor) {
                    $doctorBranches = [];
                    foreach ($validBranches as $bId) {
                        $doctorBranches[$bId] = [
                            'status' => 'active',
                            'mobile_app_access' => true,
                            'can_create_sessions' => $request->boolean('can_create_sessions', true),
                            'can_view_sessions' => $request->boolean('can_view_sessions', true),
                            'can_manage_schedule' => $request->boolean('can_manage_schedule', true),
                            'status_changed_at' => now(),
                        ];
                    }
                    $user->doctor->branches()->sync($doctorBranches);
                }
            }
        });

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }

        $user->delete();
        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    // Gestión de Roles y Permisos (Opcional, pero solicitado)
    public function updateRoles(Request $request)
    {
        $request->validate([
            'roles' => 'required|array',
        ]);

        foreach ($request->roles as $roleData) {
            $role = Role::find($roleData['id']);
            if ($role) {
                $role->syncPermissions($roleData['permissions'] ?? []);
            }
        }

        return back()->with('success', 'Permisos de roles actualizados.');
    }

    public function updateCompanyModules(Request $request, Company $company)
    {
        $request->validate(['enabled_modules' => 'array']);
        $company->update(['enabled_modules' => $request->enabled_modules]);
        return back()->with('success', 'Módulos de empresa actualizados.');
    }

    public function updateBranchModules(Request $request, Branch $branch)
    {
        $request->validate(['enabled_modules' => 'array']);
        $branch->update(['enabled_modules' => $request->enabled_modules]);
        return back()->with('success', 'Módulos de sucursal actualizados.');
    }
}
