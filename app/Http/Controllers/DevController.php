<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

class DevController extends Controller
{
    public function loginAs(User $user)
    {
        if (config('app.env') !== 'local') {
            abort(403, 'Solo disponible en local');
        }

        Auth::login($user);
        
        // Limpiar sesión para forzar recarga de sucursal
        session()->forget(['active_branch_id', 'current_company_id']);

        // Instanciar el controlador de sesión para usar su lógica de redirección
        $authController = new AuthenticatedSessionController();
        
        // Usar reflexión o simplemente llamar al método si fuera público, 
        // pero como es protected en el original, lo replicamos o lo hacemos público en el original.
        // Mejor: Replicamos la lógica mínima aquí para asegurar que funcione.
        
        $redirectTo = '/';
        
        if ($user->hasAnyRole(['superadmin', 'admin'])) {
            $redirectTo = route('dashboard');
        } elseif ($user->hasRole('kine')) {
            $redirectTo = route('kine.dashboard');
            
            // Inicializar sucursal para Kine
            $validBranch = $user->doctor->branches()
                ->wherePivot('status', 'active')
                ->wherePivot('mobile_app_access', true)
                ->first();
            
            if ($validBranch) {
                session(['active_branch_id' => $validBranch->id]);
            }
        }

        // Retornar JSON para que el frontend maneje la redirección forzada
        return response()->json([
            'success' => true,
            'redirect' => $redirectTo
        ]);
    }
}
