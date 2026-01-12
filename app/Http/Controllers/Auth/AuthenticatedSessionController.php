<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Registrar último login
        $user->update(['last_login_at' => now()]);

        // --- 🎯 Lógica de Sucursal Inicial ---
        // Buscamos la sucursal marcada como 'is_main' o la primera disponible
        $initialBranch = $user->branches()->wherePivot('is_main', true)->first()
            ?? $user->branches()->first();

        if ($initialBranch) {
            // Guardamos en la sesión la sucursal activa
            $request->session()->put('active_branch_id', $initialBranch->id);
        }
        //

        // 🎯 REDIRECCIÓN DETERMINÍSTICA
        $redirectTo = $this->getRedirectRoute($user);

        Log::info('Usuario autenticado', [
            'user_id' => $user->id,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'redirect_to' => $redirectTo
        ]);

        return redirect()->to($redirectTo);
    }

    protected function getRedirectRoute($user): string
    {
        // 1. KINE → Validar sucursales y redirigir
        if ($user->hasRole('kine')) {
            $doctor = $user->doctor;

            // A. Validar que el perfil existe
            if (!$doctor) {
                Auth::logout();
                session()->flash('error', 'No se encontró tu perfil de kinesiólogo.');
                return route('login');
            }

            // B. Buscar Sucursales Válidas
            // Buscamos si tiene al menos UNA sucursal donde:
            // 1. El estado sea 'active'
            // 2. Tenga acceso móvil habilitado (mobile_app_access = 1)
            $validBranch = $doctor->branches()
                ->wherePivot('status', 'active')
                ->wherePivot('mobile_app_access', true)
                ->first(); // Obtenemos la primera que cumpla

            // C. Si no tiene ninguna sucursal válida, expulsamos
            if (!$validBranch) {
                Auth::logout();
                session()->flash('error', 'No tienes acceso habilitado en ninguna sucursal activa. Contacta a administración.');
                return route('login');
            }

            // D. ✅ Todo OK - Configuración de entorno

            // IMPORTANTE: Como tu modelo usa session('active_branch_id') en el getBranchAttribute,
            // debemos inicializarlo aquí para que el dashboard cargue con datos.
            if (!session()->has('active_branch_id')) {
                session(['active_branch_id' => $validBranch->id]);
            }

            // Actualizamos última conexión
            $doctor->update(['last_mobile_login' => now()]);

            return route('kine.dashboard');
        }

        // 2. ADMIN/SUPERADMIN
        if ($user->hasRole(['admin', 'superadmin'])) {
            return route('/');
        }

        // 3. FALLBACK
        return '/';
    }

    /**
     * Determinar ruta de redirección según usuario
     */
    /* protected function getRedirectRoute($user): string
    {

        // 1. KINE → Validar y redirigir a KineMobile
        if ($user->hasRole('kine')) {
            $doctor = $user->doctor;

            // Validar doctor existe
            if (!$doctor) {
                Auth::logout();
                session()->flash('error', 'No se encontró tu perfil de kinesiólogo.');
                return route('login');
            }

            // Validar estado activo
            if ($doctor->status !== 'active') {
                Auth::logout();
                session()->flash('error', "Tu cuenta está {$doctor->status}. Contacta al administrador.");
                return route('login');
            }

            // Validar acceso móvil
            if (!$doctor->mobile_access_enabled) {
                Auth::logout();
                session()->flash('error', 'Tu acceso móvil está deshabilitado. Contacta al administrador.');
                return route('login');
            }

            // ✅ Todo OK - registrar y redirigir
            $doctor->update(['last_mobile_login' => now()]);

            return route('kine.dashboard');
        }

        // 2. ADMIN/SUPERADMIN → Dashboard principal
        if ($user->hasRole(['admin', 'superadmin'])) {
            return route('/');
        }

        // 3. FALLBACK → Ruta por defecto
        return '/';
    } */

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
