<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Commune;
use App\Models\Debt;
use App\Models\Diagnostic;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientContact;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Notifications\PatientTutorWelcomeNotification;
use App\Notifications\PatientWelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class PatientAdminController extends Controller
{
    public function index()
    {
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');

        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Patient')
            ->groupBy('a.addressable_id');

        $patients = Patient::query()->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes as c', 'addr.commune_id', '=', 'c.id')
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                // 🎯 Ahora simplemente preguntamos: 
                // "¿Está este paciente vinculado a esta sucursal en la tabla pivot?"
                $query->whereHas('branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })
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



        $provinces = Province::all(['id', 'name', 'region_id']);
        $communes  = Commune::all(['id', 'name', 'province_id']);
        $regions   = Region::all(['id', 'name']);



        return Inertia::render('Patients/IndexPatients', compact('patients', 'communes', 'provinces', 'regions'));
    }

    /**
     * INDEX - GET /patients/{patient}/treatments
     * Retorna vista Inertia para mostrar lista de tratamientos
     */
    public function show(Patient $patient)
    {
        $activeBranchId = session('active_branch_id');
        $companyId = session('current_company_id');

        // 1. Tratamientos y Sesiones (Esto está bien para el historial de abajo)
        $treatments = Treatment::query()
            ->where('patient_id', $patient->id)
            ->where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->with([
                'sessionType',
                'doctor',
                'diagnostic', // Aquí ya lo tenías bien
                'sessions' => fn($q) => $q->orderBy('date', 'asc')->orderBy('time', 'asc'),
                'sessions.doctor',
                'sessions.debt'
            ])
            ->latest()
            ->get();

        $sessions = $treatments->flatMap->sessions;

        // 2. Pagos (Sin cambios)
        $payments = Payment::where('patient_id', $patient->id)
            ->where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->where('status', 'completed')
            ->latest()
            ->get();

        // 3. Carga de datos del paciente
        $patient->load([
            'address.region',
            'address.province',
            'address.commune',
            'latestVital',
            'primaryContact',
            'allergies',
            'condition',
            'debts',
            'attachments.treatment', // Cargar archivos clínicos renombrado
            'invoices.currentDte', // Cargar DTEs
            // Cargamos treatments CON diagnostic
            'treatments' => function ($query) use ($companyId, $activeBranchId) {
                $query->where('company_id', $companyId)     // Seguridad: solo de esta empresa
                    ->where('branch_id', $activeBranchId) // Seguridad: solo de esta sucursal
                    ->whereIn('status', ['active', 'in_progress', 'evaluation']) // Incluimos evaluación
                    ->with(['diagnostic', 'doctor', 'sessionType']) // Cargamos relaciones necesarias
                    ->latest();
            }
        ]);


        // 4. CREAR EL ALIAS 'active_treatments' PARA EL FRONTEND 🚀
        // Como el frontend espera "active_treatments", simplemente le asignamos
        // la colección de tratamientos que acabamos de cargar en el paso 3.
        $patient->setRelation('active_treatments', $patient->treatments);
        /* dd($patient->active_treatments[0]->diagnostic); */

        // 5. Listas para formularios (Sin cambios)
        $doctors = Doctor::whereHas('branches', function ($q) use ($activeBranchId) {
            $q->where('branches.id', $activeBranchId);
        })->select('id', 'name', 'last_name', 'phone', 'email')->get();

        $session_types = SessionType::where('company_id', $companyId)->get();

        // OJO: Asegúrate de importar Diagnostic arriba
        $diagnostics = Diagnostic::orderBy('description', 'asc')->where('is_active', true)->get(['code', 'description', 'version']);

        return Inertia::render('Patients/DetailPatient', [
            'patient'     => $patient,
            'treatments'  => $treatments,
            'sessions'    => $sessions,
            'payments'    => $payments,
            'address'     => $patient->address,
            'vital'       => $patient->latestVital,
            'contact'     => $patient->primaryContact,
            'allergies'   => $patient->allergies,
            'conditions'  => $patient->condition,
            'doctors'     => $doctors,
            'session_types' => $session_types,
            'diagnostics' => $diagnostics, // Pasamos la lista completa para el select
            'regions'     => Region::all(['id', 'name']),
            'provinces'   => Province::all(['id', 'name', 'region_id']),
            'communes'    => Commune::all(['id', 'name', 'province_id']),
        ]);
    }


    public function store(StorePatientRequest $request)
    {
        $activeBranchId = session('active_branch_id');
        $companyId = session('current_company_id');

        if (!$companyId) {
            // Fallback de seguridad: si la sesión falló, intentamos el del usuario
            $companyId = auth()->user()->company_id;
        }

        DB::beginTransaction();

        try {

            $exists = Patient::where('rut', $request->rut)->exists();

            // 3. Si no existe, creamos
            $patient = Patient::updateOrCreate(
                ['rut' => $request->rut, 'company_id' => $companyId],
                [
                    'name' => $request->name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'ocupation' => $request->occupation,
                    'marital_status' => $request->marital_status,
                    'status' => $request->status,
                    'phone' => $request->phone,
                    'opt_out_reminders' => $request->opt_out_reminders,
                    'prefers_whatsapp' => $request->prefers_whatsapp,
                    'prefers_mail' => $request->prefers_mail,
                    'prefers_sms' => $request->prefers_sms,
                    'require_tutor' => $request->require_tutor,
                ]
            );

            if ($request->require_tutor) {
                $contact = PatientContact::updateOrCreate(
                    [
                        'patient_id' => $patient->id,
                        'type' => 'guardian' // Identificador de tipo
                    ],
                    [
                        'name' => $request->guardian_name,
                        'relationship' => $request->guardian_relationship,
                        'phone' => $request->guardian_phone,
                        'rut' => $request->guardian_rut,
                        'email' => $request->guardian_email,
                        'is_primary' => true, // Marcamos como el responsable de cobro
                    ]
                );
            }


            // syncWithoutDetaching añade el vínculo si no existe, sin borrar otros sedes
            $patient->branches()->syncWithoutDetaching([$activeBranchId]);

            // Si NO existía, es un paciente nuevo -> Bienvenida

            DB::commit();

            if (!$exists) {
                if ($request->require_tutor) {
                    // Notificamos al tutor
                    $contact->notify(new PatientTutorWelcomeNotification($patient, $contact));
                } else {
                    // Notificamos al paciente directamente
                    $patient->notify(new PatientWelcomeNotification($patient));
                }
            }

            $patient->refresh();

            // 3. Opcional: Si necesitas devolver nombres de comunas o relaciones
            $patient->load([
                'address.region',
                'address.province',
                'address.commune',
                'latestVital',
                'primaryContact',
                'allergies',
                'condition',
                'treatments' => function ($query) {
                    $query->latest();
                }
            ]);

            return response()->json([
                'message' => 'Paciente guardado correctamente',
                'patient' => $patient // Enviamos el ID para que React sepa a dónde redirigir
            ], 201);
        } catch (\Throwable $e) {

            DB::rollBack();
            report($e);
        }
    }

    public function quickStore(Request $request)
    {
        $activeBranchId = session('active_branch_id');
        $companyId = session('current_company_id');

        $validated = $request->validate([
            'rut'        => 'required|string|unique:patients,rut',
            'name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:patients,email',
            'phone'      => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $patient = Patient::create([
                'company_id' => $companyId,
                'rut'        => $validated['rut'],
                'name' => $validated['name'],
                'last_name'  => $validated['last_name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'],
                'status'     => 'active',
            ]);

            // Asociamos a la sucursal actual
            $patient->branches()->attach($activeBranchId);

            // O si es una tabla directa: PatientBranch::create(['patient_id' => $patient->id, 'branch_id' => $validated['branch_id']]);

            DB::commit();

            return response()->json($patient);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el paciente'], 500);
        }
    }


    public function document_post(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'title' => 'required|string|max:255',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $patient = Patient::findOrFail($request->patient_id);
        $this->authorize('view', $patient); // Usamos view para verificar acceso al paciente

        $file = $request->file('file');
        $path = $file->store('attachments/' . $patient->id, 'public');

        $attachment = \App\Models\Attachment::create([
            'company_id' => session('current_company_id'),
            'patient_id' => $patient->id,
            'treatment_id' => $request->treatment_id,
            'title' => $request->title,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'storage_path' => $path,
        ]);

        return back()->with('success', 'Documento clínico cargado correctamente.');
    }

    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {

            // -------------------------------
            // Lógica de CAMBIO DE STATUS
            // -------------------------------
            if (array_key_exists('status', $validated)) {

                $newStatus = $validated['status'];
                $oldStatus = $patient->status;

                // ¿El estado realmente cambió?
                if ($newStatus !== $oldStatus) {

                    // Registrar fecha de cambio
                    $validated['status_changed_at'] = now();

                    // Si el nuevo estado NO es "active" → status_reason obligatorio
                    if ($newStatus !== 'active') {

                        if (empty($validated['status_reason'])) {
                            throw new \Exception("Debe ingresar un motivo cuando el estado no es activo.");
                        }

                        $validated['status_reason'] = $validated['status_reason'];
                    }

                    // Si el estado cambió a active: limpiar el motivo
                    if ($newStatus === 'active') {
                        $validated['status_reason'] = null;
                    }
                } else {
                    // No hubo cambio → evitar sobrescribir status
                    unset($validated['status']);
                }
            }


            // -------------------------------
            // Actualizar paciente
            // -------------------------------
            $patient->update($validated);

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

    public function checkExisting(Request $request)
    {
        $request->validate(['rut' => 'required']);

        // El Trait Multitenantable ya filtra por la empresa actual, 
        // así que no necesitamos preocuparnos por otras clínicas.
        $patient = Patient::where('rut', $request->rut)->first();

        if ($patient) {
            return response()->json([
                'status' => 'exists',
                'patient' => [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'last_name' => $patient->last_name,
                    'email' => $patient->email,
                    'phone' => $patient->phone,
                    'birth_date' => $patient->birth_date,
                    'gender' => $patient->gender,
                    'occupation' => $patient->occupation,
                    'marital_status' => $patient->marital_status,
                ]
            ]);
        }

        return response()->json(['status' => 'new']);
    }
}
