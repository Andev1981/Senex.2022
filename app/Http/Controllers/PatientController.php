<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Solicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\QuizzAnswer;
use App\Models\QuizzQuestion;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */


    public function index()
    {
        $pacientes = Patient::where('status', 1)->orderBy('id', 'DESC')->get();
        return view('admin.pacientes.index', compact('pacientes'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('admin.pacientes.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StorePatientRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'rut' => 'required',
            'birthday' => 'required',
            'phone' => 'required|max:12',
            'direccion' => 'required|max:200',
            'comuna' => 'required|max:75',
        ]);
        $input = $request->all();

        $input['password'] = Hash::make($input['password']);
        $input['state'] = 1;

        $user = User::create($input);
        $paciente = Patient::create([
            'user_id' => $user->id,
            'phone' => $request->get('phone'),
            'direccion' => $request->get('direccion'),
            'comuna' => $request->get('comuna'),
        ]);

        $success = $user->assignRole('Paciente');


        if ($success) {
            toast('Ha creado correctamente al paciente', 'success');
        } else {
            toast('Ha ocurrido un problema, inténtelo nuevamente', 'danger');
            return back();
        }
        return redirect()->route('pacientes.show', [$paciente]);
    }

    public function preguntas(Request $request)
    {

        $pat = Patient::where('id', '=', $request->paciente)->first();
        $xsxsxs = $pat->findOrFail($request->paciente);
        $xsxsxs->p1 = $request->p1;
        $xsxsxs->p2 = $request->p2;
        $xsxsxs->p3 = $request->p3;
        $xsxsxs->p4 = $request->p4;
        $xsxsxs->p5 = $request->p5;

        $success = $xsxsxs->save();

        if ($success) {
            toast('Paciente agregado correctamente !', 'success');
        } else {
            toast('Ha ocurrido un problema, inténtelo nuevamente', 'danger');
        }

        return redirect()->route('pacientes.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function show(Patient $patient)
    {


        return view('admin.pacientes.show', compact('paciente', 'solicitudes', 'pagos'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function edit(Patient $patient)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientRequest  $request
     * @param  \App\Models\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        dd($request, $patient);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function destroy(Patient $patient)
    {
        //
    }
}
