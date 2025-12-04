<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Commune;
use App\Models\Debt;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PatientAdminController extends Controller
{
    public function index()
    {

        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Patient')
            ->groupBy('a.addressable_id');

        $patients = Patient::query()->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes as c', 'addr.commune_id', '=', 'c.id')
            ->select([
                'patients.id',
                'patients.name',
                'patients.last_name',
                'patients.email',
                'patients.birth_date',
                'patients.rut',
                'patients.phone',
                'patients.status',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),

                DB::raw('addr.id as address_id'),
                DB::raw('addr.street as street'),
                DB::raw('addr.number as number'),
                DB::raw('addr.details as details'),
                DB::raw('addr.region_id as region_id'),
                DB::raw('addr.province_id as province_id'),
                DB::raw('addr.commune_id as commune_id'),
                DB::raw("CONCAT_WS(' ', addr.street, addr.number) as full_address"),
                DB::raw('c.name as comuna_name'),

                DB::raw("(
                    SELECT CONCAT_WS(' ', d.name, d.last_name)
                    FROM attendances a
                    JOIN doctors d ON d.id = a.doctor_id
                    WHERE a.patient_id = patients.id
                    ORDER BY a.attended_at DESC
                    LIMIT 1
                ) AS last_doctor_name"),
            ])
            ->withExists([
                'debts as has_due' => fn($q) =>
                $q->whereIn('debts.status', [Debt::STATUS_PENDING, Debt::STATUS_PARTIAL, Debt::STATUS_OVERDUE])
            ])
            ->withExists([
                'debts as has_overdue' => fn($q) =>
                $q->where('debts.status', Debt::STATUS_OVERDUE)
            ])
            ->addSelect([
                'due_amount' => function ($q) {
                    $q->from('debts as d')
                        ->join('treatment_sessions as ts', 'ts.id', '=', 'd.treatment_session_id')
                        ->whereColumn('ts.patient_id', 'patients.id')
                        ->whereIn('d.status', ['pending', 'partial', 'overdue'])
                        ->selectRaw("COALESCE(SUM(GREATEST(0, d.original_amount - d.paid_amount)), 0)");
                },
            ])
            ->get()
            ->map(function ($p) {
                $p->payment_status = $p->has_overdue ? 'overdue' : ($p->has_due ? 'due' : 'ok');
                return $p;
            });



        $provinces = Province::all();
        $communes  = Commune::all();
        $regions   = Region::all();

        return Inertia::render('Patients/IndexPatients', compact('patients', 'communes', 'provinces', 'regions'));
    }

      /**
     * INDEX - GET /patients/{patient}/treatments
     * Retorna vista Inertia para mostrar lista de tratamientos
     */
    public function show(Patient $patient)
    {
        $treatments = Treatment::where('patient_id', $patient->id)
            ->with(['sessionType', 'doctor', 'sessions', 'sessions.doctor'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sessions = TreatmentSession::where('patient_id', $patient->id)
            ->with(['doctor', 'treatment','debt'])
            ->orderBy('date', 'desc')
            ->get();

        $payments = Payment::where('patient_id', $patient->id)->where('status','completed')
        ->orderBy('created_at', 'desc')
            ->get();

        $patient->load([
            'address.region',
            'address.province',
            'address.commune',
            'latestVital',
        ]);

        $address = $patient->address;

        $contact = $patient->primaryContact;
       
        $allergies = $patient->allergies;

        $conditions = $patient->condition;

        $vital = $patient->latestVital;
        
        $session_types = SessionType::all();
        
        $provinces = Province::all();
        $communes  = Commune::all();
        $regions   = Region::all();
        $doctors   = Doctor::all();


        return Inertia::render('Patients/DetailPatient', [
            'patient' => $patient,
            'treatments' => $treatments,
            'sessions' => $sessions,
            'payments' => $payments,
            'provinces' => $provinces,
            'communes' => $communes,
            'regions' => $regions,
            'address' => $address,
            'vital' => $vital,
            'doctors' => $doctors,
            'session_types' => $session_types,
            'contact' => $contact,
            'allergies' => $allergies,
            'conditions' => $conditions,
        ]);
    }


    public function store(StorePatientRequest $request)
    {
        // Validación
        $validated = $request->validated();

        DB::beginTransaction();

        try {

            // Separar datos del paciente y la dirección
            $patientData = Arr::except($validated, [
                'street', 'number', 'details', 'region_id', 'province_id', 'commune_id'
            ]);

            $addressData = Arr::only($validated, [
                'street', 'number', 'details', 'region_id', 'province_id', 'commune_id'
            ]);

            // Crear paciente
            $patient = Patient::create($patientData);

            // Crear dirección asociada polimórficamente
            $patient->addresses()->create([
                'type' => 'home',
                'is_primary' => true,
                'country' => 'Chile',
                ...$addressData
            ]);

            DB::commit();

            session()->flash('message', 'Paciente creado correctamente.');
            session()->flash('type', 'success');
            return back();

        } catch (\Throwable $e) {

            DB::rollBack();
            report($e);

            session()->flash('message', 'Error al crear el paciente.');
            session()->flash('type', 'error');
            return back();
        }
    }


    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {

            // -------------------------------
            // 1. Separar datos
            // -------------------------------
            $patientData = Arr::except($validated, [
                'street', 'number', 'details',
                'region_id', 'province_id', 'commune_id',
                'status_reason'
            ]);

            $addressData = Arr::only($validated, [
                'street', 'number', 'details',
                'region_id', 'province_id', 'commune_id'
            ]);

            // -------------------------------
            // 2. Lógica de CAMBIO DE STATUS
            // -------------------------------
            if (array_key_exists('status', $patientData)) {

                $newStatus = $validated['status'];
                $oldStatus = $patient->status;

                // ¿El estado realmente cambió?
                if ($newStatus !== $oldStatus) {

                    // Registrar fecha de cambio
                    $patientData['status_changed_at'] = now();

                    // Si el nuevo estado NO es "active" → status_reason obligatorio
                    if ($newStatus !== 'active') {

                        if (empty($validated['status_reason'])) {
                            throw new \Exception("Debe ingresar un motivo cuando el estado no es activo.");
                        }

                        $patientData['status_reason'] = $validated['status_reason'];
                    }

                    // Si el estado cambió a active: limpiar el motivo
                    if ($newStatus === 'active') {
                        $patientData['status_reason'] = null;
                    }

                } else {
                    // No hubo cambio → evitar sobrescribir status
                    unset($patientData['status']);
                }
            }

            

            // -------------------------------
            // 3. Actualizar paciente
            // -------------------------------
            $patient->update($patientData);

            // -------------------------------
            // 4. Actualizar / crear dirección
            // -------------------------------
            $address = $patient->addresses()->first();

            if ($address) {
                $address->update($addressData);
            } elseif (!empty($addressData)) {
                $patient->addresses()->create([
                    'type' => 'home',
                    'is_primary' => true,
                    'country' => 'Chile',
                    ...$addressData
                ]);
            }

            DB::commit();

            session()->flash('message', 'Paciente actualizado correctamente.');
            session()->flash('type', 'success');
            return back();

        } catch (\Throwable $e) {

            DB::rollBack();
            report($e);

            session()->flash('message', 'Error al actualizar el paciente.');
            session()->flash('type', 'error');
            return back();
        }
    }

    public function destroy(Patient $patient)
    {
        $patient->update(['status' => "suspended"]);
        return back();
    }

    public function showOld(Patient $patient)
    {

        $patientId = $patient->id; // evita sombrear la variable

        $patient = Patient::query()
            ->with([
                'latestVital',
                'allergies',
                'condition',
                'contacts',
                'insurance',
                'lifestyle',
                'plans',
                'address:id,addressable_id,addressable_type,commune_id,province_id,region_id,street,number,details',
                'address.commune:id,name,province_id',
                'address.province:id,name,region_id',
                'address.region:id,name',
                 'treatments' => fn($q) =>
                    $q->orderByRaw("CASE WHEN status = 'Activo' THEN 0 ELSE 1 END")
                        ->latest('id'),
                'treatments.sessions',
                'treatments.session_type',
                'treatments.doctor'
            ])
            ->withExists([
                'debts as has_due' => fn($q) => $q->whereIn('status', [
                    Debt::STATUS_PENDING,
                    Debt::STATUS_PARTIAL,
                    Debt::STATUS_OVERDUE
                ]),
                'debts as has_overdue' => fn($q) => $q->where('status', Debt::STATUS_OVERDUE),
            ])
            ->select([
                'patients.*',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) AS full_name"),
            ])
            ->selectSub(function ($q) {
                $q->from('debts as d')
                    ->join('treatment_sessions as ts', 'ts.id', '=', 'd.treatment_session_id')
                    ->whereColumn('ts.patient_id', 'patients.id')
                    ->whereIn('d.status', ['pending', 'partial', 'overdue'])
                    ->selectRaw("COALESCE(SUM(GREATEST(0, d.original_amount - d.paid_amount)), 0)");
            }, 'due_amount')
            ->findOrFail($patientId);

            dd($patient);

          
        if (!$patient) {
            session()->flash('message', 'Paciente no encontrado.');
            session()->flash('type', 'error');

            return back();
        }

        // ---- Tratamientos del paciente ----
        $treatments = Treatment::where('patient_id', $patient->id)
            ->with('session_type','doctor','sessions')
            ->orderByDesc('id')
            ->get();

        // Busca 'Activo' (coincide con enum de tu migración). Si no hay, toma el último tratamiento.
        $treatment = $treatments->firstWhere('status', 'Activo') ?? $treatments->first();

        // ---- Sesiones: si hay tratamiento, tráelas; si no, vacío sin romper front ----
        if ($treatment) {
            $sessions = DB::table('treatment_sessions as ai')
                ->leftJoin('patients as p', 'p.id', '=', 'ai.patient_id')
                ->leftJoin('doctors as d', 'd.id', '=', 'ai.doctor_id')
                ->leftJoin('session_types as st', 'st.id', '=', 'ai.session_type_id')
                ->where('p.id', $patient->id)
                ->where('ai.treatment_id', $treatment->id)
                // tu schema usa `date` (DATE) en treatment_sessions
                ->whereYear('ai.date', now()->year)
                ->orderBy('p.name', 'asc')
                // orden más reciente arriba: por fecha y quizá por time si te sirve
                ->orderByDesc('ai.date')
                ->select([
                    'ai.*',
                ])
                ->selectRaw('(COALESCE(ai.patient_amount,0) - COALESCE(ai.doctor_amount,0)) as total_senex')
                ->get();
        } else {
            $sessions = collect(); // arreglo vacío coherente con Inertia
        }

        $payments = Payment::where('patient_id', $patient->id)->get();

        // ---- Catálogos auxiliares ----
        $session_types = SessionType::orderBy('name')->get();
        $provinces     = Province::all();
        $communes      = Commune::all();
        $regions       = Region::all();
        $doctors       = Doctor::all();



        return Inertia::render('Patients/DetailPatient', compact(
            'treatment',
            'patient',
            'payments',
            'sessions',
            'communes',
            'regions',
            'provinces',
            'session_types',
            'doctors',
        ));
    }

}
