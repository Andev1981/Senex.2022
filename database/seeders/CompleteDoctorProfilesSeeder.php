<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;

class CompleteDoctorProfilesSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('rut', '76765699-8')->first();
        if (!$company) return;

        $sportBranch = $company->branches()->where('name', 'Chesterton')->first();
        $homeBranch = $sportBranch;

        // 1. Kine Sport Specialist
        $uSport = User::where('email', 'kine.sport@senex.cl')->first();
        if ($uSport) {
            $uSport->doctor()->update([
                'speciality' => 'Kinesiología Deportiva & Traumatología',
                'license_number' => '12345-K',
                'phone' => '+56911112222',
                'birth_date' => '1990-05-20',
                'gender' => 'male',
                'is_active' => true
            ]);
            $uSport->update(['name' => 'Dr. Camilo Sport']);
        }

        // 2. Kine HomeCare Expert
        $uHome = User::where('email', 'kine.domicilio@senex.cl')->first();
        if ($uHome) {
            $uHome->doctor()->update([
                'speciality' => 'Rehabilitación Geriátrica & Domiciliaria',
                'license_number' => '67890-K',
                'phone' => '+56933334444',
                'birth_date' => '1985-11-10',
                'gender' => 'female',
                'is_active' => true
            ]);
            $uHome->update(['name' => 'Dra. Elena HomeCare']);
        }

        $this->command->info('Perfiles de Kinesiólogos completados con éxito.');
    }
}
