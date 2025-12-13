<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AgreementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patientsInsurances = PatientInsurance::with('insurance','patient','plan')->get();
        $patients = Patient::where('status','active')->get();
        $plans = Plan::with('insurance')->where('is_active',true)->get();


        return Inertia::render('PatientInsurances/Index',[
            'patientsInsurances' => $patientsInsurances, 
            'patients' => $patients, 
            'plans' => $plans, 
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->all();
        
        try {
            DB::beginTransaction();

            $patientPlan = PatientInsurance::create([
                "patient_id" => $validated['patient_id'],
                "insurance_id" => $validated['insurance_id'],
                "plan_id" => $validated['plan_id'],
                "member_id" => $validated['member_id'],
                "start_date" => $validated['start_date'],
                "end_date" => $validated['end_date'],
                "status" => $validated['status'],
                "is_primary" => $validated['is_primary'],
                "notes" => $validated['notes'],
            ]);

          

            if (!$patientPlan) {
                DB::rollBack();
                session()->flash('message', "⚠️ No se ha posido crear la asignación");
                session()->flash('type', 'error');
                return back();
                
            }else{
                DB::commit();
                session()->flash('message',  "Se Ha Agregado la asignación");
                session()->flash('type', 'success');
                
                return back();
            }


        } catch (\Throwable $th) {
            //throw $th;
                DB::rollBack();
                session()->flash('message', "⚠️ No se ha posido crear la asignación!!");
                session()->flash('type', 'error');
                return back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
