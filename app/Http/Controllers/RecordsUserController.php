<?php

namespace App\Http\Controllers;

use App\Models\RecordsUser;
use App\Http\Requests\StoreRecordsUserRequest;
use App\Http\Requests\UpdateRecordsUserRequest;

class RecordsUserController extends Controller
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
     * @param  \App\Http\Requests\StoreRecordsUserRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRecordsUserRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\RecordsUser  $recordsUser
     * @return \Illuminate\Http\Response
     */
    public function show(RecordsUser $recordsUser)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\RecordsUser  $recordsUser
     * @return \Illuminate\Http\Response
     */
    public function edit(RecordsUser $recordsUser)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateRecordsUserRequest  $request
     * @param  \App\Models\RecordsUser  $recordsUser
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRecordsUserRequest $request, RecordsUser $recordsUser)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\RecordsUser  $recordsUser
     * @return \Illuminate\Http\Response
     */
    public function destroy(RecordsUser $recordsUser)
    {
        //
    }
}
