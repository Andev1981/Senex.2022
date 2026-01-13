<?php

namespace App\Http\Controllers\Admin\Clients;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PatientDashboardController extends Controller
{
    /**
     * Mostrar formulario de login
     * GET /patient/login
     */
    public function index()
    {
        // Si ya está autenticado, redirigir al dashboard
        if (Auth::guard('patient')->check()) {
            return Inertia::render('clients/Index');
        }

        return Inertia::render('auth/Patient/Login');
    }
}
