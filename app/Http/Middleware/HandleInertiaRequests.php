<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
         return [
            ...parent::share($request),
            'auth' => $this->getAuthData($request),
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'type' => fn() => $request->session()->get('type', 'info'),
            ],
        ];
    }

    /**
     * Obtener datos de autenticación según el guard activo
     */
    private function getAuthData(Request $request): array
    {
        // Si es un paciente autenticado
        if (Auth::guard('patient')->check()) {
            $patient = Auth::guard('patient')->user();
            
            return [
                'user' => $patient?->only('id', 'name', 'email', 'rut'),
                'guard' => 'patient',
                'roles' => [],
                'permissions' => [],
            ];
        }

        // Si es un usuario normal (admin/staff)
        $user = $request->user();
        
        return [
            'user' => $user?->only('id', 'name', 'email'),
            'guard' => 'web',
            'roles' => fn() => $user?->getRoleNames() ?? [],
            'permissions' => fn() => $user?->getAllPermissions()->pluck('name') ?? [],
        ];
    }
}
