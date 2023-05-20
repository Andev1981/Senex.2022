<?php

namespace App\Http\Controllers;

use App\Models\PaymentIncomeReference;
use App\Http\Requests\StorePaymentIncomeReferenceRequest;
use App\Http\Requests\UpdatePaymentIncomeReferenceRequest;

class PaymentIncomeReferenceController extends Controller
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
     * @param  \App\Http\Requests\StorePaymentIncomeReferenceRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePaymentIncomeReferenceRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PaymentIncomeReference  $paymentIncomeReference
     * @return \Illuminate\Http\Response
     */
    public function show(PaymentIncomeReference $paymentIncomeReference)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PaymentIncomeReference  $paymentIncomeReference
     * @return \Illuminate\Http\Response
     */
    public function edit(PaymentIncomeReference $paymentIncomeReference)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePaymentIncomeReferenceRequest  $request
     * @param  \App\Models\PaymentIncomeReference  $paymentIncomeReference
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePaymentIncomeReferenceRequest $request, PaymentIncomeReference $paymentIncomeReference)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PaymentIncomeReference  $paymentIncomeReference
     * @return \Illuminate\Http\Response
     */
    public function destroy(PaymentIncomeReference $paymentIncomeReference)
    {
        //
    }
}
