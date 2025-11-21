<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnsureUserIsKine
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Verificar autenticación
        if (!$request->user()) {
            return redirect()->route('login')
                ->with('error', 'Debes iniciar sesión para acceder');
        }

        $user = $request->user();

        // 2. Verificar rol 'kine'
        if (!$user->hasRole('kine')) {
            Log::warning('Usuario sin rol kine intentó acceder', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);
            
            abort(403, 'No tienes permisos para acceder a KineMobile');
        }

        // 3. Verificar que exista doctor asociado
        if (!$user->doctor) {
            Log::error('Usuario kine sin doctor asociado', [
                'user_id' => $user->id
            ]);
            
            abort(500, 'Error: No se encontró tu perfil de kinesiólogo');
        }

        $doctor = $user->doctor;

        // 4. Verificar estado activo
        if ($doctor->status !== 'active') {
            return redirect()
                ->route('kine.access-denied')
                ->with('error', "Tu cuenta está {$doctor->status}. Contacta al administrador.");
        }

        // 5. Verificar acceso móvil habilitado
        if (!$doctor->mobile_access_enabled) {
            Log::info('Kine con acceso móvil deshabilitado', [
                'doctor_id' => $doctor->id
            ]);
            
            return redirect()
                ->route('kine.access-denied')
                ->with('error', 'Tu acceso al portal móvil está deshabilitado');
        }

        // 6. Registrar último acceso (sin bloquear request)
        dispatch(function () use ($doctor) {
            $doctor->update([
                'last_mobile_login' => now()
            ]);
        })->afterResponse();

        // ✅ Todo OK
        return $next($request);
    }
}