<?php

namespace App\Http\Controllers;

use App\Models\AgendaSlot;
use App\Http\Requests\StoreAgendaSlotRequest;
use App\Http\Requests\UpdateAgendaSlotRequest;

class AgendaSlotController extends Controller
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
     * @param  \App\Http\Requests\StoreAgendaSlotRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreAgendaSlotRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\AgendaSlot  $agendaSlot
     * @return \Illuminate\Http\Response
     */
    public function show(AgendaSlot $agendaSlot)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\AgendaSlot  $agendaSlot
     * @return \Illuminate\Http\Response
     */
    public function edit(AgendaSlot $agendaSlot)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateAgendaSlotRequest  $request
     * @param  \App\Models\AgendaSlot  $agendaSlot
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateAgendaSlotRequest $request, AgendaSlot $agendaSlot)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\AgendaSlot  $agendaSlot
     * @return \Illuminate\Http\Response
     */
    public function destroy(AgendaSlot $agendaSlot)
    {
        //
    }
}
