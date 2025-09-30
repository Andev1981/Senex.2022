<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Commune;
use App\Models\Debt;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Province;
use App\Models\Region;
use App\Models\SessionType;
use App\Models\Treatment;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {

        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', Patient::class)
            ->groupBy('a.addressable_id');

        $patients = Patient::query()->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')->leftJoin('addresses', function ($join) {
                $join->on('addresses.addressable_id', '=', 'patients.id')
                    ->where('addresses.addressable_type', '=', Patient::class);
            })
            ->leftJoin('communes', 'addresses.commune_id', '=', 'communes.id')->select([
                'patients.id',
                'patients.name',
                'patients.last_name',
                'patients.email',
                'patients.birth_date',
                'patients.rut',
                'patients.phone',
                'patients.status',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),

                DB::raw('addresses.id as address_id'),
                DB::raw('addresses.street as street'),
                DB::raw('addresses.number as number'),
                DB::raw('addresses.details as details'),
                DB::raw('addresses.region_id as region_id'),
                DB::raw('addresses.province_id as province_id'),
                DB::raw('addresses.commune_id as commune_id'),

                DB::raw('communes.name as comuna_name'),

                DB::raw("CONCAT_WS(' ', addresses.street, addresses.number) as full_address"),

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

    public function kines()
    {
        $doctors = Doctor::all();
        return Inertia::render('Kines/KinesIndex', compact('doctors'));
    }

    public function store(StorePatientRequest $request)
    {
        // Validaciones
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            // Paciente
            $patient = Patient::create([
                'user_id'    => auth()->id(),
                'name'       => $validated['name'],
                'last_name'  => $validated['last_name'],
                'email'      => $validated['email'],
                'rut'        => $validated['rut'],
                'birth_date' => $validated['birth_date'],    // mapeo del front
                'phone'      => $validated['phone'] ?? '',
                'status'     => "active",
            ]);

            // Dirección (morphOne) — creamos asociada al paciente
            $patient->address()->create([
                'is_primary'  => true,
                'type'        => 'patient',
                'street'      => $validated['street']  ?? '',
                'number'      => $validated['number']  ?? '',
                'details'     => $validated['details'] ?? '',
                'region_id'   => $validated['region_id'],
                'province_id' => $validated['province_id'],
                'commune_id'  => $validated['commune_id'],
            ]);

            DB::commit();
            session()->flash('message', 'Paciente creado correctamente.');
            session()->flash('type', 'success');
            return redirect()->route('listado.pacientes');
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
            // Actualizamos paciente
            $patient->update([
                'name'       => $validated['name'],
                'last_name'  => $validated['last_name'],
                'email'      => $validated['email'],
                'rut'        => $validated['rut'],
                'birth_date' => $validated['birth_date'],
                'phone'      => $validated['phone'] ?? '',
            ]);

            // Upsert de la dirección polimórfica (morphOne)
            // updateOrCreate([], ...) funciona con morphOne para "la" fila ligada
            $patient->address()->updateOrCreate(
                [], // atributos de búsqueda (vacío = la única relacionada)
                [
                    'is_primary'  => true,
                    'type'        => 'patient',
                    'street'      => $validated['street']  ?? '',
                    'number'      => $validated['number']  ?? '',
                    'details'     => $validated['details'] ?? '',
                    'region_id'   => $validated['region_id'],
                    'province_id' => $validated['province_id'],
                    'commune_id'  => $validated['commune_id'],
                ]
            );

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

    public function show(Patient $patient)
    {
        $addrPick = DB::table('addresses as a')
            ->selectRaw('a.addressable_id, COALESCE(MAX(CASE WHEN a.is_primary = 1 THEN a.id END), MAX(a.id)) as addr_id')
            ->where('a.addressable_type', Patient::class)
            ->groupBy('a.addressable_id');

        $patient = Patient::query()->where('patients.id', $patient->id)->leftJoinSub($addrPick, 'addr_pick', fn($j) => $j->on('addr_pick.addressable_id', '=', 'patients.id'))
            ->leftJoin('addresses as addr', 'addr.id', '=', 'addr_pick.addr_id')->leftJoin('addresses', function ($join) {
                $join->on('addresses.addressable_id', '=', 'patients.id')
                    ->where('addresses.addressable_type', '=', Patient::class);
            })->leftJoin('communes', 'addresses.commune_id', '=', 'communes.id')
            ->leftJoin('regions', 'addresses.region_id', '=', 'regions.id')
            ->leftJoin('provinces', 'addresses.province_id', '=', 'provinces.id')->select([
                'patients.id',
                'patients.name',
                'patients.last_name',
                'patients.email',
                'patients.birth_date',
                'patients.rut',
                'patients.phone',
                'patients.status',
                DB::raw("CONCAT_WS(' ', patients.name, patients.last_name) as full_name"),

                DB::raw('addresses.id as address_id'),
                DB::raw('addresses.street as street'),
                DB::raw('addresses.number as number'),
                DB::raw('addresses.details as details'),
                DB::raw('addresses.region_id as region_id'),
                DB::raw('addresses.province_id as province_id'),
                DB::raw('addresses.commune_id as commune_id'),

                DB::raw('communes.name as comuna_name'),
                DB::raw('provinces.name as provincia_name'),
                DB::raw('regions.name as region_name'),

                DB::raw("CONCAT_WS(' ', addresses.street, addresses.number) as full_address"),

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
            ->first();

        $patient->payment_status = $patient->has_overdue ? 'overdue' : ($patient->has_due ? 'due' : 'ok');

        $treatments = Treatment::where('patient_id', $patient->id)->with('defaultSessionType')->orderBy('id', "desc")->get();
        if (count($treatments) > 0) {
            $treatment = $treatments->where('status', 'active')->first();
            $sessions = DB::table('treatment_sessions as ai')
                ->leftJoin('patients as p', 'p.id', '=', 'ai.patient_id')
                ->leftJoin('doctors as d', 'd.id', '=', 'ai.doctor_id')
                ->leftJoin('session_types as st', 'st.id', '=', 'ai.session_type_id')
                ->where('p.id', $patient->id)
                ->where('ai.treatment_id', $treatment->id)
                ->whereYear('ai.attended_at', now()->year) // <-- año en curso
                ->orderBy('p.name', 'asc')
                ->orderBy('ai.attended_at', 'desc')
                ->select([
                    'ai.id',
                    'ai.attended_at',
                    'ai.status',
                    'ai.patient_amount',
                    'ai.doctor_amount',
                    'ai.clinic_amount',
                    'ai.session_number',
                    'st.name as session_type_name', // <-- faltaba
                    DB::raw("CONCAT(p.name,' ',p.last_name) as patient_full"),  // precio cobrado al cliente
                    DB::raw("CONCAT(d.name,' ',d.last_name) as doctor_full"),  // precio cobrado al cliente
                ])
                ->selectRaw('(COALESCE(ai.patient_amount,0) - COALESCE(ai.doctor_amount,0)) as total_senex')
                ->get();
        } else {
            $treatment = [];
            $sessions = [];
        }


        $session_types = SessionType::orderBy('name')->get();
        $provinces = Province::all();
        $communes  = Commune::all();
        $regions   = Region::all();
        $doctors = Doctor::all();

        return Inertia::render('Patients/DetailPatient', compact('patient', 'sessions', 'communes', 'regions', 'provinces', 'session_types', 'doctors', 'treatments', 'treatment'));
    }

    public function destroy(Patient $patient)
    {
        $patient->update(['status' => "suspended"]);
        return back();
    }

    public function informes()
    {
        return Inertia::render('Informes/IndexInformes');
    }

    public function pos()
    {
        return Inertia::render('Pos/ClinicPOS');
    }
}
