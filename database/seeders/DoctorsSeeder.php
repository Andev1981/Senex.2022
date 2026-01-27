<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Doctor;
use App\Models\Company;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class DoctorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_CL');
        $sqlFilePath = base_path('doctors_202601211702.sql');
        $sqlContent = file_get_contents($sqlFilePath);

        // Regex to extract values from INSERT statements
        preg_match_all(
            '/INSERT INTO public\.doctors \((.*?)\) VALUES\s*\((.*?)\);/',
            $sqlContent,
            $matches,
            PREG_SET_ORDER
        );

        // Get the first available company and branch from the system
        $company = Company::first();
        $branch = Branch::first();

        if (!$company || !$branch) {
            $this->command->error('No company or branch found. Please ensure your initial seed creates at least one company and branch.');
            return;
        }

        $this->command->info('Seeding doctors from SQL file...');

        foreach ($matches as $match) {
            $columns = array_map('trim', explode(',', $match[1]));
            $valuesRaw = explode('),(', $match[2]);

            foreach ($valuesRaw as $valueString) {
                // Remove leading/trailing parentheses and process each value
                $valueString = trim($valueString, '()');
                // Split by comma, but not inside single quotes (for string values)
                preg_match_all('/\'([^\']*?)\'|NULL|([0-9\.-]+)/', $valueString, $valueMatches);
                
                $values = [];
                foreach ($valueMatches[0] as $val) {
                    if ($val === 'NULL') {
                        $values[] = null;
                    } elseif (Str::startsWith($val, "'") && Str::endsWith($val, "'")) {
                        $values[] = trim($val, "'");
                    } else {
                        $values[] = $val;
                    }
                }

                $doctorData = array_combine($columns, $values);

                // --- Map SQL data to model's fillable attributes ---
                $name = $doctorData['name'] ?? 'Doctor';
                $lastName = $doctorData['last_name'] ?? 'Apellido';
                $rut = $doctorData['rut'] ?? $faker->unique()->numerify('########-') . $faker->randomLetter();
                $email = $faker->unique()->safeEmail(); // Generate unique email
                $phone = $doctorData['phone'] ?? $faker->phoneNumber();
                $birthDate = $doctorData['birth'] ?? null; // Map 'birth' to 'birth_date'
                $status = $doctorData['status'] ?? 1; // Default to active if not provided

                // Create a User for the Doctor
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name . ' ' . $lastName,
                        'password' => bcrypt('password'), // Default password
                        'email_verified_at' => now(),
                        'company_id' => $company->id,
                    ]
                );
                $user->assignRole('doctor'); // Assign doctor role

                try {
                    $doctor = Doctor::firstOrCreate(
                        ['rut' => $rut], // Prevent duplicate doctors by RUT
                        [
                            'user_id' => $user->id,
                            'name' => $name,
                            'last_name' => $lastName,
                            'rut' => $rut,
                            'email' => $email, // Use the generated email
                            'phone' => $phone,
                            'birth_date' => $birthDate,
                            'speciality' => $faker->jobTitle(), // Assign a random speciality
                            'gender' => $faker->randomElement(['male', 'female', 'other']), // Assign random gender
                            'status' => $status,
                            'created_at' => $doctorData['created_at'] ?? now(),
                            'updated_at' => $doctorData['updated_at'] ?? now(),
                        ]
                    );

                    // Attach doctor to the company and branch
                    $doctor->companies()->syncWithoutDetaching([$company->id => [
                        'tarifa_acordada' => $faker->numberBetween(10000, 50000),
                        'porcentaje_comision' => $faker->randomFloat(2, 0.1, 0.5),
                        'estado_convenio' => 'activo',
                    ]]);

                    $doctor->branches()->syncWithoutDetaching([$branch->id => [
                        'status' => $status ? 'active' : 'inactive',
                        'mobile_app_access' => true,
                    ]]);

                } catch (	hrowable $e) {
                    $this->command->error("Error seeding doctor with RUT {$rut}: " . $e->getMessage());
                }
            }
        }

        $this->command->info('Doctors seeded successfully!');
    }
}