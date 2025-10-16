<?php

namespace App\Http\Controllers;

use App\Models\PatientConditions;
use App\Http\Requests\StorePatientConditionsRequest;
use App\Http\Requests\UpdatePatientConditionsRequest;

class PatientConditionsController extends Controller
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
     * @param  \App\Http\Requests\StorePatientConditionsRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePatientConditionsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PatientConditions  $patientConditions
     * @return \Illuminate\Http\Response
     */
    public function show(PatientConditions $patientConditions)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PatientConditions  $patientConditions
     * @return \Illuminate\Http\Response
     */
    public function edit(PatientConditions $patientConditions)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientConditionsRequest  $request
     * @param  \App\Models\PatientConditions  $patientConditions
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientConditionsRequest $request, PatientConditions $patientConditions)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PatientConditions  $patientConditions
     * @return \Illuminate\Http\Response
     */
    public function destroy(PatientConditions $patientConditions)
    {
        //
    }
}
