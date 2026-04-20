<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\Province;
use App\Models\Region;
use App\Models\Patient;
use App\Models\Company;
use App\Models\Doctor;
use App\Models\Diagnostic;
use App\Models\SessionType;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
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
            ->leftJoin('provinces as p', 'c.province_id', '=', 'p.id')
            ->leftJoin('regions as r', 'p.region_id', '=', 'r.id')
            ->when($activeBranchId, function ($q) use ($activeBranchId) {
                $q->whereHas('branches', function ($bq) use ($activeBranchId) {
                    $bq->where('branches.id', $activeBranchId);
                });
            })
            ->select([
                'patients.id', 'patients.name', 'patients.last_name', 'patients.email', 'patients.birth_date',
                'patients.rut', 'patients.phone', 'patients.status', 'patients.occupation',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),
                DB::raw('addr.id as address_id'), 'addr.street', 'addr.number', 'c.name as comuna_name',
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
        $regions = Cache::remember('geo_regions', 86400, fn() => Region::all(['id', 'name']));
        $provinces = Cache::remember('geo_provinces', 86400, fn() => Province::all(['id', 'name', 'region_id']));
        $communes = Cache::remember('geo_communes', 86400, fn() => Commune::all(['id', 'name', 'province_id']));

        return Inertia::render('patients/index-patients', [
            'patients' => $patients,
            'regions' => $regions,
            'provinces' => $provinces,
            'communes' => $communes,
            'business_type' => $businessType,
            'doctors' => $isClinical ? Doctor::all(['id', 'name', 'last_name']) : [],
            'diagnostics' => $isClinical ? Diagnostic::all(['code', 'description']) : [],
            'sessionTypes' => $isClinical ? SessionType::all(['id', 'name']) : [],
        ]);
    }

    public function show($id)
    {
        $currentCompanyId = session('current_company_id');
        $company = Company::find($currentCompanyId);
        $businessType = $company->business_type->value ?? 'clinical';
        $isClinical = $businessType === 'clinical';

        $patient = Patient::with([
            'address.commune.province.region',
            'insurances.plans',
            'activePlans.plan',
            'vitalSigns',
            'allergies',
            'condition',
            'lifestyle',
            'contacts',
            'attachments',
            'treatments.sessions.doctor',
            'treatments.sessions.sessionType',
            'treatments.sessions.invoiceItems.invoice',
            'treatmentSessions.doctor',
            'treatmentSessions.sessionType',
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
        $provinces = Cache::remember('geo_provinces', 86400, fn() => Province::all(['id', 'name', 'region_id']));
        $communes = Cache::remember('geo_communes', 86400, fn() => Commune::all(['id', 'name', 'province_id']));

        return Inertia::render('patients/detail-patient', [
            'patient' => $patient,
            'business_type' => $businessType,
            'doctors' => $isClinical ? Doctor::all(['id', 'name', 'last_name']) : [],
            'diagnostics' => $isClinical ? Diagnostic::all(['code', 'description']) : [],
            'session_types' => $isClinical ? SessionType::all(['id', 'name']) : [],
            'regions' => $regions,
            'provinces' => $provinces,
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
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['company_id'] = session('current_company_id');
            $data['user_id'] = auth()->id();

            $patient = Patient::create($data);

            // Guardar dirección si viene
            if ($request->filled('street')) {
                $patient->address()->create([
                    'company_id' => $data['company_id'],
                    'street' => $request->street,
                    'number' => $request->number,
                    'commune_id' => $request->commune_id,
                    'is_primary' => true,
                ]);
            }

            // Vincular a la sucursal actual
            $activeBranchId = session('active_branch_id');
            if ($activeBranchId) {
                $patient->branches()->attach($activeBranchId, ['status' => 'active']);
            }

            return redirect()->route('patients.index')
                ->with('message', 'Paciente creado exitosamente')
                ->with('type', 'success');
        });
    }

    public function edit($id)
    {
        return redirect()->route('patients.show', $id);
    }

    public function update(Request $request, $id)
    {
        // Validación manual para bypass de error de resolución de clase
        $updateRequest = app(\App\Http\Requests\UpdatePatientRequest::class);
        $data = $request->validate($updateRequest->rules(), $updateRequest->messages());

        return DB::transaction(function () use ($data, $request, $id) {
            $patient = Patient::findOrFail($id);
            $patient->update($data);

            // Actualizar o crear dirección
            if ($request->filled('street')) {
                $patient->address()->updateOrCreate(
                    ['addressable_id' => $patient->id, 'addressable_type' => 'Patient'],
                    [
                        'company_id' => $patient->company_id,
                        'street' => $request->street,
                        'number' => $request->number,
                        'commune_id' => $request->commune_id,
                    ]
                );
            }

            // Actualizar o crear contacto de emergencia
            if ($request->filled('contact_name')) {
                $patient->contacts()->updateOrCreate(
                    ['is_primary' => true],
                    [
                        'company_id' => $patient->company_id,
                        'name' => $request->contact_name,
                        'email' => $request->contact_email,
                        'phone' => $request->contact_phone,
                        'relationship' => $request->contact_relationship,
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

            // Actualizar Grupo Sanguíneo (Medical History)
            if ($request->filled('blood_type')) {
                $patient->condition()->updateOrCreate(
                    ['patient_id' => $patient->id],
                    ['blood_type' => $request->blood_type]
                );
            }

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
        $request->validate([
            'rut' => 'required|string',
            'name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        $patient = DB::transaction(function () use ($request) {
            $data = $request->only(['rut', 'name', 'last_name', 'email', 'phone']);
            $data['company_id'] = session('current_company_id');
            $data['user_id'] = auth()->id();
            $data['birth_date'] = now()->subYears(30)->format('Y-m-d'); // Default dummy date
            
            $patient = Patient::create($data);

            // Vincular sucursal
            $activeBranchId = session('active_branch_id');
            if ($activeBranchId) {
                $patient->branches()->attach($activeBranchId, ['status' => 'active']);
            }

            return $patient;
        });

        return response()->json($patient);
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
