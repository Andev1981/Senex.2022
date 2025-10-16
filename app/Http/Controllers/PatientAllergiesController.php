<?php

namespace App\Http\Controllers;

use App\Models\PatientAllergies;
use App\Http\Requests\StorePatientAllergiesRequest;
use App\Http\Requests\UpdatePatientAllergiesRequest;

class PatientAllergiesController extends Controller
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
     * @param  \App\Http\Requests\StorePatientAllergiesRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePatientAllergiesRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PatientAllergies  $patientAllergies
     * @return \Illuminate\Http\Response
     */
    public function show(PatientAllergies $patientAllergies)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PatientAllergies  $patientAllergies
     * @return \Illuminate\Http\Response
     */
    public function edit(PatientAllergies $patientAllergies)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientAllergiesRequest  $request
     * @param  \App\Models\PatientAllergies  $patientAllergies
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientAllergiesRequest $request, PatientAllergies $patientAllergies)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PatientAllergies  $patientAllergies
     * @return \Illuminate\Http\Response
     */
    public function destroy(PatientAllergies $patientAllergies)
    {
        //
    }
}
