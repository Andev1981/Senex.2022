<?php

namespace App\Http\Controllers;

use App\Models\ClinicalNote;
use App\Http\Requests\StoreClinicalNoteRequest;
use App\Http\Requests\UpdateClinicalNoteRequest;

class ClinicalNoteController extends Controller
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
     * @param  \App\Http\Requests\StoreClinicalNoteRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreClinicalNoteRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ClinicalNote  $clinicalNote
     * @return \Illuminate\Http\Response
     */
    public function show(ClinicalNote $clinicalNote)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ClinicalNote  $clinicalNote
     * @return \Illuminate\Http\Response
     */
    public function edit(ClinicalNote $clinicalNote)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateClinicalNoteRequest  $request
     * @param  \App\Models\ClinicalNote  $clinicalNote
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateClinicalNoteRequest $request, ClinicalNote $clinicalNote)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ClinicalNote  $clinicalNote
     * @return \Illuminate\Http\Response
     */
    public function destroy(ClinicalNote $clinicalNote)
    {
        //
    }
}
