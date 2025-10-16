<?php

namespace App\Http\Controllers;

use App\Models\PatientLifestyle;
use App\Http\Requests\StorePatientLifestyleRequest;
use App\Http\Requests\UpdatePatientLifestyleRequest;

class PatientLifestyleController extends Controller
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
     * @param  \App\Http\Requests\StorePatientLifestyleRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePatientLifestyleRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PatientLifestyle  $patientLifestyle
     * @return \Illuminate\Http\Response
     */
    public function show(PatientLifestyle $patientLifestyle)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PatientLifestyle  $patientLifestyle
     * @return \Illuminate\Http\Response
     */
    public function edit(PatientLifestyle $patientLifestyle)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientLifestyleRequest  $request
     * @param  \App\Models\PatientLifestyle  $patientLifestyle
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientLifestyleRequest $request, PatientLifestyle $patientLifestyle)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PatientLifestyle  $patientLifestyle
     * @return \Illuminate\Http\Response
     */
    public function destroy(PatientLifestyle $patientLifestyle)
    {
        //
    }
}
