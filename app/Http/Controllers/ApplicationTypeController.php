<?php

namespace App\Http\Controllers;

use App\Models\ApplicationType;
use App\Http\Requests\StoreApplicationTypeRequest;
use App\Http\Requests\UpdateApplicationTypeRequest;

class ApplicationTypeController extends Controller
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
     * @param  \App\Http\Requests\StoreApplicationTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreApplicationTypeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ApplicationType  $applicationType
     * @return \Illuminate\Http\Response
     */
    public function show(ApplicationType $applicationType)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ApplicationType  $applicationType
     * @return \Illuminate\Http\Response
     */
    public function edit(ApplicationType $applicationType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateApplicationTypeRequest  $request
     * @param  \App\Models\ApplicationType  $applicationType
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateApplicationTypeRequest $request, ApplicationType $applicationType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ApplicationType  $applicationType
     * @return \Illuminate\Http\Response
     */
    public function destroy(ApplicationType $applicationType)
    {
        //
    }
}
