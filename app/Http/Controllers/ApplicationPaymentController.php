<?php

namespace App\Http\Controllers;

use App\Models\ApplicationPayment;
use App\Http\Requests\StoreApplicationPaymentRequest;
use App\Http\Requests\UpdateApplicationPaymentRequest;

class ApplicationPaymentController extends Controller
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
     * @param  \App\Http\Requests\StoreApplicationPaymentRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreApplicationPaymentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ApplicationPayment  $applicationPayment
     * @return \Illuminate\Http\Response
     */
    public function show(ApplicationPayment $applicationPayment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ApplicationPayment  $applicationPayment
     * @return \Illuminate\Http\Response
     */
    public function edit(ApplicationPayment $applicationPayment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateApplicationPaymentRequest  $request
     * @param  \App\Models\ApplicationPayment  $applicationPayment
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateApplicationPaymentRequest $request, ApplicationPayment $applicationPayment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ApplicationPayment  $applicationPayment
     * @return \Illuminate\Http\Response
     */
    public function destroy(ApplicationPayment $applicationPayment)
    {
        //
    }
}
