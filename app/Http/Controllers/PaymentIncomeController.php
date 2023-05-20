<?php

namespace App\Http\Controllers;

use App\Models\PaymentIncome;
use App\Http\Requests\StorePaymentIncomeRequest;
use App\Http\Requests\UpdatePaymentIncomeRequest;

class PaymentIncomeController extends Controller
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
     * @param  \App\Http\Requests\StorePaymentIncomeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePaymentIncomeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PaymentIncome  $paymentIncome
     * @return \Illuminate\Http\Response
     */
    public function show(PaymentIncome $paymentIncome)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PaymentIncome  $paymentIncome
     * @return \Illuminate\Http\Response
     */
    public function edit(PaymentIncome $paymentIncome)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePaymentIncomeRequest  $request
     * @param  \App\Models\PaymentIncome  $paymentIncome
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePaymentIncomeRequest $request, PaymentIncome $paymentIncome)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PaymentIncome  $paymentIncome
     * @return \Illuminate\Http\Response
     */
    public function destroy(PaymentIncome $paymentIncome)
    {
        //
    }
}
