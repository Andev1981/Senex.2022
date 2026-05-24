<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\Region;
use App\Models\Patient;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Diagnostic;
use App\Models\Item;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class PatientAdminController extends Controller
{
    public function index()
    {
        $activeBranchId = session('active_branch_id');
        $currentCompanyId = session('current_company_id');
        $company = Company::find($currentCompanyId);
        $businessType = $company->business_type->value ?? 'clinical';
        $isClinical = $businessType === 'clinical';

        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', 'Patient')
            ->groupBy('a.addressable_id');

        $query = Patient::query()
            ->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')
            ->leftJoin('communes as c', 'addr.commune_id', '=', 'c.id')
            ->leftJoin('regions as r', 'addr.region_id', '=', 'r.id')
            ->when($activeBranchId, function ($q) use ($activeBranchId) {
                $q->whereHas('branches', function ($bq) use ($activeBranchId) {
                    $bq->where('branches.id', $activeBranchId);
                });
            })
            ->select([
                'patients.id', 'patients.name', 'patients.last_name', 'patients.email', 'patients.birth_date',
                'patients.rut', 'patients.phone', 'patients.status', 'patients.occupation', 'patients.marital_status', 'patients.gender',
                'patients.opt_out_reminders', 'patients.prefers_whatsapp', 'patients.prefers_mail', 'patients.prefers_sms', 'patients.require_tutor',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),
                DB::raw('addr.id as address_id'), 'addr.street', 'addr.number', 'addr.details',
                'addr.region_id', 'addr.commune_id',
                'c.name as comuna_name',
            ]);

        // Información solo si es perfil clínico
        if ($isClinical) {
            $query->addSelect([
                'last_doctor_name' => TreatmentSession::query()
                    ->selectRaw("CONCAT_WS(' ', doctors.name, doctors.last_name)")
                    ->join('doctors', 'doctors.id', '=', 'treatment_sessions.doctor_id')
                    ->whereColumn('treatment_sessions.patient_id', 'patients.id')
                    ->where('treatment_sessions.status', 'completed')
                    ->orderByDesc('treatment_sessions.date')
                    ->limit(1),
                'active_treatments_count' => Treatment::query()
                    ->selectRaw('count(*)')
                    ->whereColumn('patient_id', 'patients.id')
                    ->where('status', 'active'),
            ]);
        }

        // Deuda acumulada (Común para todos)
        $query->addSelect([
            'due_amount' => function ($q) {
                $q->from('invoices as i')
                    ->whereColumn('i.patient_id', 'patients.id')
                    ->whereIn('i.payment_status', ['unpaid', 'partial'])
                    ->selectRaw("COALESCE(SUM(i.total_amount_clp), 0)");
            },
        ]);

        $patients = $query->with($isClinical ? ['insurances'] : [])
            ->orderBy('patients.updated_at', 'desc')
            ->get();

        // Datos geográficos para modales
        $regions = Cache::remember('geo_regions', 86400, fn() => Region::with('communes')->get(['id', 'name']));
        $communes = Cache::remember('geo_communes', 86400, fn() => Commune::all(['id', 'name', 'region_id']));

        return Inertia::render('patients/index-patients', [
            'patients' => $patients,
            'regions' => $regions,
            'communes' => $communes,
            'business_type' => $businessType,
            'doctors' => $isClinical ? Doctor::all(['id', 'name', 'last_name']) : [],
            'diagnostics' => $isClinical ? Diagnostic::all(['code', 'description']) : [],
            'session_types' => $isClinical ? Item::all(['id', 'name']) : [],
        ]);
    }

    public function show($id)
    {
        $currentCompanyId = session('current_company_id');
        $company = Company::find($currentCompanyId);
        $businessType = $company->business_type->value ?? 'clinical';
        $isClinical = $businessType === 'clinical';

        $patient = Patient::with([
            'medicalHistory',
            'address.commune.region',
            'insurances.plans',
            'activePlans.plan',
            'vitalSigns',
            'allergies',
            'condition',
            'lifestyle',
            'contacts',
            'attachments',
            'treatments.sessions.doctor',
            'treatments.sessions.item',
            'treatments.sessions.invoiceItems.invoice',
            'treatmentSessions.doctor',
            'treatmentSessions.item',
            'treatmentSessions.invoiceItems.invoice',
            'invoices.items',
        ])->findOrFail($id);

        // Obtener pagos reales a través de las facturas del paciente
        $payments = \App\Models\Payment::where('patient_id', $id)
            ->with(['paymentAllocations', 'branch'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Extraer tratamientos para las pestañas
        $allTreatments = $patient->treatments;
        $activeTreatments = $allTreatments->whereIn('status', ['active', 'evaluation', 'in_progress'])->values();
        $history = $patient->treatmentSessions()->orderBy('date', 'desc')->get();

        // Datos maestros para modales y edición
        $regions = Cache::remember('geo_regions', 86400, fn() => Region::all(['id', 'name']));
        $communes = Cache::remember('geo_communes', 86400, fn() => Commune::all(['id', 'name', 'region_id']));

        return Inertia::render('patients/detail-patient', [
            'patient' => $patient,
            'business_type' => $businessType,
            'doctors' => $isClinical ? Doctor::all(['id', 'name', 'last_name']) : [],
            'diagnostics' => $isClinical ? Diagnostic::all(['code', 'description']) : [],
            'session_types' => $isClinical ? Item::all(['id', 'name']) : [],
            'regions' => $regions,
            'communes' => $communes,
            'history' => $history,
            'treatments' => $allTreatments,
            'active_treatments' => $activeTreatments,
            'sessions' => $patient->treatmentSessions,
            'payments' => $payments,
        ]);
    }

    public function create()
    {
        return redirect()->route('patients.index');
    }

    public function store(\App\Http\Requests\StorePatientRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $data = $request->validated();
                $currentCompanyId = session('current_company_id');
                $activeBranchId = session('active_branch_id');

                // Asegurar RUT limpio
                $rut = \App\Rules\ValidRut::clean($data['rut']);

                // 1. Verificar si el paciente ya existe en el sistema (Globalmente)
                $patient = Patient::withoutGlobalScopes()
                    ->where('rut', $rut)
                    ->first();

                if ($patient) {
                    // Si existe, actualizamos sus datos (incluyendo preferencias de notificación)
                    $patient->company_id = $currentCompanyId;
                    $patient->update($data);
                } else {
                    // Si no existe, creamos el registro
                    $data['company_id'] = $currentCompanyId;
                    $data['user_id'] = auth()->id();
                    $patient = Patient::create($data);
                }

                // 2. Guardar dirección si viene o si es a domicilio
                if ($request->filled('street') || $request->is_home_care) {
                    $patient->primaryAddress()->updateOrCreate(
                        ['addressable_id' => $patient->id, 'addressable_type' => 'Patient'],
                        [
                            'company_id' => $currentCompanyId,
                            'street' => $request->street,
                            'number' => $request->number,
                            'commune_id' => $request->commune_id,
                            'region_id' => $request->region_id,
                            'details' => $request->details,
                            'is_primary' => true,
                        ]
                    );
                }

                // 3. Guardar Tutor si es requerido
                $tutor = null;
                if ($request->require_tutor) {
                    $tutor = $patient->contacts()->updateOrCreate(
                        ['is_primary' => true],
                        [
                            'company_id' => $currentCompanyId,
                            'name' => $request->guardian_name,
                            'rut' => $request->guardian_rut,
                            'relationship' => $request->guardian_relationship,
                            'phone' => $request->guardian_phone,
                            'email' => $request->guardian_email,
                            'is_active' => true,
                        ]
                    );
                }

                // 4. Vincular a la sucursal actual si no está vinculado
                if ($activeBranchId && !$patient->branches()->where('branches.id', $activeBranchId)->exists()) {
                    $patient->branches()->attach($activeBranchId, ['status' => 'active']);
                }

                // 5. Enviar Notificación de Bienvenida si se solicita
                if ($request->boolean('send_welcome_notification')) {
                    // Refrescamos paciente para tener cargadas las preferencias actualizadas si se crearon/actualizaron
                    $patient = $patient->fresh();

                    if ($request->require_tutor && $tutor) {
                        // Notificar al Tutor
                        $tutor->notify(new \App\Notifications\PatientTutorWelcomeNotification($patient, $tutor));
                    } else {
                        // Notificar al Paciente Directo
                        $channels = [];
                        if ($patient->prefers_mail && $patient->email) $channels[] = 'mail';
                        if ($patient->prefers_whatsapp && $patient->phone) $channels[] = 'whatsapp';
                        
                        if (!empty($channels)) {
                            // Importante: pasar los canales explícitos al constructor
                            $patient->notify(new \App\Notifications\PatientWelcomeNotification($patient, $channels));
                        }
                    }
                }

                return redirect()->route('patients.index')
                    ->with('message', 'Paciente procesado y vinculado exitosamente')
                    ->with('type', 'success')
                    ->with('patient_id', $patient->id);
            });
        } catch (\Exception $e) {
            \Log::error("Error al guardar paciente: " . $e->getMessage());
            return back()->withInput()->with([
                'flash' => [
                    'error' => 'No se pudo procesar el paciente: ' . $e->getMessage()
                ]
            ]);
        }
    }

    public function edit($id)
    {
        return redirect()->route('patients.show', $id);
    }

    public function update(Request $request, $id)
    {
        // Interceptar RUT genérico para generar/mantener el formato temporal único
        if ($request->has('rut')) {
            $cleanRut = \App\Rules\ValidRut::clean($request->rut);
            if ($cleanRut === '66666666-6') {
                $patientModel = Patient::findOrFail($id);
                $rawOriginalRut = $patientModel->getRawOriginal('rut');
                if ($rawOriginalRut && str_starts_with($rawOriginalRut, '66666666-6-TEMP-')) {
                    $cleanRut = $rawOriginalRut;
                } else {
                    do {
                        $cleanRut = '66666666-6-TEMP-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    } while (\App\Models\Patient::withoutGlobalScopes()->where('rut', $cleanRut)->exists());
                }
            }
            $request->merge(['rut' => $cleanRut]);
        }

        // Validación manual para bypass de error de resolución de clase
        $updateRequest = app(\App\Http\Requests\UpdatePatientRequest::class);
        $data = $request->validate($updateRequest->rules(), $updateRequest->messages());

        return DB::transaction(function () use ($data, $request, $id) {
            $patient = Patient::findOrFail($id);
            $patient->update($data);

            // Actualizar o crear dirección principal
            if ($request->filled('street')) {
                $patient->primaryAddress()->updateOrCreate(
                    ['addressable_id' => $patient->id, 'addressable_type' => 'Patient'],
                    [
                        'company_id' => $patient->company_id,
                        'street' => $request->street,
                        'number' => $request->number,
                        'commune_id' => $request->commune_id,
                        'region_id' => $request->region_id,
                        'details' => $request->details,
                        'is_primary' => true,
                    ]
                );
            }

            // Actualizar o crear contacto de Tutor (si aplica)
            if ($request->filled('guardian_name')) {
                $patient->contacts()->updateOrCreate(
                    ['is_primary' => true],
                    [
                        'company_id' => $patient->company_id,
                        'name' => $request->guardian_name,
                        'rut' => $request->guardian_rut,
                        'relationship' => $request->guardian_relationship,
                        'phone' => $request->guardian_phone,
                        'email' => $request->guardian_email,
                        'is_active' => true,
                    ]
                );
            }

            // Actualizar o crear Signos Vitales (Biometría)
            if ($request->filled('height_cm') || $request->filled('weight_kg')) {
                $patient->vitalSigns()->create([
                    'company_id' => $patient->company_id,
                    'recorded_by_user_id' => auth()->id(),
                    'recorded_at' => now(),
                    'height_cm' => $request->height_cm,
                    'weight_kg' => $request->weight_kg,
                    'bp_systolic' => $request->bp_systolic,
                    'bp_diastolic' => $request->bp_diastolic,
                    'heart_rate' => $request->heart_rate,
                    'resp_rate' => $request->resp_rate,
                    'spo2' => $request->spo2,
                    'temperature_c' => $request->temperature_c,
                ]);
            }

            // Actualizar o crear MedicalHistory (Antecedentes)
            $historyData = [
                'blood_type'         => $request->blood_type,
                'handedness'         => $request->handedness,
                'pathologies'        => $request->pathologies,
                'surgeries'          => $request->surgeries,
                'fractures'          => $request->fractures,
                'medications'        => $request->medications,
                'family_history'     => $request->family_history,
                'has_pacemaker'      => $request->boolean('has_pacemaker'),
                'has_metal_implants' => $request->boolean('has_metal_implants'),
                'is_pregnant'        => $request->boolean('is_pregnant'),
                'cancer_history'     => $request->boolean('cancer_history'),
                'company_id'         => $patient->company_id,
                'recorded_by_user_id' => auth()->id(),
            ];

            $patient->medicalHistory()->updateOrCreate(
                ['patient_id' => $patient->id],
                $historyData
            );

            return back()
                ->with('message', 'Datos actualizados correctamente')
                ->with('type', 'success');
        });
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();

        return redirect()->route('patients.index')
            ->with('message', 'Paciente eliminado correctamente')
            ->with('type', 'success');
    }

    public function quickStore(Request $request)
    {
        $cleanRut = \App\Rules\ValidRut::clean($request->rut);
        if ($cleanRut === '66666666-6') {
            do {
                $cleanRut = '66666666-6-TEMP-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            } while (\App\Models\Patient::withoutGlobalScopes()->where('rut', $cleanRut)->exists());
            $request->merge(['rut' => $cleanRut]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'rut' => ['required', 'string', new \App\Rules\ValidRut],
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'require_tutor' => 'boolean',
            'tutor_name' => 'required_if:require_tutor,true|nullable|string|max:255',
            'tutor_phone' => 'required_if:require_tutor,true|nullable|string|max:255',
            'tutor_email' => 'required_if:require_tutor,true|nullable|email|max:255',
            'tutor_relationship' => 'required_if:require_tutor,true|nullable|string|max:255',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:255',
            'commune_id' => 'required|exists:communes,id',
            'region_id' => 'required|exists:regions,id',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $currentCompanyId = session('current_company_id');
                $activeBranchId = session('active_branch_id');
                
                $rut = \App\Rules\ValidRut::clean($request->rut);

                // 1. Verificar si ya existe el paciente por RUT
                $patient = Patient::withoutGlobalScopes()
                        ->where('rut', $rut)
                        ->first();

                $basicData = [
                    'name' => $request->name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'birth_date' => $request->birth_date,
                    'require_tutor' => $request->require_tutor ?? false,
                ];

                if (!$patient) {
                    // Si no existe, creamos el registro
                    $data = $basicData;
                    $data['rut'] = $rut;
                    $data['company_id'] = $currentCompanyId;
                    $data['status'] = 'active';
                    
                    $patient = Patient::create($data);
                } else {
                    // Si existe, aseguramos que pertenezca a la empresa actual y actualizamos datos básicos
                    $patient->company_id = $currentCompanyId;
                    $patient->fill($basicData);
                    $patient->save();
                }

                // 2. Dirección
                $patient->primaryAddress()->updateOrCreate(
                    ['addressable_id' => $patient->id, 'addressable_type' => 'Patient'],
                    [
                        'company_id' => $currentCompanyId,
                        'street' => $request->street,
                        'number' => $request->number,
                        'commune_id' => $request->commune_id,
                        'region_id' => $request->region_id,
                        'is_primary' => true,
                    ]
                );

                // 3. Tutor / Contacto de Emergencia si aplica
                if ($request->require_tutor && $request->tutor_name) {
                    $patient->contacts()->updateOrCreate(
                        ['patient_id' => $patient->id, 'is_primary' => true],
                        [
                            'company_id' => $currentCompanyId,
                            'name' => $request->tutor_name,
                            'phone' => $request->tutor_phone,
                            'email' => $request->tutor_email,
                            'relationship' => $request->tutor_relationship ?? 'Tutor/Responsable',
                            'type' => 'guardian',
                            'is_active' => true
                        ]
                    );
                }

                // 4. Vincular a la sucursal actual
                if ($activeBranchId && method_exists($patient, 'branches') && !$patient->branches()->where('branches.id', $activeBranchId)->exists()) {
                    $patient->branches()->attach($activeBranchId, ['status' => 'active']);
                }

                if ($request->wantsJson()) {
                    return response()->json($patient);
                }

                return back()->with('success', "Paciente {$patient->name} registrado correctamente.")
                    ->with('message', "Paciente {$patient->name} registrado correctamente.")
                    ->with('type', 'success')
                    ->with('patient_id', $patient->id);
            });

        } catch (\Exception $e) {
            \Log::error("Error en quickStore de paciente: " . $e->getMessage());
            return back()->withErrors(['error' => 'Error al registrar el paciente: ' . $e->getMessage()]);
        }
    }

    public function checkExisting(Request $request)
    {
        $rut = $request->rut;
        $exists = Patient::where('rut', $rut)
            ->where('company_id', session('current_company_id'))
            ->exists();

        return response()->json(['exists' => $exists]);
    }
}
