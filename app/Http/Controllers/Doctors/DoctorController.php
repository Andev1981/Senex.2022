<?php

namespace App\Http\Controllers\Doctors;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Commune;
use App\Models\Doctor;
use App\Models\DoctorCommissionRate;
use App\Models\DoctorPatientAssignment;
use App\Models\Patient;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', Doctor::class)
            ->groupBy('a.addressable_id');

        $doctors = Doctor::query()
            // 🎯 1. FILTRO DE EMPRESA: Unimos con la pivot para filtrar por la clínica activa
            ->join('company_doctor', 'doctors.id', '=', 'company_doctor.doctor_id')
            ->where('company_doctor.company_id', $currentCompanyId)
            // 2. Filtro Opcional: Sucursal Activa
            // Filtramos a través de la relación del usuario asociado al doctor
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->whereHas('user.branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })
            ->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'doctors.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')->leftJoin('addresses', function ($join) {
                $join->on('addresses.addressable_id', '=', 'doctors.id')
                    ->where('addresses.addressable_type', '=', Doctor::class);
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
                'doctors.speciality',
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

    public function store(StoreDoctorRequest $request){
   
        $validated = $request->validated();
        
        DB::beginTransaction();

        try{
            
            // CREAR USUARIO
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['rut']),
                'email_verified_at' => now(), // Auto-verificado
            ]);

            $user->assignRole('kine');

            // Separar datos del paciente y la dirección
            $doctorData = Arr::except($validated, [
                'street', 'number', 'details', 'region_id', 'province_id', 'commune_id'
            ]);

            $addressData = Arr::only($validated, [
                'street', 'number', 'details', 'region_id', 'province_id', 'commune_id'
            ]);

            $doctorData['user_id'] = $user->id;

            $doctor = Doctor::create($doctorData);

             // Crear dirección asociada polimórficamente
            $doctor->addresses()->create([
                'type' => 'home',
                'is_primary' => true,
                'country' => 'Chile',
                ...$addressData
            ]);

            // ENVIAR EMAIL CON CREDENCIALES
            try {
                Mail::to($user->email)->send(
                    new \App\Mail\WelcomeKineEmail($user, temporalPassword :$validated['rut'])
                );
            } catch (\Exception $e) {
                Log::warning('Error enviando email de bienvenida', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                // No fallar la creación si falla el email
            }

            /* Log::info('Datos al crear kine: ', [
                $doctor, $user
            ]); */
            
            DB::commit();

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

    public function update(UpdateDoctorRequest $request, Doctor $doctor){

        $validated = $request->validated();
        
        DB::beginTransaction();

         try {

            // -------------------------------
            // 1. Separar datos
            // -------------------------------
            $doctorData = Arr::except($validated, [
                'street', 'number', 'details',
                'region_id', 'province_id', 'commune_id',
                'status_reason'
            ]);

            $addressData = Arr::only($validated, [
                'street', 'number', 'details',
                'region_id', 'province_id', 'commune_id'
            ]);

            if(!$doctor->user->hasRole('kine')){
                // Evitar cambiar email de kinesiologo
                $doctor->user->assignRole('kine');

            }

            // -------------------------------
            // 2. Lógica de CAMBIO DE STATUS
            // -------------------------------
            if (array_key_exists('status', $doctorData)) {

                $newStatus = $validated['status'];
                $oldStatus = $doctor->status;

                // ¿El estado realmente cambió?
                if ($newStatus !== $oldStatus) {

                    // Registrar fecha de cambio
                    $doctorData['status_changed_at'] = now();

                    // Si el nuevo estado NO es "active" → status_reason obligatorio
                    if ($newStatus !== 'active') {

                        if (empty($validated['status_reason'])) {
                            throw new \Exception("Debe ingresar un motivo cuando el estado no es activo.");
                        }

                        $doctorData['status_reason'] = $validated['status_reason'];
                    }

                    // Si el estado cambió a active: limpiar el motivo
                    if ($newStatus === 'active') {
                        $doctorData['status_reason'] = null;
                    }

                } else {
                    // No hubo cambio → evitar sobrescribir status
                    unset($doctorData['status']);
                }
            }

            // -------------------------------
            // 3. Actualizar doctor
            // -------------------------------
            $doctor->update($doctorData);

            // -------------------------------
            // 4. Actualizar / crear dirección
            // -------------------------------
            $address = $doctor->addresses()->first();

            if ($address) {
                $address->update($addressData);
            } elseif (!empty($addressData)) {
                $doctor->addresses()->create([
                    'type' => 'home',
                    'is_primary' => true,
                    'country' => 'Chile',
                    ...$addressData
                ]);
            }

            DB::commit();

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
