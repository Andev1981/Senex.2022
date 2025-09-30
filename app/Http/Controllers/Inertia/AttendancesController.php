<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceStoreRequest;
use App\Models\Appointment;
use App\Services\TreatmentSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendancesController extends Controller
{
  public function index(Request $req)
  {

    $sessions = DB::table('treatment_sessions as ai')
      ->leftJoin('patients as p', 'p.id', '=', 'ai.patient_id')
      ->leftJoin('doctors as d', 'd.id', '=', 'ai.doctor_id')
      ->leftJoin('session_types as st', 'st.id', '=', 'ai.session_type_id')
      ->where('ai.status', 'completed')
      ->whereYear('ai.attended_at', now()->year) // <-- año en curso
      ->orderBy('p.name', 'asc')
      ->orderBy('ai.attended_at', 'asc')
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


    return inertia('Attendances/Index', [
      'sessions' => $sessions,
    ]);
  }

  public function store(AttendanceStoreRequest $request, TreatmentSessionService $service)
  {
    $payload = $request->validated();

    $ts = $service->registerAttendance($payload);

    return back()->with('ok', "Atención registrada (#{$ts->id})");
  }

  public function checkInAppointment(Appointment $appointment)
  {
    $this->authorize('update', $appointment);
    $appointment->update(['status' => 'checked_in', 'check_in_at' => now()]);

    return back()->with('ok', 'Paciente marcado como presente.');
  }
}
