<?php

namespace App\Http\Controllers\Admin\Calendars;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Doctor;
use App\Models\Room;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Holiday;
use App\Models\AvailabilityException;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        $branchId = session('active_branch_id');
        $date = $request->input('date', now()->toDateString());

        // 1. Disponibilidades Recurrentes
        $availabilities = Availability::where('company_id', $companyId)
            ->with(['doctor', 'room', 'branch'])
            ->latest()
            ->get();

        // 2. Excepciones y Feriados
        $exceptions = AvailabilityException::where('company_id', $companyId)
            ->with('doctor')
            ->latest()
            ->get();

        $holidays = Holiday::where('company_id', $companyId)
            ->with('branch')
            ->orderBy('date')
            ->get();

        // 3. Citas del día seleccionado (Para la vista de Carga de Boxes)
        $appointments = \App\Models\Appointment::where('company_id', $companyId)
            ->where('branch_id', $branchId)
            ->whereDate('start_at', $date)
            ->where('status', '!=', 'cancelled')
            ->with(['doctor', 'room', 'patient', 'item'])
            ->get();

        return Inertia::render('agendas/Availability', [
            'availabilities' => $availabilities,
            'exceptions' => $exceptions,
            'holidays' => $holidays,
            'appointments' => $appointments,
            'doctors' => Doctor::where('company_id', $companyId)->where('is_active', true)->get(),
            'rooms' => Room::where('branch_id', $branchId)->where('status', 'active')->get(),
            'branches' => Branch::where('company_id', $companyId)->get(),
            'filters' => [
                'date' => $date
            ]
        ]);
    }

    public function storeException(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
            'action' => 'required|in:cancel,override',
            'override_start_time' => 'nullable|required_if:action,override',
            'override_end_time' => 'nullable|required_if:action,override',
            'reason' => 'nullable|string|max:255',
        ]);

        $validated['company_id'] = session('current_company_id');
        
        AvailabilityException::create($validated);

        return back()->with('success', 'Excepción profesional registrada.');
    }

    public function destroyException(AvailabilityException $exception)
    {
        if ($exception->company_id !== (int)session('current_company_id')) abort(403);
        $exception->delete();
        return back()->with('success', 'Excepción eliminada.');
    }

    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
            'is_recurring' => 'boolean',
        ]);

        $validated['company_id'] = session('current_company_id');

        Holiday::create($validated);

        return back()->with('success', 'Día no laboral registrado.');
    }

    public function destroyHoliday(Holiday $holiday)
    {
        if ($holiday->company_id !== (int)session('current_company_id')) abort(403);
        $holiday->delete();
        return back()->with('success', 'Día no laboral eliminado.');
    }

    public function store(Request $request)
    {
        $companyId = session('current_company_id');
        
        if (!$companyId) {
            return back()->with('error', 'Sesión expirada. Por favor recarga la página.');
        }

        $data = $request->all();
        // Convertir strings vacíos de fechas a null para evitar errores de validación/BD
        if (isset($data['valid_until']) && $data['valid_until'] === "") $data['valid_until'] = null;
        if (isset($data['valid_from']) && $data['valid_from'] === "") $data['valid_from'] = null;
        if (isset($data['lunch_start_time']) && $data['lunch_start_time'] === "") $data['lunch_start_time'] = null;
        if (isset($data['lunch_end_time']) && $data['lunch_end_time'] === "") $data['lunch_end_time'] = null;
        
        $request->merge($data);

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'branch_id' => 'required|exists:branches,id',
            'room_id' => 'nullable|exists:rooms,id',
            'modality' => 'required|in:onsite,home',
            'rrule' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'lunch_start_time' => 'nullable',
            'lunch_end_time' => 'nullable',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date',
        ]);

        $validated['company_id'] = $companyId;

        Availability::create($validated);

        return back()->with('success', 'Disponibilidad registrada correctamente.');
    }

    public function update(Request $request, Availability $availability)
    {
        if ($availability->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        $data = $request->all();
        if (isset($data['lunch_start_time']) && $data['lunch_start_time'] === "") $data['lunch_start_time'] = null;
        if (isset($data['lunch_end_time']) && $data['lunch_end_time'] === "") $data['lunch_end_time'] = null;
        $request->merge($data);

        $validated = $request->validate([
            'room_id' => 'nullable|exists:rooms,id',
            'modality' => 'required|in:onsite,home',
            'rrule' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'lunch_start_time' => 'nullable',
            'lunch_end_time' => 'nullable',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $availability->update($validated);

        return back()->with('success', 'Disponibilidad actualizada.');
    }

    public function destroy(Availability $availability)
    {
        if ($availability->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        $availability->delete();

        return back()->with('success', 'Disponibilidad eliminada.');
    }
}
