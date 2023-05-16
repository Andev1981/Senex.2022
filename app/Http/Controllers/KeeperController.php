<?php

namespace App\Http\Controllers;

use App\Models\Keeper;
use App\Http\Requests\StoreKeeperRequest;
use App\Http\Requests\UpdateKeeperRequest;

class KeeperController extends Controller
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
     * @param  \App\Http\Requests\StoreKeeperRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreKeeperRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Keeper  $keeper
     * @return \Illuminate\Http\Response
     */
    public function show(Keeper $keeper)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Keeper  $keeper
     * @return \Illuminate\Http\Response
     */
    public function edit(Keeper $keeper)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateKeeperRequest  $request
     * @param  \App\Models\Keeper  $keeper
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateKeeperRequest $request, Keeper $keeper)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Keeper  $keeper
     * @return \Illuminate\Http\Response
     */
    public function destroy(Keeper $keeper)
    {
        //
    }
}
