<?php

namespace App\Services;

use App\Models\Availability;
use App\Models\AvailabilityException;
use App\Models\Holiday;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AgendaService
{
    /**
     * Genera los slots disponibles para un doctor en una fecha específica.
     */
    public function isDoctorOnDuty(Doctor $doctor, Carbon $start, Carbon $end): bool
    {
        $date = $start->copy()->startOfDay();
        $dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2)); // MO, TU, etc
        
        // 1. Verificar si es feriado
        if ($this->isHoliday($date)) return false;

        // 2. Verificar excepciones
        $exception = AvailabilityException::where('doctor_id', $doctor->id)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        if ($exception && $exception->action === 'cancel') return false;

        // 3. Obtener disponibilidad recurrente
        $availabilities = Availability::where('doctor_id', $doctor->id)
            ->where('is_active', true)
            ->where('rrule', 'like', "%BYDAY%{$dayOfWeek}%")
            ->get();

        foreach ($availabilities as $av) {
            $startTime = $av->start_time;
            $endTime = $av->end_time;
            $lunchStart = $av->lunch_start_time;
            $lunchEnd = $av->lunch_end_time;

            if ($exception && $exception->action === 'override') {
                $startTime = $exception->override_start_time;
                $endTime = $exception->override_end_time;
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

                return true;
            }
        }

        return false;
    }

    public function getAvailableSlots(Doctor $doctor, Carbon $date, $branchId = null): Collection
    {
        $branchId = $branchId ?: session('active_branch_id');
        
        // 1. Verificar si es feriado (Global o por Sucursal)
        if ($this->isHoliday($date, $branchId)) {
            return collect([]);
        }

        // 2. Verificar excepciones del profesional (Cancelaciones de día completo)
        $exception = AvailabilityException::where('doctor_id', $doctor->id)
            ->where('date', $date->format('Y-m-d'))
            ->first();

        if ($exception && $exception->action === 'cancel') {
            return collect([]);
        }

        // 3. Obtener disponibilidad recurrente para el día de la semana
        $dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2)); // MO, TU, WE, TH, FR, SA, SU
        
        $availabilities = Availability::where('doctor_id', $doctor->id)
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->where('rrule', 'like', "%BYDAY%{$dayOfWeek}%")
            ->with('room')
            ->get();

        if ($availabilities->isEmpty()) {
            return collect([]);
        }

        $slots = collect([]);

        foreach ($availabilities as $availability) {
            $startTimeStr = $availability->start_time;
            $endTimeStr = $availability->end_time;
            $lunchStartStr = $availability->lunch_start_time;
            $lunchEndStr = $availability->lunch_end_time;

            // 4. Aplicar override de horario si existe una excepción de tipo 'override'
            if ($exception && $exception->action === 'override') {
                $startTimeStr = $exception->override_start_time;
                $endTimeStr = $exception->override_end_time;
                // En un override puntual, asumimos que el kine gestiona su lunch manualmente o no hay
                $lunchStartStr = null;
                $lunchEndStr = null;
            }

            // 5. Generar bloques de tiempo (Intervalo de 30 min por defecto)
            $interval = 30; 
            $current = $date->copy()->setTimeFrom(Carbon::parse($startTimeStr));
            $endLimit = $date->copy()->setTimeFrom(Carbon::parse($endTimeStr));

            while ($current->lessThan($endLimit)) {
                $slotEnd = $current->copy()->addMinutes($interval);
                
                // Si el slot se pasa del fin de la jornada, lo cortamos
                if ($slotEnd->greaterThan($endLimit)) break;

                // 🍴 VERIFICACIÓN DE COLACIÓN / LUNCH
                $isLunchTime = false;
                if ($lunchStartStr && $lunchEndStr) {
                    $lunchStart = $date->copy()->setTimeFrom(Carbon::parse($lunchStartStr));
                    $lunchEnd = $date->copy()->setTimeFrom(Carbon::parse($lunchEndStr));
                    
                    // Si el bloque de tiempo (slot) se solapa con el horario de colación
                    if ($current->lt($lunchEnd) && $slotEnd->gt($lunchStart)) {
                        $isLunchTime = true;
                    }
                }

                if (!$isLunchTime) {
                    // 6. Verificar ocupación (Profesional y Room)
                    $availabilityStatus = $this->getSlotOccupancyStatus(
                        $doctor, 
                        $current, 
                        $slotEnd, 
                        $availability->room,
                        $availability->modality->value ?? 'onsite'
                    );

                    if ($availabilityStatus['is_available']) {
                        $slots->push([
                            'start' => $current->format('H:i'),
                            'end' => $slotEnd->format('H:i'),
                            'room_id' => $availability->room_id,
                            'room_name' => $availability->room?->name,
                            'modality' => $availability->modality->value ?? 'onsite',
                            'occupancy' => $availabilityStatus['occupancy'],
                            'capacity' => $availabilityStatus['capacity'],
                        ]);
                    }
                }
                
                $current->addMinutes($interval);
            }
        }

        return $slots->sortBy('start')->values();
    }

    /**
     * Comprueba si una fecha es feriado.
     */
    protected function isHoliday(Carbon $date, $branchId = null): bool
    {
        return Holiday::where('date', $date->format('Y-m-d'))
            ->where(function ($q) use ($branchId) {
                $q->whereNull('branch_id');
                if ($branchId) {
                    $q->orWhere('branch_id', $branchId);
                }
            })
            ->exists();
    }

    /**
     * Calcula el estado de ocupación de un slot.
     * Regla de Oro 1: Máximo 3 sesiones simultáneas por profesional (Independiente del Box).
     * Regla de Oro 2: No exceder la capacidad física del Box asignado.
     */
    protected function getSlotOccupancyStatus(Doctor $doctor, Carbon $start, Carbon $end, ?Room $room, string $modality = 'onsite'): array
    {
        // 1. Ocupación del profesional en este bloque horario (en cualquier box o domicilio)
        $doctorAppointmentsCount = Appointment::where('doctor_id', $doctor->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($start, $end) {
                $q->where('start_at', '<', $end)
                  ->where('end_at', '>', $start);
            })
            ->count();

        // Límite de 3 sesiones por profesional (Capacidad Operativa Humana)
        $doctorMaxCapacity = 3;
        
        if ($doctorAppointmentsCount >= $doctorMaxCapacity) {
            return [
                'is_available' => false, 
                'reason' => 'Doctor a máxima capacidad',
                'occupancy' => $doctorAppointmentsCount, 
                'capacity' => $doctorMaxCapacity
            ];
        }

        // 2. Ocupación del Box en este bloque horario (SOLO si es Modalidad Presencial)
        if ($modality === 'onsite' && $room) {
            $roomOccupancy = Appointment::where('room_id', $room->id)
                ->where('modality', 'onsite') // Solo cuentan las citas que ocupan box físico
                ->where('status', '!=', 'cancelled')
                ->where(function ($q) use ($start, $end) {
                    $q->where('start_at', '<', $end)
                      ->where('end_at', '>', $start);
                })
                ->count();

            // Si el box está lleno (independiente de quién atienda)
            if ($roomOccupancy >= $room->capacity) {
                return [
                    'is_available' => false, 
                    'reason' => 'Box a máxima capacidad',
                    'occupancy' => $roomOccupancy, 
                    'capacity' => $room->capacity
                ];
            }
            
            // La capacidad disponible es el mínimo entre lo que le queda al doctor y lo que le queda al box
            $remainingDoctor = $doctorMaxCapacity - $doctorAppointmentsCount;
            $remainingRoom = $room->capacity - $roomOccupancy;
            
            return [
                'is_available' => true, 
                'occupancy' => $roomOccupancy,
                'capacity' => $room->capacity,
                'available_spots' => min($remainingDoctor, $remainingRoom)
            ];
        }

        // Si es HOME, solo importa la capacidad del Doctor
        return [
            'is_available' => true, 
            'occupancy' => $doctorAppointmentsCount, 
            'capacity' => $doctorMaxCapacity,
            'available_spots' => $doctorMaxCapacity - $doctorAppointmentsCount
        ];
    }
}
