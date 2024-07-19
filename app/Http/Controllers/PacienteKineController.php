<?php

namespace App\Http\Controllers;

use App\Models\PacienteKine;
use App\Http\Requests\StorePacienteKineRequest;
use App\Http\Requests\UpdatePacienteKineRequest;

class PacienteKineController extends Controller
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
     * @param  \App\Http\Requests\StorePacienteKineRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePacienteKineRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PacienteKine  $pacienteKine
     * @return \Illuminate\Http\Response
     */
    public function show(PacienteKine $pacienteKine)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PacienteKine  $pacienteKine
     * @return \Illuminate\Http\Response
     */
    public function edit(PacienteKine $pacienteKine)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePacienteKineRequest  $request
     * @param  \App\Models\PacienteKine  $pacienteKine
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePacienteKineRequest $request, PacienteKine $pacienteKine)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PacienteKine  $pacienteKine
     * @return \Illuminate\Http\Response
     */
    public function destroy(PacienteKine $pacienteKine)
    {
        //
    }
}
