<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceStoreRequest;
use App\Models\Appointment;
use App\Models\TreatmentSession;
use App\Services\TreatmentSessionService;
use Illuminate\Http\Request;

class AttendancesController extends Controller
{
  public function index(Request $req)
  {
    $q = TreatmentSession::query()
      ->with(['patient', 'doctor', 'sessionType'])
      ->orderByDesc('attended_at');

    if ($req->filled('date')) {
      $q->whereDate('attended_at', $req->date);
    }

    return inertia('Attendances/Index', [
      'sessions' => $q->paginate(20),
      'filters'  => ['date' => $req->date]
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
