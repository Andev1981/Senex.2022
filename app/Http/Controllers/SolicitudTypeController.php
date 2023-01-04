<?php

namespace App\Http\Controllers;

use App\Models\SolicitudType;
use App\Http\Requests\StoreSolicitudTypeRequest;
use App\Http\Requests\UpdateSolicitudTypeRequest;

class SolicitudTypeController extends Controller
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
     * @param  \App\Http\Requests\StoreSolicitudTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSolicitudTypeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SolicitudType  $solicitudType
     * @return \Illuminate\Http\Response
     */
    public function show(SolicitudType $solicitudType)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\SolicitudType  $solicitudType
     * @return \Illuminate\Http\Response
     */
    public function edit(SolicitudType $solicitudType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateSolicitudTypeRequest  $request
     * @param  \App\Models\SolicitudType  $solicitudType
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateSolicitudTypeRequest $request, SolicitudType $solicitudType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SolicitudType  $solicitudType
     * @return \Illuminate\Http\Response
     */
    public function destroy(SolicitudType $solicitudType)
    {
        //
    }
}
