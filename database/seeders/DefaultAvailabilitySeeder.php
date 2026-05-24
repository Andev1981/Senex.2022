<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\Branch;
use App\Models\Availability;
use App\Models\Room;

class DefaultAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::where('name', 'Chesterton')->first();
        if (!$branch) return;

        $doctors = Doctor::all();
        $rooms = $branch->rooms;

        foreach ($doctors as $index => $doctor) {
            // Asignar un Box preferente (ciclando si hay pocos)
            $room = $rooms->count() > 0 ? $rooms[$index % $rooms->count()] : null;

            // Horario de Lunes a Viernes 09:00 a 18:00
            Availability::create([
                'company_id' => $branch->company_id,
                'branch_id' => $branch->id,
                'room_id' => $room?->id,
                'doctor_id' => $doctor->id,
                'rrule' => 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
                'modality' => 'onsite',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'lunch_start_time' => '13:00',
                'lunch_end_time' => '14:00',
                'is_active' => true,
            ]);
        }
    }
}
