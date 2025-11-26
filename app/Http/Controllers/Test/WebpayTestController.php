<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\TreatmentSession;
use Inertia\Inertia;

class WebpayTestController extends Controller
{
    public function __construct()
    {
        // Solo permitir en desarrollo
        if (!app()->environment('local', 'development')) {
            abort(404);
        }

        $this->middleware(['auth', 'verified']);
    }

    /**
     * Mostrar formulario de prueba
     */
    public function index()
    {
        $patients = Patient::select('id', 'name', 'last_name', 'rut')
            ->limit(20)
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'full_name' => $patient->full_name,
                    'rut' => $patient->rut,
                ];
            });

        $sessions = TreatmentSession::with('patient:id,name,last_name')
            ->select('id', 'patient_id', 'session_number', 'patient_amount_clp')
            ->limit(20)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'session_number' => $session->session_number,
                    'patient_amount_clp' => $session->patient_amount_clp,
                ];
            });

        return Inertia::render('Payments/WebpayTest', [
            'patients' => $patients,
            'sessions' => $sessions,
        ]);
    }
}