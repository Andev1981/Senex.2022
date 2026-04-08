<?php

use App\Models\User;
use App\Models\Doctor;
use App\Models\Address;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

DB::beginTransaction();
try {
    $time = time();
    $email = 'kine_test_'.$time.'@senex.cl';
    $rut = substr($time, 0, 8).'-'.substr($time, -1);

    echo "--- 1. Creando Usuario ---\n";
    $user = User::create([
        'company_id' => 2,
        'name' => 'Kine Prueba',
        'email' => $email,
        'password' => Hash::make($rut),
    ]);
    echo "User ID: {$user->id}\n";

    echo "--- 2. Asignando Rol ---\n";
    if (!Role::where('name', 'kine')->exists()) {
        Role::create(['name' => 'kine']);
    }
    $user->assignRole('kine');
    echo "Rol 'kine' asignado.\n";

    echo "--- 3. Creando Doctor ---\n";
    $doctor = Doctor::create([
        'company_id' => 2,
        'user_id' => $user->id,
        'name' => 'Kine',
        'last_name' => 'Prueba',
        'rut' => $rut,
        'email' => $email,
        'phone' => '+56900000000'
    ]);
    echo "Doctor ID: {$doctor->id}\n";

    echo "--- 4. Creando Dirección ---\n";
    $doctor->address()->create([
        'street' => 'Calle de Prueba',
        'number' => '999',
        'commune_id' => 13101, // Santiago Centro
        'type' => 'home',
        'is_primary' => true
    ]);
    echo "Dirección creada.\n";

    echo "--- 5. Vinculando a Sucursal ---\n";
    $branch = Branch::where('company_id', 2)->first();
    if ($branch) {
        $doctor->branches()->sync([$branch->id => ['status' => 'active']]);
        echo "Vinculado a Sucursal: {$branch->name}\n";
    }

    DB::commit();
    echo "\nPRUEBA EXITOSA: Usuario y Doctor creados correctamente.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
