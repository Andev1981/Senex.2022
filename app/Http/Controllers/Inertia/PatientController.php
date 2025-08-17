<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Comuna;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->where('status', 1)->get();

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
        $validatedData = $request->validate([
            'name' => 'required',
            'last_name' => 'required',
            'email' => 'required',
            'rut' => 'required',
            'birth' => 'required',
            'phone' => 'required',
            'address_id' => 'required',
            'street' => 'required',
            'number' => 'required',
            'detail' => 'required',
            'comuna_id' => 'required',
        ]);

        $address = Address::find($validatedData['address_id']);

        $address->street = $validatedData['street'];
        $address->number = $validatedData['number'];
        $address->detail = $validatedData['detail'];
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

        $patient = new Patient();
        $patient->name = $validatedData['name'];
        $patient->last_name = $validatedData['last_name'];
        $patient->email = $validatedData['email'];
        $patient->rut = $validatedData['rut'];
        $patient->birth = $validatedData['birth'];
        $patient->phone = $validatedData['phone'];
        $patient->save();

        $address = new Address();
        $address->street = $validatedData['street'];
        $address->number = $validatedData['number'];
        $address->detail = $validatedData['detail'];
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
}
