<?php

namespace App\Services;

use App\Models\Availability;
use App\Models\AvailabilityException;
use App\Models\Holiday;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Room;
use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AgendaService
{
    /**
     * Comprueba si el profesional está de turno en un bloque horario.
     */
    public function isDoctorOnDuty(Doctor $doctor, Carbon $start, Carbon $end, $branchId = null): bool
    {
        $branchId = $branchId ?: session('active_branch_id');
        $date = $start->copy()->startOfDay();
        $dateStr = $date->format('Y-m-d');
        $dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2)); // MO, TU, etc
        
        // 🛑 VALIDACIÓN 0: Horario de Sucursal (Límites físicos)
        $branch = Branch::find($branchId);
        $branchSchedule = $branch?->schedule[$dayOfWeek] ?? null;
        $isBranchOpen = $branchSchedule && !empty($branchSchedule['open']) && !empty($branchSchedule['close']);

        // 1. Obtener excepciones del profesional primero (Prioridad absoluta)
        $exceptions = AvailabilityException::where('doctor_id', $doctor->id)
            ->where(function($q) use ($dateStr) {
                $q->where('date', '<=', $dateStr)
                  ->where(function($sq) use ($dateStr) {
                      $sq->whereNull('end_date')->where('date', $dateStr)->orWhere('end_date', '>=', $dateStr);
                  });
            })
            ->get();

        // 🛑 Caso A: Cancelación de DÍA COMPLETO
        if ($exceptions->where('action', 'cancel')->whereNull('override_start_time')->isNotEmpty()) {
            return false;
        }

        // ⭐ Caso B: APERTURA ESPECIAL (Acción 'open') - Ignora feriados y cierres físicos
        $openException = $exceptions->where('action', 'open')->first();
        if ($openException) {
            $shiftStart = $date->copy()->setTimeFrom(Carbon::parse($openException->override_start_time));
            $shiftEnd = $date->copy()->setTimeFrom(Carbon::parse($openException->override_end_time));
            
            return ($start->format('H:i') >= $shiftStart->format('H:i') && 
                    $end->format('H:i') <= $shiftEnd->format('H:i'));
        }

        // 2. Obtener disponibilidades recurrentes o específicas
        $availabilities = Availability::where('doctor_id', $doctor->id)
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->where(function($q) use ($dateStr, $dayOfWeek) {
                $q->where('rrule', 'like', "%BYDAY%{$dayOfWeek}%")
                  ->orWhere(function($sq) use ($dateStr) {
                      $sq->where('valid_from', $dateStr)
                         ->where('valid_until', $dateStr);
                  });
            })
            ->where(function($q) use ($dateStr) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $dateStr);
            })
            ->where(function($q) use ($dateStr) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', $dateStr);
            })
            ->get();

        if ($availabilities->isEmpty()) return false;

        // 3. Verificar si es apertura especial por disponibilidad específica de fecha
        $isSpecialOpeningAv = $availabilities->contains(fn($av) => $av->valid_from?->format('Y-m-d') === $dateStr && $av->valid_until?->format('Y-m-d') === $dateStr);
        
        // 4. Si NO es apertura especial, verificar cierre de centro (Holiday) y horario de sucursal
        if (!$isSpecialOpeningAv) {
            if ($this->isHoliday($date, $branchId, $start->format('H:i'), $end->format('H:i'))) return false;
            
            if (!$isBranchOpen) return false;

            if ($start->format('H:i') < $branchSchedule['open'] || $end->format('H:i') > $branchSchedule['close']) {
                return false;
            }
        }

        foreach ($availabilities as $av) {
            $startTime = $av->start_time;
            $endTime = $av->end_time;
            $lunchStart = $av->lunch_start_time;
            $lunchEnd = $av->lunch_end_time;

            // Verificar si hay un override de horario para este profesional hoy
            $dayOverride = $exceptions->where('action', 'override')->whereNotNull('override_start_time')->first();

            if ($dayOverride) {
                $startTime = $dayOverride->override_start_time;
                $endTime = $dayOverride->override_end_time;
                $lunchStart = null;
                $lunchEnd = null;
            }

            // Validar que el bloque solicitado esté dentro del turno
            $shiftStart = $date->copy()->setTimeFrom(Carbon::parse($startTime));
            $shiftEnd = $date->copy()->setTimeFrom(Carbon::parse($endTime));

            if ($start->format('H:i') >= $shiftStart->format('H:i') && 
                $end->format('H:i') <= $shiftEnd->format('H:i')) {
                
                // Verificar colación
                if ($lunchStart && $lunchEnd) {
                    $lStart = $date->copy()->setTimeFrom(Carbon::parse($lunchStart));
                    $lEnd = $date->copy()->setTimeFrom(Carbon::parse($lunchEnd));
                    
                    if ($start->lt($lEnd) && $end->gt($lStart)) continue;
                }

                // Verificar bloqueos parciales (Cancelación con horario)
                $isProfBlocked = $exceptions->where('action', 'cancel')
                    ->whereNotNull('override_start_time')
                    ->filter(fn($ex) => $start->format('H:i') < $ex->override_end_time && $end->format('H:i') > $ex->override_start_time)
                    ->isNotEmpty();

                if ($isProfBlocked) continue;

                return true;
            }
        }

        return false;
    }

    /**
     * Obtiene los bloques horarios disponibles.
     */
    public function getAvailableSlots(Doctor $doctor, Carbon $date, $branchId = null): Collection
    {
        $branchId = $branchId ?: session('active_branch_id');
        $dateStr = $date->format('Y-m-d');
        $dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2));

        // 1. Obtener excepciones del profesional primero (Prioridad absoluta)
        $exceptions = AvailabilityException::where('doctor_id', $doctor->id)
            ->where(function($q) use ($dateStr) {
                $q->where('date', '<=', $dateStr)
                  ->where(function($sq) use ($dateStr) {
                      $sq->whereNull('end_date')->where('date', $dateStr)->orWhere('end_date', '>=', $dateStr);
                  });
            })
            ->get();

        // 🛑 Caso A: Cancelación de DÍA COMPLETO
        if ($exceptions->where('action', 'cancel')->whereNull('override_start_time')->isNotEmpty()) {
            return collect([]);
        }

        // ⭐ Caso B: APERTURA ESPECIAL (Acción 'open')
        $openException = $exceptions->where('action', 'open')->first();
        
        if ($openException) {
            return $this->generateSlotsFromConfig(
                $doctor, 
                $date, 
                $openException->override_start_time, 
                $openException->override_end_time, 
                null, 
                null,
                $openException->room_id,
                $openException->modality ?: 'onsite',
                $branchId,
                $exceptions,
                true // ignoreHolidays
            );
        }

        // 2. Obtener disponibilidades recurrentes
        $availabilities = Availability::where('doctor_id', $doctor->id)
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->where(function($q) use ($dateStr, $dayOfWeek) {
                $q->where('rrule', 'like', "%BYDAY%{$dayOfWeek}%")
                  ->orWhere(function($sq) use ($dateStr) {
                      $sq->where('valid_from', $dateStr)
                         ->where('valid_until', $dateStr);
                  });
            })
            ->where(function($q) use ($dateStr) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $dateStr);
            })
            ->where(function($q) use ($dateStr) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', $dateStr);
            })
            ->with('room')
            ->get();

        if ($availabilities->isEmpty()) return collect([]);

        $isSpecialOpeningAv = $availabilities->contains(fn($av) => $av->valid_from?->format('Y-m-d') === $dateStr && $av->valid_until?->format('Y-m-d') === $dateStr);

        $slots = collect([]);
        foreach ($availabilities as $availability) {
            $slots = $slots->concat($this->generateSlotsFromConfig(
                $doctor,
                $date,
                $availability->start_time,
                $availability->end_time,
                $availability->lunch_start_time,
                $availability->lunch_end_time,
                $availability->room_id,
                $availability->modality->value ?? 'onsite',
                $branchId,
                $exceptions,
                $isSpecialOpeningAv
            ));
        }

        return $slots->sortBy('start')->values();
    }

    /**
     * Generador genérico de slots basado en configuración.
     */
    protected function generateSlotsFromConfig(
        Doctor $doctor, 
        Carbon $date, 
        $startTimeStr, 
        $endTimeStr, 
        $lunchStartStr, 
        $lunchEndStr, 
        $roomId, 
        $modality, 
        $branchId,
        $exceptions,
        bool $ignoreHolidays = false
    ): Collection {
        $slots = collect([]);
        $interval = 30; 
        $current = $date->copy()->setTimeFrom(Carbon::parse($startTimeStr));
        $endLimit = $date->copy()->setTimeFrom(Carbon::parse($endTimeStr));
        $room = $roomId ? Room::find($roomId) : null;

        // 🕒 Horarios de la Sucursal (Límites físicos)
        $branch = Branch::find($branchId);
        $dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2));
        $branchSchedule = $branch?->schedule[$dayOfWeek] ?? null;

        // Si no hay horario de sucursal o los campos están vacíos, y NO es apertura especial, el centro está cerrado.
        $isBranchOpen = $branchSchedule && !empty($branchSchedule['open']) && !empty($branchSchedule['close']);
        
        if (!$isBranchOpen && !$ignoreHolidays) {
            return collect([]);
        }

        // Override de día completo del profesional (ej: vacaciones forzadas pero que no cancelan sino que cambian horario)
        $dayOverride = $exceptions->where('action', 'override')->whereNotNull('override_start_time')->first();
        if ($dayOverride) {
            $current = $date->copy()->setTimeFrom(Carbon::parse($dayOverride->override_start_time));
            $endLimit = $date->copy()->setTimeFrom(Carbon::parse($dayOverride->override_end_time));
            $lunchStartStr = null;
            $lunchEndStr = null;
        }

        while ($current->lessThan($endLimit)) {
            $slotEnd = $current->copy()->addMinutes($interval);
            if ($slotEnd->greaterThan($endLimit)) break;

            $cStr = $current->format('H:i');
            $eStr = $slotEnd->format('H:i');

            // 🏥 Validación de Horario de Sucursal (Límites físicos)
            if (!$ignoreHolidays && $isBranchOpen) {
                if ($cStr < $branchSchedule['open'] || $eStr > $branchSchedule['close']) {
                    $current->addMinutes($interval);
                    continue;
                }
            }

            // 🛑 A: Bloqueo por CIERRE DE CENTRO (Holidays/Feriados)
            if (!$ignoreHolidays && $this->isHoliday($date, $branchId, $cStr, $eStr)) {
                $current->addMinutes($interval);
                continue;
            }

            // 🛑 B: Bloqueo por EXCEPCIÓN PROFESIONAL (Parcial)
            $isProfBlocked = $exceptions->where('action', 'cancel')
                ->whereNotNull('override_start_time')
                ->filter(fn($ex) => $cStr < $ex->override_end_time && $eStr > $ex->override_start_time)
                ->isNotEmpty();

            if ($isProfBlocked) {
                $current->addMinutes($interval);
                continue;
            }

            // 🍴 C: Colación
            $isLunch = false;
            if ($lunchStartStr && $lunchEndStr) {
                $lStart = $date->copy()->setTimeFrom(Carbon::parse($lunchStartStr));
                $lEnd = $date->copy()->setTimeFrom(Carbon::parse($lunchEndStr));
                if ($current->lt($lEnd) && $slotEnd->gt($lStart)) $isLunch = true;
            }

            if (!$isLunch) {
                $status = $this->getSlotOccupancyStatus($doctor, $current, $slotEnd, $room, $modality);
                if ($status['is_available']) {
                    $slots->push([
                        'start' => $cStr,
                        'end' => $eStr,
                        'room_id' => $roomId,
                        'room_name' => $room?->name,
                        'modality' => $modality,
                        'occupancy' => $status['occupancy'] ?? $status['weight_occupancy'],
                        'capacity' => $status['capacity'] ?? $status['max_weight'],
                    ]);
                }
            }
            $current->addMinutes($interval);
        }
        return $slots;
    }

    /**
     * Sugiere un Box para el profesional en un bloque horario.
     */
    public function getRecommendedRoomForDoctor(Doctor $doctor, Carbon $start, Carbon $end): ?int
    {
        $existingRoomId = Appointment::where('doctor_id', $doctor->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($start, $end) {
                $q->where('start_at', '<', $end)
                  ->where('end_at', '>', $start);
            })
            ->whereNotNull('room_id')
            ->value('room_id');

        return $existingRoomId;
    }

    /**
     * Comprueba si una fecha/bloque está bloqueado (Feriado, Cierre de Centro o Bloqueo de Box).
     */
    protected function isHoliday(Carbon $date, $branchId = null, $startTime = null, $endTime = null, $roomId = null): bool
    {
        $dateStr = $date->format('Y-m-d');

        $query = Holiday::where(function ($q) use ($dateStr) {
                $q->where('date', '<=', $dateStr)
                  ->where(function ($sq) use ($dateStr) {
                      $sq->whereNull('end_date')
                        ->where('date', $dateStr)
                        ->orWhere('end_date', '>=', $dateStr);
                  });
            })
            ->where(function ($q) use ($branchId, $roomId) {
                $q->where(function($sq) use ($branchId) {
                    $sq->whereNull('branch_id');
                    if ($branchId) $sq->orWhere('branch_id', $branchId);
                })
                ->when($roomId, function($sq) use ($roomId) {
                    $sq->orWhere('room_id', $roomId);
                });
            });

        if ($startTime && $endTime) {
            return $query->where(function($q) use ($startTime, $endTime) {
                $q->where(function($sq) {
                    $sq->whereNull('start_time')->whereNull('end_time');
                })
                ->orWhere(function($sq) use ($startTime, $endTime) {
                    $sq->whereNotNull('start_time')
                       ->where('start_time', '<', $endTime)
                       ->where('end_time', '>', $startTime);
                });
            })->exists();
        }

        return $query->exists();
    }

    /**
     * Calcula el estado de ocupación de un slot.
     */
    public function getSlotOccupancyStatus(Doctor $doctor, Carbon $start, Carbon $end, ?Room $room, string $modality = 'onsite', ?int $excludeAppointmentId = null, bool $validateDoctor = true): array
    {
        $doctorMaxCapacity = 3; 

        // 1. Ocupación por Citas
        $appointmentsCount = Appointment::where('doctor_id', $doctor->id)
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->where(function ($q) use ($start, $end) {
                $q->where('start_at', '<', $end)
                  ->where('end_at', '>', $start);
            })
            ->when($excludeAppointmentId, fn($q) => $q->where('id', '!=', $excludeAppointmentId))
            ->count();

        // 2. Ocupación por Sesiones Manuales (sin cita)
        $manualSessionsCount = \App\Models\TreatmentSession::where('doctor_id', $doctor->id)
            ->whereNull('appointment_id')
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->where('date', $start->toDateString())
            ->where(function($q) use ($start, $end) {
                $q->whereTime('time', '<', $end->toTimeString())
                  ->where(DB::raw("ADDTIME(time, '00:45:00')"), '>', $start->toTimeString());
            })
            ->count();

        $totalDoctorOccupancy = $appointmentsCount + $manualSessionsCount;

        if ($validateDoctor && $totalDoctorOccupancy >= $doctorMaxCapacity) {
            return [
                'is_available' => false, 
                'reason' => 'Doctor a máxima capacidad operativa (3 pacientes)',
                'occupancy' => $totalDoctorOccupancy, 
                'capacity' => $doctorMaxCapacity
            ];
        }

        if ($modality === 'onsite' && $room) {
            $totalPeopleInRoom = Appointment::where('room_id', $room->id)
                ->where('modality', 'onsite') 
                ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
                ->where(function ($q) use ($start, $end) {
                    $q->where('start_at', '<', $end)
                      ->where('end_at', '>', $start);
                })
                ->when($excludeAppointmentId, fn($q) => $q->where('id', '!=', $excludeAppointmentId))
                ->count();
            
            $manualRoomPeople = \App\Models\TreatmentSession::where('room_id', $room->id)
                ->whereNull('appointment_id')
                ->where('date', $start->toDateString())
                ->where(function($q) use ($start, $end) {
                    $q->whereTime('time', '<', $end->toTimeString())
                      ->where(DB::raw("ADDTIME(time, '00:45:00')"), '>', $start->toTimeString());
                })
                ->count();

            $totalRoomOccupancy = $totalPeopleInRoom + $manualRoomPeople;

            if ($totalRoomOccupancy >= $room->capacity) {
                return [
                    'is_available' => false, 
                    'reason' => 'Box a máxima capacidad física (' . $room->capacity . ')',
                    'occupancy' => $totalRoomOccupancy, 
                    'capacity' => $room->capacity
                ];
            }
        }

        return [
            'is_available' => true, 
            'weight_occupancy' => $totalDoctorOccupancy, 
            'max_weight' => $doctorMaxCapacity,
            'available_spots' => $doctorMaxCapacity - $totalDoctorOccupancy
        ];
    }

    /**
     * Verifica si el paciente ya tiene una cita o sesión activa en ese bloque.
     */
    public function isPatientAvailable(int $patientId, Carbon $start, Carbon $end, ?int $excludeAppointmentId = null): array
    {
        $patient = \App\Models\Patient::find($patientId);
        if ($patient && $patient->is_wildcard) {
            return ['is_available' => true];
        }

        $overlappingAppointment = Appointment::where('patient_id', $patientId)
            ->where('status', '!=', 'cancelled')
            ->when($excludeAppointmentId, fn($q) => $q->where('id', '!=', $excludeAppointmentId))
            ->where(function ($q) use ($start, $end) {
                $q->where('start_at', '<', $end)
                  ->where('end_at', '>', $start);
            })
            ->first();

        if ($overlappingAppointment) {
            $doctorName = $overlappingAppointment->doctor?->name ?? 'otro profesional';
            $serviceName = $overlappingAppointment->item?->name ?? 'un servicio';
            return [
                'is_available' => false,
                'reason' => "El paciente ya tiene una cita de {$serviceName} con {$doctorName} de {$overlappingAppointment->start_at->format('H:i')} a {$overlappingAppointment->end_at->format('H:i')}."
            ];
        }

        $overlappingSession = \App\Models\TreatmentSession::where('patient_id', $patientId)
            ->whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
            ->where('date', $start->toDateString())
            ->where(function($q) use ($start, $end) {
                $q->whereTime('time', '<', $end->toTimeString())
                  ->where(DB::raw("ADDTIME(time, '00:45:00')"), '>', $start->toTimeString());
            })
            ->with(['doctor', 'item'])
            ->first();

        if ($overlappingSession) {
            $doctorName = $overlappingSession->doctor?->name ?? 'otro profesional';
            $serviceName = $overlappingSession->item?->name ?? 'un servicio';
            return [
                'is_available' => false,
                'reason' => "El paciente tiene una sesión de {$serviceName} activa con {$doctorName} en este horario."
            ];
        }

        return ['is_available' => true];
    }
}
