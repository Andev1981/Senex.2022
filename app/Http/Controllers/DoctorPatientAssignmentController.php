<?php

namespace App\Http\Controllers;

use App\Models\DoctorPatientAssignment;
use App\Http\Requests\StoreDoctorPatientAssignmentRequest;
use App\Http\Requests\UpdateDoctorPatientAssignmentRequest;

class DoctorPatientAssignmentController extends Controller
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
     * @param  \App\Http\Requests\StoreDoctorPatientAssignmentRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreDoctorPatientAssignmentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\DoctorPatientAssignment  $doctorPatientAssignment
     * @return \Illuminate\Http\Response
     */
    public function show(DoctorPatientAssignment $doctorPatientAssignment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\DoctorPatientAssignment  $doctorPatientAssignment
     * @return \Illuminate\Http\Response
     */
    public function edit(DoctorPatientAssignment $doctorPatientAssignment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateDoctorPatientAssignmentRequest  $request
     * @param  \App\Models\DoctorPatientAssignment  $doctorPatientAssignment
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateDoctorPatientAssignmentRequest $request, DoctorPatientAssignment $doctorPatientAssignment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\DoctorPatientAssignment  $doctorPatientAssignment
     * @return \Illuminate\Http\Response
     */
    public function destroy(DoctorPatientAssignment $doctorPatientAssignment)
    {
        //
    }
}
