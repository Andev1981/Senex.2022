<?php

namespace App\Http\Controllers;

use App\Models\PatientInsurance;
use App\Http\Requests\StorePatientInsuranceRequest;
use App\Http\Requests\UpdatePatientInsuranceRequest;

class PatientInsuranceController extends Controller
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
     * @param  \App\Http\Requests\StorePatientInsuranceRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePatientInsuranceRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PatientInsurance  $patientInsurance
     * @return \Illuminate\Http\Response
     */
    public function show(PatientInsurance $patientInsurance)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PatientInsurance  $patientInsurance
     * @return \Illuminate\Http\Response
     */
    public function edit(PatientInsurance $patientInsurance)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientInsuranceRequest  $request
     * @param  \App\Models\PatientInsurance  $patientInsurance
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientInsuranceRequest $request, PatientInsurance $patientInsurance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PatientInsurance  $patientInsurance
     * @return \Illuminate\Http\Response
     */
    public function destroy(PatientInsurance $patientInsurance)
    {
        //
    }
}
