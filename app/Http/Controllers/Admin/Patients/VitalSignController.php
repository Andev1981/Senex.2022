<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVitalRequest;
use App\Http\Requests\UpdateVitalRequest;
use App\Models\Vital;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VitalSignController extends Controller
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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreVitalRequest $request)
    {
        $validatedData = $request->validated();

        DB::beginTransaction();
         try {

            Vital::create($validatedData);
            

            DB::commit();
            session()->flash('message', 'Datos guardados correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudieron guardar los datos.');
            session()->flash('type', 'error');
        }

        return back();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Vital $vital)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Vital $vital)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateVitalRequest $request, Vital $vital)
    {
         $validatedData = $request->validated();

       
     
        DB::beginTransaction();
         try {

            $today = now()->toDateString();

        $existing = Vital::where('patient_id', $validatedData['patient_id'])
            ->whereDate('created_at', $today)
            ->first();

        if ($existing) {
            $existing->fill($validatedData)->save();
        } else {
            Vital::create($validatedData);
        }
            
            DB::commit();
            session()->flash('message', 'Datos actualizados correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudieron guardar los datos.');
            session()->flash('type', 'error');
        }

        return back();

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Vital $vital)
    {
        //
    }
}
