<?php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleMobileController extends Controller
{
    public function index()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return redirect()->route('dashboard');
        }

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        $permissions = [
            'can_manage_schedule' => $isClinicalAdmin || ($doctorBranch['can_manage_schedule'] ?? true),
        ];

        $rawAvailabilities = Availability::where('doctor_id', $doctor->id)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get();

        $daysMapping = [
            'SU' => 0,
            'MO' => 1,
            'TU' => 2,
            'WE' => 3,
            'TH' => 4,
            'FR' => 5,
            'SA' => 6,
        ];

        $availabilities = [];
        foreach ($rawAvailabilities as $a) {
            $rrule = $a->rrule;
            if ($rrule && preg_match('/BYDAY=([^;]+)/', $rrule, $matches)) {
                $days = explode(',', $matches[1]);
                foreach ($days as $day) {
                    $day = trim($day);
                    if (isset($daysMapping[$day])) {
                        $availabilities[] = [
                            'id'         => $a->id,
                            'day_of_week'=> $daysMapping[$day],
                            'start_time' => substr($a->start_time, 0, 5),
                            'end_time'   => substr($a->end_time, 0, 5),
                            'modality'   => $a->modality?->value ?? 'onsite',
                            'valid_from' => $a->valid_from?->format('Y-m-d'),
                            'valid_until'=> $a->valid_until?->format('Y-m-d'),
                        ];
                    }
                }
            } else {
                $availabilities[] = [
                    'id'         => $a->id,
                    'day_of_week'=> $a->day_of_week,
                    'start_time' => substr($a->start_time, 0, 5),
                    'end_time'   => substr($a->end_time, 0, 5),
                    'modality'   => $a->modality?->value ?? 'onsite',
                    'valid_from' => $a->valid_from?->format('Y-m-d'),
                    'valid_until'=> $a->valid_until?->format('Y-m-d'),
                ];
            }
        }
        $availabilities = collect($availabilities);

        $exceptions = \App\Models\AvailabilityException::where('doctor_id', $doctor->id)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($ex) => [
                'id'                  => $ex->id,
                'date'                => $ex->date->format('Y-m-d'),
                'end_date'            => $ex->end_date?->format('Y-m-d'),
                'action'              => $ex->action,
                'override_start_time' => $ex->override_start_time ? substr($ex->override_start_time, 0, 5) : null,
                'override_end_time'   => $ex->override_end_time ? substr($ex->override_end_time, 0, 5) : null,
                'reason'              => $ex->reason,
            ]);

        $activeBranchId = session('active_branch_id');
        $currentBranch = \App\Models\Branch::find($activeBranchId);
        if (!$currentBranch && $doctor) {
            $currentBranch = $doctor->branches()->first();
        }

        return Inertia::render('kine-mobile/my-schedule', [
            'availabilities' => $availabilities,
            'exceptions'     => $exceptions,
            'permissions'    => $permissions,
            'currentBranch'  => $currentBranch,
        ]);
    }

    public function storeAvailability(Request $request)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) abort(403);

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_manage_schedule'] ?? true)) {
            abort(403, 'No tienes permiso para gestionar tu horario en esta sucursal.');
        }

        $data = $request->validate([
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'modality'    => 'nullable|string|in:onsite,online,home',
        ]);

        $companyId     = session('current_company_id') ?: Auth::user()->company_id;
        $activeBranchId= session('active_branch_id');

        $daysReverseMapping = [
            0 => 'SU',
            1 => 'MO',
            2 => 'TU',
            3 => 'WE',
            4 => 'TH',
            5 => 'FR',
            6 => 'SA',
        ];

        $rruleDay = $daysReverseMapping[$data['day_of_week']];
        $rrule = "FREQ=WEEKLY;BYDAY={$rruleDay}";

        Availability::create([
            'company_id'  => $companyId,
            'branch_id'   => $activeBranchId,
            'doctor_id'   => $doctor->id,
            'rrule'       => $rrule,
            'start_time'  => $data['start_time'],
            'end_time'    => $data['end_time'],
            'modality'    => $data['modality'] ?? 'onsite',
            'is_active'   => true,
        ]);

        return back()->with('success', 'Bloque horario agregado correctamente.');
    }

    public function destroyAvailability(Availability $availability)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor || $availability->doctor_id !== $doctor->id) abort(403);

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_manage_schedule'] ?? true)) {
            abort(403, 'No tienes permiso para gestionar tu horario en esta sucursal.');
        }

        $availability->delete();
        return back()->with('success', 'Bloque horario eliminado.');
    }

    public function storeException(Request $request)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) abort(403);

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_manage_schedule'] ?? true)) {
            abort(403, 'No tienes permiso para gestionar tu horario en esta sucursal.');
        }

        $data = $request->validate([
            'date'                => 'required|date',
            'end_date'            => 'nullable|date|after_or_equal:date',
            'action'              => 'required|string|in:cancel,override,open',
            'override_start_time' => 'required_if:action,override,open|nullable|string',
            'override_end_time'   => 'required_if:action,override,open|nullable|string|after:override_start_time',
            'reason'              => 'nullable|string|max:255',
        ]);

        $companyId      = session('current_company_id') ?: Auth::user()->company_id;
        $activeBranchId = session('active_branch_id');

        \App\Models\AvailabilityException::create([
            'company_id'          => $companyId,
            'branch_id'           => $activeBranchId,
            'doctor_id'           => $doctor->id,
            'date'                => $data['date'],
            'end_date'            => $data['end_date'] ?? null,
            'action'              => $data['action'],
            'override_start_time' => $data['override_start_time'] ?? null,
            'override_end_time' => $data['override_end_time'] ?? null,
            'reason'              => $data['reason'] ?? null,
        ]);

        return back()->with('success', 'Bloqueo/Excepción registrada correctamente.');
    }

    public function destroyException(\App\Models\AvailabilityException $exception)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor || $exception->doctor_id !== $doctor->id) abort(403);

        $doctorBranch = $doctor->getBranchAttribute();
        $isClinicalAdmin = auth()->user()->hasRole(['superadmin', 'admin']);
        if (!$isClinicalAdmin && !($doctorBranch['can_manage_schedule'] ?? true)) {
            abort(403, 'No tienes permiso para gestionar tu horario en esta sucursal.');
        }

        $exception->delete();
        return back()->with('success', 'Bloqueo/Excepción eliminada.');
    }

    public function testIndex()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return redirect()->route('dashboard');
        }

        $companyId = session('current_company_id') ?: Auth::user()->company_id;
        $activeBranchId = session('active_branch_id');

        $appointments = Appointment::where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->where('status', '!=', \App\Enums\AppointmentStatusEnum::CANCELLED)
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id'         => $apt->id,
                    'date'       => $apt->start_at->format('Y-m-d'),
                    'start_time' => $apt->start_at->format('H:i'),
                    'end_time'   => $apt->end_at->format('H:i'),
                    'patient_id' => $apt->patient_id,
                    'doctor_id'  => $apt->doctor_id,
                    'room_id'    => $apt->room_id,
                    'patient'    => $apt->patient,
                    'doctor'     => $apt->doctor,
                    'item'       => $apt->item,
                    'room'       => $apt->room,
                    'modality'   => $apt->modality?->value ?? 'onsite',
                    'status'     => $apt->status,
                    'notes'      => $apt->notes,
                ];
            });

        $manualSessions = \App\Models\TreatmentSession::where('company_id', $companyId)
            ->where('branch_id', $activeBranchId)
            ->whereNull('appointment_id')
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->with(['patient', 'doctor', 'item.serviceDetail', 'room'])
            ->get()
            ->map(function ($sess) {
                return [
                    'id'               => "sess_{$sess->id}",
                    'date'             => $sess->date->format('Y-m-d'),
                    'start_time'       => $sess->time->format('H:i'),
                    'end_time'         => $sess->time->copy()->addMinutes(45)->format('H:i'),
                    'patient_id'       => $sess->patient_id,
                    'doctor_id'        => $sess->doctor_id,
                    'room_id'          => $sess->room_id,
                    'patient'          => $sess->patient,
                    'doctor'           => $sess->doctor,
                    'item'             => $sess->item,
                    'room'             => $sess->room,
                    'status'           => $sess->status,
                    'is_manual_session'=> true
                ];
            });

        $allAppointments = $appointments->concat($manualSessions);

        return Inertia::render('kine-mobile/my-schedule-new', [
            'appointments'  => $allAppointments,
            'currentBranch' => \App\Models\Branch::find($activeBranchId),
            'doctors'       => \App\Models\Doctor::where('id', $doctor->id)->get(),
            'loggedInDoctor'=> [
                'id'        => $doctor->id,
                'name'      => $doctor->name . ' ' . $doctor->last_name,
                'speciality'=> $doctor->speciality,
            ],
            'patients'      => \App\Models\Patient::where('company_id', $companyId)->with(['insurance', 'activeTreatments'])->get(),
            'items'         => \App\Models\Item::where('company_id', $companyId)->with('serviceDetail')->get(),
            'agreements'    => \App\Models\Agreement::where('company_id', $companyId)
                ->where('is_active', true)
                ->with(['rules' => function($q) {
                    $q->select('id', 'agreement_id', 'item_id', 'plan_id', 'patient_share_clp', 'insurance_share_clp', 'patient_percentage');
                }])
                ->get(['id', 'name', 'insurance_id']),
            'rooms'         => \App\Models\Room::where('branch_id', $activeBranchId)->get(),
            'availabilities'=> \App\Models\Availability::where('company_id', $companyId)->get(),
            'holidays'      => \App\Models\Holiday::where('company_id', $companyId)->get(),
            'exceptions'    => \App\Models\AvailabilityException::where('company_id', $companyId)->with('doctor')->get(),
            'regions'       => \Illuminate\Support\Facades\Cache::remember('geo_regions', 86400, fn() => \App\Models\Region::all(['id', 'name'])),
            'communes'      => \Illuminate\Support\Facades\Cache::remember('geo_communes', 86400, fn() => \App\Models\Commune::all(['id', 'name', 'region_id'])),
        ]);
    }
}
