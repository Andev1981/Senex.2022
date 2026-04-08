<?php

use App\Models\Patient;
use App\Models\Address;
use App\Models\Branch;
use App\Models\PatientContact;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

DB::beginTransaction();
try {
    $time = time();
    $rut = substr($time, 0, 8).'-'.substr($time, -1);
    $email = 'patient_test_'.$time.'@senex.cl';

    echo "--- 1. Creando Paciente ---\n";
    $patient = Patient::create([
        'company_id' => 2,
        'name' => 'Paciente Prueba',
        'last_name' => 'Tinker',
        'rut' => $rut,
        'email' => $email,
        'birth_date' => '1995-05-15',
        'gender' => \App\Enums\GenderEnum::MALE,
        'phone' => '+56911112222',
        'status' => 'active',
        'require_tutor' => true
    ]);
    echo "Patient ID: {$patient->id}\n";

    echo "--- 2. Creando Dirección ---\n";
    $patient->address()->create([
        'street' => 'Avenida Siempre Viva',
        'number' => '742',
        'commune_id' => 13101, // Santiago Centro
        'type' => 'home',
        'is_primary' => true
    ]);
    echo "Dirección creada.\n";

    echo "--- 3. Creando Tutor (Contacto) ---\n";
    PatientContact::create([
        'patient_id' => $patient->id,
        'name' => 'Tutor de Prueba',
        'relationship' => 'Parent',
        'phone' => '+56933334444',
        'email' => 'tutor@test.cl',
        'is_primary' => true
    ]);
    echo "Tutor creado.\n";

    echo "--- 4. Vinculando a Sucursal ---\n";
    $branch = Branch::where('company_id', 2)->first();
    if ($branch) {
        $patient->branches()->sync([$branch->id => ['status' => 'active']]);
        echo "Vinculado a Sucursal: {$branch->name}\n";
    }

    DB::commit();
    echo "\nPRUEBA EXITOSA: Paciente creado correctamente con dirección y tutor.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
