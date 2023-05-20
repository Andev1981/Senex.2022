<?php

namespace App\Http\Controllers;

use App\Models\ApplycationType;
use App\Http\Requests\StoreApplycationTypeRequest;
use App\Http\Requests\UpdateApplycationTypeRequest;

class ApplycationTypeController extends Controller
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
     * @param  \App\Http\Requests\StoreApplycationTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreApplycationTypeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ApplycationType  $applycationType
     * @return \Illuminate\Http\Response
     */
    public function show(ApplycationType $applycationType)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ApplycationType  $applycationType
     * @return \Illuminate\Http\Response
     */
    public function edit(ApplycationType $applycationType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateApplycationTypeRequest  $request
     * @param  \App\Models\ApplycationType  $applycationType
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateApplycationTypeRequest $request, ApplycationType $applycationType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ApplycationType  $applycationType
     * @return \Illuminate\Http\Response
     */
    public function destroy(ApplycationType $applycationType)
    {
        //
    }
}
