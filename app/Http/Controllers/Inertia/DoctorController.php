<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $doctors = Doctor::all();
        return Inertia::render('Doctors/IndexDoctor', compact('doctors'));
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) {
            return redirect()->route('listado.kines')->with('error', 'Kinesiólogo no encontrado.');
        }
        //$atenciones = ApplyItem::with('patient', 'application')->where('doctor_id', $doctor->id)->where('status', 1)->orderBy('fecha_atencion', 'desc')->get();

        $atenciones = DB::table('apply_items as ai')
            ->leftJoin('patients as p', 'p.id', '=', 'ai.patient_id')
            ->leftJoin('doctors as d', 'd.id', '=', 'ai.doctor_id')
            ->leftJoin('application_types as appt', 'appt.id', '=', 'ai.application_type_id') // <-- faltaba
            ->leftJoin('application_type_users as apptu', function ($join) use ($doctor) {
                $join->on('apptu.application_type_id', '=', 'ai.application_type_id')
                    ->where('apptu.user_id', $doctor->id); // filtra por el user del doctor
            })
            ->where('ai.doctor_id', $doctor->id)
            ->where('ai.status', 1)
            ->whereYear('ai.fecha_atencion', now()->year) // <-- año en curso
            ->orderBy('p.name', 'asc')
            ->orderBy('ai.fecha_atencion', 'asc')
            ->select([
                'ai.id',
                'ai.fecha_atencion',
                'ai.status',
                DB::raw("CONCAT(p.name,' ',p.last_name) as patient_full"),
                'appt.name as application_type_name',
                DB::raw('COALESCE(apptu.price,0) as valor_kine'),   // desde pivot
                DB::raw('COALESCE(ai.price,0) as valor_senex'),     // precio cobrado al cliente
                'ai.numero_sesion',
            ])
            ->selectRaw('(COALESCE(ai.price,0) - COALESCE(apptu.price,0)) as total_senex')
            ->get();


        $user = auth()->user();


        return Inertia::render('Doctor/IndexDoctor', compact('doctor', 'atenciones', 'user'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function doctor_detail($id) {}

    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $limit = min((int) $request->query('limit', 10), 25); // hard cap

        if (mb_strlen($q) < 2) {
            return  $items = []; // no spam al DB
        }

        // Campos a mostrar (evita exponer PII innecesaria)
        $columns = ['id', 'name', 'last_name'];

        // MySQL (collation ai_ci quita tildes y case)
        $items = Doctor::query()
            ->select($columns)
            ->where(function ($w) use ($q) {
                $w->where('name', 'LIKE', "%{$q}%")
                    ->orWhere('last_name', 'LIKE', "%{$q}%");
            })
            // Prioriza “empieza con” para mejor ranking visual
            ->orderByRaw("CASE
            WHEN name LIKE ? THEN 0
            WHEN last_name LIKE ? THEN 1
            ELSE 2 END", ["{$q}%", "{$q}%"])
            ->orderBy('name')
            ->limit($limit)
            ->get();



        /*         return response()->json($items);
 */
    }
}
