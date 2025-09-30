<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Models\Treatment;
use Illuminate\Support\Facades\DB;

class TreatmentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
     * @param  \App\Http\Requests\StoreTreatmentSessionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreTreatmentRequest $request)
    {

        $validated = $request->validated();

        try {
            DB::transaction(function () use (&$validated) {
                $isActive = ($validated['status'] === 'active');

                if ($isActive) {
                    // Desactivar anteriores activos del mismo paciente, con lock
                    $prevActives = Treatment::where('patient_id', $validated['patient_id'])
                        ->where('status', 'active')
                        ->lockForUpdate()
                        ->get();

                    foreach ($prevActives as $t) {
                        $t->update([
                            'status'   => 'inactive',
                        ]);
                    }
                }

                Treatment::create($validated);

                session()->flash('message', 'Tratamiento creado correctamente.');
                session()->flash('type', 'success');
            }, 3);

            return back();
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            session()->flash('message', 'Error al crear el Tratamiento.');
            session()->flash('type', 'error');


            return back();
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function show(Treatment $treatmentSession)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function edit(Treatment $treatmentSession)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateTreatmentSessionRequest  $request
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateTreatmentRequest $request, Treatment $treatmentSession)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function destroy(Treatment $treatmentSession)
    {
        //
    }
}
