<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\DoctorPatientAssignment;
use App\Models\Patient;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index()
    {
        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', Doctor::class)
            ->groupBy('a.addressable_id');

        $doctors = Doctor::query()->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'doctors.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')->leftJoin('addresses', function ($join) {
                $join->on('addresses.addressable_id', '=', 'doctors.id')
                    ->where('addresses.addressable_type', '=', Patient::class);
            })
            ->leftJoin('communes', 'addresses.commune_id', '=', 'communes.id')->select([
                'doctors.id',
                'doctors.name',
                'doctors.last_name',
                'doctors.email',
                'doctors.birth_date',
                'doctors.rut',
                'doctors.phone',
                'doctors.status',
                'doctors.specialty',
                'doctors.gender',
                'doctors.*',
                DB::raw("CONCAT_WS(' ', doctors.name, doctors.last_name) as full_name"),

                DB::raw('addresses.id as address_id'),
                DB::raw('addresses.street as street'),
                DB::raw('addresses.number as number'),
                DB::raw('addresses.details as details'),
                DB::raw('addresses.region_id as region_id'),
                DB::raw('addresses.province_id as province_id'),
                DB::raw('addresses.commune_id as commune_id'),

                DB::raw('communes.name as comuna_name'),

                DB::raw("CONCAT_WS(' ', addresses.street, addresses.number) as full_address"),
            ])->with('commissionRates','patientAssignments','patients','sessions','sessions.patient','sessions.sessionType')->get();

        $doctor_commission_rates = DoctorCommissionRate::all();
        $doctor_patient_assignment = DoctorPatientAssignment::all();
        $sessionTypes = SessionType::all();
        $patients = Patient::where('status','active')->get();

        $provinces = Province::all();
        $communes  = Commune::all();
        $regions   = Region::all();

        return Inertia::render('Doctors/DoctorsIndex', compact('doctors','doctor_commission_rates','doctor_patient_assignment','sessionTypes','patients',  'communes', 'provinces', 'regions'));
    }

    public function store(Request $request){
   
         $validatedData = $request->all();
        
        try{

            Doctor::create($validatedData);

            session()->flash('message', 'Kine cread@ correctamente.');
            session()->flash('type', 'success');

        }catch(\Throwable $e){
            Log::info('Error al crear kine: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al crear kine.');
            session()->flash('type', 'error');
        }
    }

    public function update(Request $request, Doctor $doctor){
        /* $valiadtedData = $request->validate([]); */
        $validatedData = $request->all();
        
        try{

            $doctor->updateOrFail($validatedData);

            session()->flash('message', 'Kine actualizad@ correctamente.');
            session()->flash('type', 'success');

        }catch(\Throwable $e){
            Log::info('Error al actualizar kine', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al actualizar kine.');
            session()->flash('type', 'error');
        }
    }

    public function updateCommissionRules(Request $request, Doctor $doctor)
    {
    

        $validated = $request->validate([
            'rules' => 'required|array',
            'rules.*.session_type_id' => 'required|exists:session_types,id',
            'rules.*.type' => 'required|in:fixed_amount,percentage',
            'rules.*.value' => 'required|numeric|min:0',
        ]);

         try {
  
        
            // Crear nuevas reglas
            foreach ($validated['rules'] as $rule) {
         

                $doctor->commissionRates()->updateOrCreate(
                [
                    'session_type_id' => $rule['session_type_id'],
                ],
                [
                    'commission_type'  => $rule['type'],
                    'commission_value' => $rule['value'],
                    'effective_from'   => now(),
                ]
            );
            }

            session()->flash('message', 'Comisión actualizada correctamente.');
            session()->flash('type', 'success');
            return back();

        } catch (\Throwable $e) {
          
              Log::info('Error al crear comisión: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al actualizar comisión.');
            session()->flash('type', 'error');

        }

    }

    public function assignPatient(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        try{
        
            // Verificar que no esté ya asignado
            if (!$doctor->patients()->where('patient_id', $validated['patient_id'])->exists()) {
                $doctor->patients()->attach($validated['patient_id']);
            }

            session()->flash('message', 'Paciente asignado correctamente');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
          
              Log::info('Error al asignar', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al asignar paciente.');
            session()->flash('type', 'error');

        }

    }

    public function unassignPatient(Doctor $doctor, Patient $patient)
    {
        try{
        $doctor->patients()->detach($patient->id);
        session()->flash('message', 'Removida asignación');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
          
              Log::info('Error al crear quitar asignación: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al quitar asignación.');
            session()->flash('type', 'error');

        }

     
    }

    public function toggleActive(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        try{

            
            $doctor->update(['is_active' => $validated['is_active']]);

            session()->flash('message', 'Kine Activad@');
            session()->flash('type', 'success');

        } catch (\Throwable $e) {
          
              Log::info('Error al activar kine: ', [
                $e->getMessage()
            ]);

            session()->flash('message', 'Error al activar.');
            session()->flash('type', 'error');

        }

    
    }
}
