<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectCajero
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('cajero')) {
            $allowedRoutes = [
                'payments.*',
                'logout',
                'patients.status', // Needed for checkout
                'patients.quick_store', // Needed for checkout
                'external-data.*', // Needed for checkout lookup
                'heartbeat',
                'session-keep-alive'
            ];

            $currentRoute = $request->route() ? $request->route()->getName() : null;

            if ($currentRoute) {
                foreach ($allowedRoutes as $allowed) {
                    if (\Illuminate\Support\Str::is($allowed, $currentRoute)) {
                        return $next($request);
                    }
                }
            }

            // Si no es una ruta permitida, redirigir a caja
            if ($currentRoute !== 'payments.index') {
                return redirect()->route('payments.index');
            }
        }

        return $next($request);
    }
}
