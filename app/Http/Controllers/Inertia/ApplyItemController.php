<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\ApplyItem;
use App\Http\Requests\StoreApplyItemRequest;
use App\Http\Requests\UpdateApplyItemRequest;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
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
        /* $sesiones =  ApplyItem::select(
            'id',
            'doctor_id',
            'patient_id',
            'price',
            'status',
            'application_type_id',
            'fecha_atencion',
            'numero_sesion',
            'comments'
        )->where('status', 1)
            ->whereBetween('fecha_atencion', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth(),
            ])
            ->with(['patient:id,name,last_name', 'doctor:id,name,last_name', 'applicationType:id,name'])
             ->orderBy('id', 'DESC')->get();*/

        $sesiones = ApplyItem::select(
            'apply_items.id',
            'apply_items.status',
            'apply_items.created_at',
            'patients.name as patient_name',
            'patients.last_name as patient_last_name',
            'doctors.name as doctor_name',
            'doctors.last_name as doctor_last_name',
            'application_types.name as type_name',
            'apply_items.price',
            'apply_items.fecha_atencion',
            'apply_items.numero_sesion',
        )
            ->join('patients', 'patients.id', '=', 'apply_items.patient_id')
            ->join('doctors', 'doctors.id', '=', 'apply_items.doctor_id')
            ->join('application_types', 'application_types.id', '=', 'apply_items.application_type_id')
            ->where('apply_items.status', 1)
            /* ->whereBetween('apply_items.created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth(),
            ]) */
            ->orderBy('apply_items.id', 'DESC')
            ->get();

        $pacientes = Patient::where('status', 1)->orderBy('id', 'DESC')->get();
        $kines = Doctor::where('status', 1)->orderBy('id', 'DESC')->get();

        /*  dd($sesiones, $pacientes, $kines); */


        return Inertia::render('Sesiones/SesionesIndex', compact('sesiones', 'pacientes', 'kines'));
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ApplyItem  $applyItem
     * @return \Illuminate\Http\Response
     */
    public function destroy(ApplyItem $applyItem)
    {
        //
    }
}
