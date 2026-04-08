<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Commune;
use App\Models\Invoice;
use App\Models\Diagnostic;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientContact;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\PatientPlan; // Importar el modelo PatientPlan
use App\Notifications\PatientTutorWelcomeNotification;
use App\Notifications\PatientWelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache; // Importar Facade Cache


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

        $patients = Patient::query()
            // 1. JOINS DE DIRECCIÓN
            ->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes as c', 'addr.commune_id', '=', 'c.id')
            ->leftJoin('provinces as p', 'c.province_id', '=', 'p.id')
            ->leftJoin('regions as r', 'p.region_id', '=', 'r.id')

            // 2. FILTRO POR SUCURSAL
            ->when($activeBranchId, function ($query) use ($activeBranchId) {
                $query->whereHas('branches', function ($q) use ($activeBranchId) {
                    $q->where('branches.id', $activeBranchId);
                });
            })

            // 3. SELECTS BÁSICOS
            ->select([
                'patients.id',
                'patients.name',
                'patients.last_name',
                'patients.email',
                'patients.birth_date',
                'patients.rut',
                'patients.phone',
                'patients.gender',
                'patients.status',
                'patients.occupation',
                'patients.marital_status',
                'patients.status_reason',
                'patients.opt_out_reminders',
                'patients.prefers_whatsapp',
                'patients.prefers_mail',
                'patients.prefers_sms',
                'patients.require_tutor',
                // Concatenaciones SQL
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),
                DB::raw('addr.id as address_id'),
                DB::raw('addr.street as street'),
                DB::raw('addr.number as number'),
                DB::raw('addr.details as details'),
                DB::raw('r.id as region_id'),
                DB::raw('p.id as province_id'),
                DB::raw('addr.commune_id as commune_id'),
                DB::raw("CONCAT_WS(' ', addr.street, addr.number) as full_address"),
                DB::raw('c.name as comuna_name'),
            ])

            // 4. ULTIMO DOCTOR
            ->addSelect([
                'last_doctor_name' => TreatmentSession::query()
                    ->selectRaw("CONCAT_WS(' ', doctors.name, doctors.last_name)")
                    ->join('doctors', 'doctors.id', '=', 'treatment_sessions.doctor_id')
                    ->whereColumn('treatment_sessions.patient_id', 'patients.id')
                    ->where('treatment_sessions.status', 'completed')
                    ->orderByDesc('treatment_sessions.date')
                    ->limit(1)
            ])

            // 5. DEUDA ACUMULADA (Estimada por facturas no pagadas completamente)
            ->addSelect([
                'due_amount' => function ($q) {
                    $q->from('invoices as i')
                        ->whereColumn('i.patient_id', 'patients.id')
                        ->whereIn('i.payment_status', ['unpaid', 'partial'])
                        // Subquery para restar lo pagado es compleja, por ahora sumamos el total de documentos pendientes
                        ->selectRaw("COALESCE(SUM(i.total_amount_clp), 0)");
                },
            ])

            // 6. RELACIONES Y ESTADOS
            ->withExists([
                'invoices as has_due' => fn($q) =>
                $q->whereIn('payment_status', ['unpaid', 'partial'])
            ])
            ->withExists([
                'invoices as has_overdue' => fn($q) =>
                $q->whereIn('payment_status', ['unpaid', 'partial'])
                  ->where('issue_date', '<', now()->subDays(30))
            ])
            ->with('primaryContact')
            ->orderBy('patients.updated_at', 'desc')
            
            // 7. EJECUCIÓN Y MAPEO FINAL
            ->get()
            ->map(function ($p) {
                $p->payment_status = $p->has_overdue ? 'overdue' : ($p->has_due ? 'due' : 'ok');
                return $p;
            });

        // Cachear datos geográficos por 24 horas (86400 segundos)
        $provinces = Cache::remember('geo_provinces', 86400, function () {
            return Province::all(['id', 'name', 'region_id']);
        });

        $communes = Cache::remember('geo_communes', 86400, function () {
            return Commune::all(['id', 'name', 'province_id']);
        });

        $regions = Cache::remember('geo_regions', 86400, function () {
            return Region::all(['id', 'name']);
        });

       /* dd($patients); */

        return Inertia::render('patients/index-patients', [
            'patients' => $patients,
            'communes' => $communes,
            'provinces' => $provinces,
            'regions' => $regions,
            'user' => auth()->user()->load('roles'),
        ]);
    }
    /**
     * INDEX - GET /patients/{patient}/treatments
     * Retorna vista Inertia para mostrar lista de tratamientos
     */
    public function show(Patient $patient)
    {
        // 1. CARGAR DATOS DEL PACIENTE
        // El Trait Multitenantable ya filtró que este paciente pertenezca a la empresa
        $patient->load([
            'address.commune.province.region',
            'latestVitalSign',
            'primaryContact',
            'allergies',
            'condition',
            'attachments.treatment.diagnostic',
            'invoices.currentDte',
            'plans.plan', // Cargar los planes del paciente y sus planes maestros (relación 'plans' en el modelo Patient)
            'plans.consumptions', // Cargar el consumo de sesiones de cada PatientPlan
        ]);

        // 2. TRATAMIENTOS (Contexto Clínico)
        // No ponemos where(company) porque el Trait lo hace solo.
        $treatments = Treatment::query()
            ->where('patient_id', $patient->id)
            ->with([
                'sessionType',
                'doctor',
                'diagnostic', 
                'sessions' => fn($q) => $q->orderBy('date', 'desc')->orderBy('time', 'desc'),
                'sessions.doctor',
                'sessions.invoiceItems.invoice', // <-- AGREGADO PARA DETECTAR DEUDA
            ])
            ->latest()
            ->get();

        // 3. PAGOS (Contexto Financiero)
        $payments = Payment::where('patient_id', $patient->id)
            ->where('status', 'completed')
            ->latest()
            ->get();

        // ---------------------------------------------------------------
        // 4. GENERAR HISTORIAL UNIFICADO (La magia para tu Dashboard 📊)
        // ---------------------------------------------------------------
        
        // A. Mapear Sesiones (Extraídas de los tratamientos cargados)
        $historySessions = $treatments->flatMap->sessions->map(fn($s) => [
            'id'       => $s->id,
            'type'     => 'session',
            'date'     => $s->date, // Asegúrate que sea formato YYYY-MM-DD
            'time'     => $s->time,
            'title'    => $s->sessionType->name ?? 'Atención Kinésica',
            'subtitle' => $s->doctor ? "Dr. {$s->doctor->last_name}" : 'Sin profesional',
            'status'   => $s->status,
            'amount'   => $s->patient_amount_clp,
            'meta'     => [
                'pain_level' => $s->pain_level,
                'pain_map'   => $s->session_pain_map
            ]
        ]);

        // B. Mapear Tratamientos (Hitos de inicio)
        $historyTreatments = $treatments->map(fn($t) => [
            'id'       => $t->id,
            'type'     => 'treatment',
            'date'     => $t->created_at->format('Y-m-d'),
            'time'     => $t->created_at->format('H:i'),
            'title'    => 'Inicio Tratamiento',
            'subtitle' => $t->diagnostic->description ?? ($t->referral_diagnosis ?? 'Sin Diagnóstico'),
            'status'   => $t->status,
            'amount'   => null,
            'meta'     => [
                'pain_map' => $t->initial_pain_map
            ]
        ]);

        // C. Mapear Pagos
        $historyPayments = $payments->map(fn($p) => [
            'id'       => $p->id,
            'type'     => 'payment',
            'date'     => $p->created_at->format('Y-m-d'), // O payment_date si tienes
            'time'     => $p->created_at->format('H:i'),
            'title'    => 'Pago Registrado',
            'subtitle' => $p->method ?? 'Pago',
            'status'   => 'completed',
            'amount'   => $p->amount,
            'meta'     => []
        ]);

        // D. Unificar y Ordenar
        $history = $historySessions
            ->concat($historyTreatments)
            ->concat($historyPayments)
            ->sortByDesc(fn($item) => $item['date'] . $item['time']) // Ordenar por fecha y hora
            ->values(); // Re-indexar array para JSON

        // DEBUG: Verificar si se están recuperando los datos
        \Illuminate\Support\Facades\Log::info('PatientAdminController::show DEBUG', [
            'patient_id' => $patient->id,
            'company_id_session' => session('current_company_id'),
            'treatments_count' => $treatments->count(),
            'history_count' => $history->count(),
            'first_treatment_id' => $treatments->first()?->id
        ]);

        // ---------------------------------------------------------------

        // 5. ASIGNAR RELACIÓN MANUALMENTE
        // Usamos la variable $treatments que ya tiene los Eager Loads (diagnostics, sessions...)
        // IMPORTANTE: No usar $patient->treatments aquí porque haría una query nueva vacía.
        $patient->setRelation('active_treatments', $treatments);

        // 6. Listas Auxiliares (Selects)
        // Aquí SÍ necesitamos filtrar manualmente por branch si el Doctor pertenece a varias
        $doctors = Doctor::whereHas('branches', fn($q) => $q->where('branches.id', session('active_branch_id')))
            ->select('id', 'name', 'last_name', 'email')
            ->get();

        $session_types = SessionType::all(); // El trait filtra por company
        $diagnostics = Diagnostic::where('is_active', true)->orderBy('description')->get(['code', 'description']);

        // Cachear datos geográficos (reutilizando las keys del index)
        $regions = Cache::remember('geo_regions', 86400, fn() => Region::all(['id', 'name']));
        $provinces = Cache::remember('geo_provinces', 86400, fn() => Province::all(['id', 'name', 'region_id']));
        $communes = Cache::remember('geo_communes', 86400, fn() => Commune::all(['id', 'name', 'province_id']));

        return Inertia::render('patients/detail-patient', [
            'patient'         => $patient,
            // Enviamos el historial unificado en lugar de cosas sueltas para la tabla
            'history'         => $history, 
            // Aún enviamos active_treatments (dentro de patient) para el modal de crear sesión
            'treatments'      => $treatments,
            'sessions'        => $treatments->flatMap->sessions,
            'payments'        => $payments,
            'address'         => $patient->address,
            'vital'           => $patient->latestVitalSign,
            'contact'         => $patient->primaryContact,
            'historySessions' => $historySessions,
            'doctors'         => $doctors,
            'session_types'   => $session_types,
            'diagnostics'     => $diagnostics,
            // Datos geográficos (cachear esto sería ideal en el futuro)
            'regions'         => $regions,
            'provinces'       => $provinces,
            'communes'        => $communes,
        ]);
    }

    public function showOLd(Patient $patient)
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
            'address.commune.province.region',
            'latestVitalSign',
            'primaryContact',
            'allergies',
            'condition',
            'attachments.treatment.diagnostic',
            'invoices.currentDte',
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

        return Inertia::render('patients/detail-patient', [
            'patient'     => $patient,
            'treatments'  => $treatments,
            'sessions'    => $sessions,
            'payments'    => $payments,
            'address'     => $patient->address,
            'vital'       => $patient->latestVitalSign,
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

            $exists = Patient::where('rut', $request->rut)
                ->where('company_id', $companyId)
                ->exists();

            // 3. Si no existe, creamos o actualizamos (Idempotencia)
            $patient = Patient::updateOrCreate(
                ['rut' => $request->rut, 'company_id' => $companyId],
                [
                    'name' => $request->name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'occupation' => $request->occupation,
                    'marital_status' => $request->marital_status,
                    'status' => $request->status ?? 'active',
                    'phone' => $request->phone,
                    'opt_out_reminders' => $request->opt_out_reminders ?? false,
                    'prefers_whatsapp' => $request->prefers_whatsapp ?? true,
                    'prefers_mail' => $request->prefers_mail ?? true,
                    'prefers_sms' => $request->prefers_sms ?? false,
                    'require_tutor' => $request->require_tutor ?? false,
                ]
            );

            // 4. Dirección Inicial (Si se provee)
            if ($request->filled('street') || $request->filled('commune_id')) {
                $patient->address()->create([
                    'street'     => $request->street,
                    'number'     => $request->number,
                    'details'    => $request->details,
                    'commune_id' => $request->commune_id,
                    'is_primary' => true
                ]);
            }

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

            if (!$exists && $request->boolean('send_welcome_notification', true)) {
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
                'latestVitalSign',
                'primaryContact',
                'allergies',
                'condition',
                'treatments' => function ($query) {
                    $query->latest();
                }
            ]);

            return redirect()->back()->with([
                'message' => 'Paciente guardado correctamente',
                'patient' => $patient 
            ]);
        } catch (\Throwable $e) {

            DB::rollBack();
            report($e);
            
            return redirect()->back()->withErrors(['error' => 'Ocurrió un error al guardar el paciente.']);
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
        $companyId = session('current_company_id');
        $path = $file->store("tenants/{$companyId}/patients/{$patient->id}/clinical", 'private');

        $attachment = \App\Models\Attachment::create([
            'company_id' => $companyId,
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

            // -------------------------------
            // Actualizar Dirección (Polimórfica)
            // -------------------------------
            if ($request->filled('street') || $request->filled('commune_id')) {
                $patient->address()->updateOrCreate(
                    ['addressable_id' => $patient->id, 'addressable_type' => 'Patient'],
                    [
                        'street'     => $request->street,
                        'number'     => $request->number,
                        'details'    => $request->details,
                        'commune_id' => $request->commune_id,
                        'is_primary' => true
                    ]
                );
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
