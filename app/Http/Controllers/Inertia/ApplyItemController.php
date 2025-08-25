<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\ApplyItem;
use App\Http\Requests\StoreApplyItemRequest;
use App\Http\Requests\UpdateApplyItemRequest;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ApplyItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        $sesiones = ApplyItem::select(
            'apply_items.id',
            'apply_items.status',
            'apply_items.created_at',
            'apply_items.price',
            'apply_items.fecha_atencion',
            'apply_items.numero_sesion',
            'apply_items.comments',
            'apply_items.patient_id',
            'apply_items.doctor_id',
            'apply_items.application_id',
            'apply_items.application_type_id',
            DB::raw("CONCAT(COALESCE(patients.name, ''), ' ', COALESCE(patients.last_name, '')) AS patient_full_name"),
            DB::raw("CONCAT(COALESCE(doctors.name, ''), ' ', COALESCE(doctors.last_name, '')) AS doctor_full_name"),
            'application_types.name as type_name',

        )
            ->join('patients', 'patients.id', '=', 'apply_items.patient_id')
            ->join('doctors', 'doctors.id', '=', 'apply_items.doctor_id')
            ->join('applications', 'applications.id', '=', 'apply_items.application_id')
            ->join('application_types', 'application_types.id', '=', 'apply_items.application_type_id')
            ->orderBy('apply_items.id', 'DESC')
            ->get();

        $pacientes = Patient::select([
            'patients.id as patient_id',
            'patients.name as patient_name',
            'patients.last_name as patient_last_name',
            'patients.rut as rut',
            'patients.email as email'
        ])->where('status', 1)->orderBy('id', 'DESC')->get();
        $kines = Doctor::where('status', 1)->orderBy('id', 'DESC')->get();
        $apply_types = ApplicationType::where('estado', 1)->orderBy('id', 'DESC')->get();


        return Inertia::render('Sesiones/SesionesIndex', compact('sesiones', 'kines', 'apply_types', 'pacientes'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreApplyItemRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreApplyItemRequest $request)
    {
        $validatedData = $request->all();

        /*     dd($validatedData); */

        if (!$validatedData["application_id"]) {
            $application = Application::create([
                'user_id' => auth()->user()->id,
                'patient_id' => $validatedData["patient_id"],
                'status' => 1,
                'type_value' => 0,
                'type_payment' => 2,
                'derivado' => '',
                'desde' => '',
            ]);
            $validatedData["application_id"] = $application->id;
        }

        $applicationTypeUser = ApplicationTypeUser::where('application_type_id', $validatedData["application_type_id"])->where('doctor_id', $validatedData["doctor_id"])->first();

        if (!$applicationTypeUser) {
            $applicationTypeUser = ApplicationTypeUser::create([
                'user_id' => auth()->user()->id,
                'doctor_id' =>  $validatedData["doctor_id"],
                'application_type_id' => $validatedData["application_type_id"],
                'price' => 0
            ]);
        }

        $validatedData["application_type_user_id"] = $applicationTypeUser->id;
        $validatedData["user_id"] = auth()->user()->id;


        $patient = Patient::find($validatedData["patient_id"]);
        $wallet = Wallet::where('patient_id', '=', $patient->id)->first();

        if (!$wallet) {
            $wallet = new Wallet();
            $wallet->patient_id = $patient->id;
            $wallet->balance = 0;
            $wallet->save();
        }

        if ($validatedData["status"] === 1 && $wallet->balance < $validatedData["price"]) {
            $wallet->balance = $wallet->balance + $validatedData["price"];
            $wallet->save();
        }

        if ($validatedData["status"]  === 1) {
            $patient->payment_status = 1;
            $patient->save();
        }


        $applyItem = ApplyItem::create($validatedData);

        return back();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ApplyItem  $applyItem
     * @return \Illuminate\Http\Response
     */
    public function show(ApplyItem $applyItem)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ApplyItem  $applyItem
     * @return \Illuminate\Http\Response
     */
    public function edit(ApplyItem $applyItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateApplyItemRequest  $request
     * @param  \App\Models\ApplyItem  $applyItem
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateApplyItemRequest $request, ApplyItem $applyItem)
    {
        /*   dd($request->all(), $applyItem); */

        $validatedData = $request->all();

        $patient = Patient::find($applyItem->patient_id);
        $wallet = Wallet::where('patient_id', '=', $patient->id)->first();

        if (!$wallet) {
            $wallet = new Wallet();
            $wallet->patient_id = $patient->id;
            $wallet->balance = 0;
            $wallet->save();
        }


        if ($applyItem->status === 1 && $wallet->balance < $applyItem->price) {
            $wallet->balance = $wallet->balance + $applyItem->price;
            $wallet->save();
        }

        if ($applyItem->status === 1) {
            $patient->payment_status = 1;
            $patient->save();
        }

        $applyItem->update($validatedData);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ApplyItem  $applyItem
     * @return \Illuminate\Http\Response
     */
    public function destroy(ApplyItem $applyItem)
    {
        /*    dd($applyItem); */
        $success = $applyItem->delete();

        return back();
    }
}
