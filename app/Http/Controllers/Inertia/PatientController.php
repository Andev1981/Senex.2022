<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\ApplyItem;
use App\Models\Comuna;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->where('status', 1)->orderBy('birth', 'desc')->get();

        $comunas = Comuna::where('region_id', 1)->get();

        return Inertia::render('Patients/PatientsIndex', compact('user', 'pacientes', 'comunas'));
    }

    public function kines()
    {
        $doctors = Doctor::all();
        return Inertia::render('Kines/KinesIndex', compact('doctors'));
    }

    public function update(Request $request, Patient $patient)
    {
        $validatedData = $request->all();

        $buscarRutPaciente = Patient::where('rut', $validatedData['rut'])->first();

        if ($buscarRutPaciente != null) {
            if ($validatedData['rut'] !== $buscarRutPaciente->rut) {
                if ($validatedData['rut'] != '16094552-4' && $validatedData['rut'] != '16.094.552-4') {
                    dd('Primer if');
                    return back()->with('error', 'El rut ya se encuentra registrado');
                }
            }
        }


        $address = Address::findOrFail($validatedData['address_id']);

        $address->street = $validatedData['street'] || '';
        $address->number = $validatedData['number'] || '';
        $address->detail = $validatedData['detail'] || '';
        $address->comuna_id = $validatedData['comuna_id'];
        $address->save();

        $patient->name = $validatedData['name'];
        $patient->last_name = $validatedData['last_name'];
        $patient->email = $validatedData['email'];
        $patient->rut = $validatedData['rut'];
        $patient->birth = $validatedData['birth'];
        $patient->phone = $validatedData['phone'];
        $patient->address_id = $address->id;
        $patient->save();

        return redirect()->route('listado.pacientes');
    }

    public function store(Request $request)
    {
        $validatedData = $request->all();

        $buscarRutPaciente = Patient::where('rut', $validatedData['rut'])->first();

        if ($buscarRutPaciente != null) {
            if ($validatedData['rut'] != '16094552-4' && $validatedData['rut'] != '16.094.552-4') {
                return back()->with('error', 'El rut ya se encuentra registrado');
            }
        }

        $patient = new Patient();
        $patient->user_id = auth()->user()->id;
        $patient->name = $validatedData['name'];
        $patient->last_name = $validatedData['last_name'];
        $patient->email = $validatedData['email'];
        $patient->rut = $validatedData['rut'];
        $patient->birth = $validatedData['birth'];
        $patient->phone = $validatedData['phone'] ? $validatedData['phone'] : '';
        $patient->status = 1;
        $patient->save();

        $address = new Address();
        $address->street = $validatedData['street'] || '';
        $address->number = $validatedData['number'] || '';
        $address->detail = $validatedData['detail'] || '';
        $address->comuna_id = $validatedData['comuna_id'];
        $address->save();

        $patient->address_id = $address->id;
        $patient->save();

        return redirect()->route('listado.pacientes');
    }

    public function destroy(Patient $patient)
    {
        /*    dd($applyItem); */
        $patient->status = 0;
        $patient->save();

        return back();
    }

    public function kineDetalles($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) {
            return redirect()->route('listado.kines')->with('error', 'Kinesiólogo no encontrado.');
        }
        //$atenciones = ApplyItem::with('patient', 'application')->where('doctor_id', $doctor->id)->where('status', 1)->orderBy('fecha_atencion', 'desc')->get();

        $atenciones = DB::table('apply_items as ai')
            ->leftJoin('patients as p', 'p.id', '=', 'ai.patient_id')
            ->leftJoin('doctors as d', 'd.id', '=', 'ai.doctor_id')
            ->leftJoin('application_types as appt', 'appt.id', '=', 'ai.application_type_id')
            ->leftJoin('application_type_users as apptu', function ($join) use ($doctor) {
                $join->on('apptu.id', '=', 'ai.application_type_user_id')
                    ->where('apptu.user_id', '=', $doctor->id); // <- filtra por el user del doctor
                // si la columna fuera apptu.doctor_id, cámbiala aquí
            })
            ->where('ai.doctor_id', $doctor->id)
            ->where('ai.status', 1)
            ->orderByDesc('p.name')
            ->orderBy('ai.fecha_atencion', 'asc')
            ->select([
                'ai.id',
                'ai.fecha_atencion',
                'ai.status',
                DB::raw("CONCAT(p.name,' ',p.last_name) as patient_full"),
                'appt.name as application_type_name',
                'apptu.price as valor_kine',
                'ai.price as valor_senex',
                'ai.numero_sesion',
            ])
            ->selectRaw('(COALESCE(ai.price,0) - COALESCE(apptu.price,0)) as total_senex')
            ->get();


        $user = auth()->user();

        /*       dd($atenciones); */


        return Inertia::render('Kines/KineDetalles', compact('doctor', 'atenciones', 'user'));
    }
}
