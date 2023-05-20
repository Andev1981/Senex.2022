<?php

namespace App\Http\Controllers;

use App\Models\SelectOption;
use App\Http\Requests\StoreSelectOptionRequest;
use App\Http\Requests\UpdateSelectOptionRequest;

class SelectOptionController extends Controller
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
     * @param  \App\Http\Requests\StoreSelectOptionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSelectOptionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SelectOption  $selectOption
     * @return \Illuminate\Http\Response
     */
    public function show(SelectOption $selectOption)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\SelectOption  $selectOption
     * @return \Illuminate\Http\Response
     */
    public function edit(SelectOption $selectOption)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateSelectOptionRequest  $request
     * @param  \App\Models\SelectOption  $selectOption
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateSelectOptionRequest $request, SelectOption $selectOption)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SelectOption  $selectOption
     * @return \Illuminate\Http\Response
     */
    public function destroy(SelectOption $selectOption)
    {
        //
    }
}
