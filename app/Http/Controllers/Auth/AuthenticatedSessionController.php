<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
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

        // 🎯 REDIRECCIÓN INTELIGENTE SEGÚN ROL
        $user = $request->user();
        
        // Registrar último login
        $user->update(['last_login_at' => now()]);

        // 1. Si es KINE → validar acceso móvil
        if ($user->hasRole('kine')) {
            $doctor = $user->doctor;
            
            // Validar que exista doctor asociado
            if (!$doctor) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')
                    ->withErrors(['email' => 'No se encontró tu perfil de kinesiólogo.']);
            }

            // Validar estado activo
            if ($doctor->status !== 'active') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')
                    ->withErrors(['email' => "Tu cuenta está {$doctor->status}. Contacta al administrador."]);
            }

            // Validar acceso móvil habilitado
            if (!$doctor->mobile_access_enabled) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                return redirect()->route('login')
                    ->withErrors(['email' => 'Tu acceso al portal móvil está deshabilitado. Contacta al administrador.']);
            }

            // ✅ Todo OK - registrar login y redirigir
            $doctor->update(['last_mobile_login' => now()]);
            
            return redirect()->intended(route('kine.dashboard'));
        }

        // 2. Si es ADMIN/SUPERADMIN → dashboard principal
        if ($user->hasRole(['admin', 'superadmin'])) {
            return redirect()->intended(route('dashboard'));
        }

        // 3. Default fallback
        return redirect()->intended(route('/', absolute: false));
    }

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
