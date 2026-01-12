<?php

namespace App\Http\Controllers\Admin\MedicalHistorials;

use App\Http\Controllers\Controller;
use App\Models\MedicalHistory;
use App\Http\Requests\StoreMedicalHistoryRequest;
use App\Http\Requests\UpdateMedicalHistoryRequest;

class MedicalHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicalHistoryRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(MedicalHistory $medicalHistory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MedicalHistory $medicalHistory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicalHistoryRequest $request, MedicalHistory $medicalHistory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MedicalHistory $medicalHistory)
    {
        //
    }
}
