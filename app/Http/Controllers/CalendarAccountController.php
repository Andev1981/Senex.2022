<?php

namespace App\Http\Controllers;

use App\Models\CalendarAccount;
use App\Http\Requests\StoreCalendarAccountRequest;
use App\Http\Requests\UpdateCalendarAccountRequest;

class CalendarAccountController extends Controller
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
     * @param  \App\Http\Requests\StoreCalendarAccountRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreCalendarAccountRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CalendarAccount  $calendarAccount
     * @return \Illuminate\Http\Response
     */
    public function show(CalendarAccount $calendarAccount)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\CalendarAccount  $calendarAccount
     * @return \Illuminate\Http\Response
     */
    public function edit(CalendarAccount $calendarAccount)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCalendarAccountRequest  $request
     * @param  \App\Models\CalendarAccount  $calendarAccount
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCalendarAccountRequest $request, CalendarAccount $calendarAccount)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CalendarAccount  $calendarAccount
     * @return \Illuminate\Http\Response
     */
    public function destroy(CalendarAccount $calendarAccount)
    {
        //
    }
}
