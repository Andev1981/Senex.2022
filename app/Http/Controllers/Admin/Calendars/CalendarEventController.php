<?php

namespace App\Http\Controllers\Admin\Calendars;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Http\Requests\StoreCalendarEventRequest;
use App\Http\Requests\UpdateCalendarEventRequest;

class CalendarEventController extends Controller
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
     * @param  \App\Http\Requests\StoreCalendarEventRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreCalendarEventRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CalendarEvent  $calendarEvent
     * @return \Illuminate\Http\Response
     */
    public function show(CalendarEvent $calendarEvent)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\CalendarEvent  $calendarEvent
     * @return \Illuminate\Http\Response
     */
    public function edit(CalendarEvent $calendarEvent)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCalendarEventRequest  $request
     * @param  \App\Models\CalendarEvent  $calendarEvent
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCalendarEventRequest $request, CalendarEvent $calendarEvent)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CalendarEvent  $calendarEvent
     * @return \Illuminate\Http\Response
     */
    public function destroy(CalendarEvent $calendarEvent)
    {
        //
    }
}
