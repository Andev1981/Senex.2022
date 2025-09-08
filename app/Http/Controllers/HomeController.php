<?php

namespace App\Http\Controllers;

use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\Commune;
use App\Models\Comuna;
use App\Models\Patient;
use App\Models\SessionType;
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
        /* $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->where('status', 1)->orderBy('birth_date', 'desc')->get(); */
        $patients = Patient::with('treatments')->get();
        $communes = Commune::whereBetween('province_id', [2401, 2406])->get();


        /*  dd($patients, $communes); */

        return Inertia::render('Patients/IndexPatients', compact('user', 'patients', 'communes'));
    }


    public function fix()
    {

        $applyTypes = ApplicationType::all();


        if (!$applyTypes->isEmpty()) {
            foreach ($applyTypes as $type) {

                SessionType::create([
                    'name' => $type->name,
                    'base_price' => 1000,
                    'duration_minutes' => 1,
                    'plan_elegible' => 1,
                    'plan_session_value' => 1000,
                    'is_active' => 1
                ]);
            }
            return 'Proceso completado exitosamente.';
        } else {
            return 'No hay tipos de aplicación para procesar.';
        }
    }
}
