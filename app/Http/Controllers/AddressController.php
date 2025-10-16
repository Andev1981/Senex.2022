<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Models\Region;
use App\Models\Province;
use App\Models\Commune;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
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
     * @param  \App\Http\Requests\StoreAddressRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreAddressRequest $request, Patient $patient)
    {

        $validatedData = $request->validated();

        DB::beginTransaction();
        try {

            $patient->address()->updateOrCreate([], $validatedData);

            /* $patient = DB::transaction(function () use ($validated) {
            return Patient::create($validated);
            
        }, 3);  */


            DB::commit();
            session()->flash('message', 'Dirección guardada correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudo guardar la dirección.');
            session()->flash('type', 'error');
        }

        return back();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\Response
     */
    public function show(Address $address)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\Response
     */
    public function edit(Address $address)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateAddressRequest  $request
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateAddressRequest $request, Patient $patient)
    {
        $validatedData = $request->validated();

        unset($validatedData['addressable_id'], $validatedData['addressable_type']);

        DB::beginTransaction();
        try {

            $patient->address()->updateOrCreate([], $validatedData);

            DB::commit();
            session()->flash('message', 'Dirección guardada correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudo guardar la dirección.');
            session()->flash('type', 'error');
        }

        return back();
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\Response
     */
    public function destroy(Address $address)
    {
        //
    }
}
