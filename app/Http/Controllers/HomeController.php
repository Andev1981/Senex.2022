<?php

namespace App\Http\Controllers;

use App\Models\Comuna;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {

        /* if(auth()->user()->patient == null && auth()->user()->doctor == null){
            return back();
        }
        if(auth()->user()->roles[0]->name == 'Patient'){
            return redirect()->route('paciente.show', auth()->user()->patient->id);
        }elseif(auth()->user()->roles[0]->name == 'Doctor'){
            return redirect()->route('doctor.show', auth()->user()->doctor->id);
        }
        return view('admin.index'); */

        $user = auth()->user();
        $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->where('status', 1)->orderBy('birth', 'desc')->get();

        $comunas = Comuna::where('region_id', 1)->get();

        return Inertia::render('Patients/PatientsIndex', compact('user', 'pacientes', 'comunas'));
    }
}
