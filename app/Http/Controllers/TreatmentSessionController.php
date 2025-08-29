<?php

namespace App\Http\Controllers;

use App\Models\TreatmentSession;
use App\Http\Requests\StoreTreatmentSessionRequest;
use App\Http\Requests\UpdateTreatmentSessionRequest;

class TreatmentSessionController extends Controller
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
    public function store(StoreTreatmentSessionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function show(TreatmentSession $treatmentSession)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function edit(TreatmentSession $treatmentSession)
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
    public function update(UpdateTreatmentSessionRequest $request, TreatmentSession $treatmentSession)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\TreatmentSession  $treatmentSession
     * @return \Illuminate\Http\Response
     */
    public function destroy(TreatmentSession $treatmentSession)
    {
        //
    }
}
