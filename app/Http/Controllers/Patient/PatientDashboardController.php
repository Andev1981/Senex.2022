<?php

namespace App\Http\Controllers\Patient;

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
              return Inertia::render('Patients/Dashboard/Index');
        }

        return Inertia::render('Auth/Patient/Login');
    }

}