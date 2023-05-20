<?php

namespace App\Http\Controllers;

use App\Models\PaymentExpense;
use App\Http\Requests\StorePaymentExpenseRequest;
use App\Http\Requests\UpdatePaymentExpenseRequest;

class PaymentExpenseController extends Controller
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
     * @param  \App\Http\Requests\StorePaymentExpenseRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePaymentExpenseRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PaymentExpense  $paymentExpense
     * @return \Illuminate\Http\Response
     */
    public function show(PaymentExpense $paymentExpense)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PaymentExpense  $paymentExpense
     * @return \Illuminate\Http\Response
     */
    public function edit(PaymentExpense $paymentExpense)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePaymentExpenseRequest  $request
     * @param  \App\Models\PaymentExpense  $paymentExpense
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePaymentExpenseRequest $request, PaymentExpense $paymentExpense)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PaymentExpense  $paymentExpense
     * @return \Illuminate\Http\Response
     */
    public function destroy(PaymentExpense $paymentExpense)
    {
        //
    }
}
