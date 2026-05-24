<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\Company;
use App\Models\AvailabilityException;

class SpecialOpeningSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = Doctor::first();
        $company = Company::first();

        if ($doctor && $company) {
            AvailabilityException::create([
                'company_id' => $company->id,
                'doctor_id' => $doctor->id,
                'date' => now()->toDateString(),
                'action' => 'open',
                'override_start_time' => '09:00',
                'override_end_time' => '21:00',
                'reason' => 'Apertura especial de prueba (Hoy)',
            ]);
        }
    }
}
