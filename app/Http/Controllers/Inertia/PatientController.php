<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->get();

        return Inertia::render('Patients/PatientsIndex', compact('user', 'pacientes'));
    }

    public function kines()
    {
        $doctors = Doctor::all();
        return Inertia::render('Kines/KinesIndex', compact('doctors'));
    }
}
