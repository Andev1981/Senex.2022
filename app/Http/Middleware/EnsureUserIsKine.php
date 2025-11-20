<?php
// app/Http/Middleware/EnsureUserIsKine.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Doctor;

class EnsureUserIsKine
{
    public function handle(Request $request, Closure $next)
    {
        // Verificar autenticación
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Verificar que tenga rol 'kine'
        if (!$request->user()->hasRole('kine')) {
            abort(403, 'No tienes permisos para acceder a esta sección');
        }

        // Verificar que exista como doctor y esté activo
        $doctor = Doctor::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (!$doctor) {
            abort(403, 'Tu cuenta de kinesiólogo no está activa');
        }

        // Verificar acceso móvil habilitado
        if (!$doctor->mobile_access_enabled) {
            return redirect()
                ->route('kine.access-denied')
                ->with('error', 'Tu acceso al portal móvil está deshabilitado');
        }

        // Todo OK - continuar
        return $next($request);
    }
}