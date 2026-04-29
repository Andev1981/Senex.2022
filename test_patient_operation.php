<?php

use App\Models\User;
use App\Models\Patient;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\Patients\PatientAdminController;
use App\Http\Requests\StorePatientRequest;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simular un usuario Admin logueado
$admin = User::role('admin')->first() ?: User::first();
auth()->login($admin);

// Configurar sesión de sucursal Home Care (ID 3)
session(['active_branch_id' => 3, 'current_company_id' => 2]);

echo "--- INICIANDO PRUEBA DE OPERACIÓN DE PACIENTES ---\n";
echo "Sucursal Activa: " . Branch::find(3)->name . " (Home Care Only: " . (Branch::find(3)->is_home_care_only ? 'SI' : 'NO') . ")\n\n";

/**
 * Caso 1: Intentar crear adulto SIN dirección (Debe fallar por validación)
 */
echo "CASO 1: Adulto sin dirección en sucursal Home Care...\n";
try {
    $data = [
        'name' => 'Prueba Fallida',
        'last_name' => 'Adulto',
        'rut' => '11111111-1',
        'email' => 'fallo@test.cl',
        'birth_date' => '1990-01-01',
        'require_tutor' => false,
        'send_welcome_notification' => true,
        // Omitimos street, number, commune_id
    ];

    // Simulamos el Request para que dispare la validación
    $request = StorePatientRequest::create('/patients', 'POST', $data);
    $request->setContainer($app)->setRedirector($app->make('redirect'));
    
    // Forzamos la validación manual
    $validator = Validator::make($data, (new StorePatientRequest())->rules(), (new StorePatientRequest())->messages());
    
    if ($validator->fails()) {
        echo "RESULTADO: Bloqueado correctamente. Errores: " . implode(', ', $validator->errors()->all()) . "\n";
    } else {
        echo "RESULTADO: ERROR - La validación no bloqueó la falta de dirección.\n";
    }
} catch (\Exception $e) {
    echo "ERROR INESPERADO: " . $e->getMessage() . "\n";
}

echo "\n------------------------------------------------\n";

/**
 * Caso 2: Crear MENOR DE EDAD con dirección y tutor (Debe pasar)
 */
echo "CASO 2: Menor de edad con dirección y tutor...\n";
DB::beginTransaction();
try {
    $time = time();
    $base_rut = substr($time, 0, 8);
    
    // Función simple para dígito verificador
    $s=0;$m=2;for($i=strlen($base_rut)-1;$i>=0;$i--){$s+=$base_rut[$i]*$m;$m=$m==7?2:$m+1;}$d=11-($s%11);$dv=$d==11?0:($d==10?'K':$d);
    $rut = $base_rut."-".$dv;
    
    $data = [
        'name' => 'Niño Prueba',
        'last_name' => 'Tinker',
        'rut' => $rut,
        'email' => 'niño@test.cl',
        'birth_date' => '2015-05-20', // Menor de edad
        'require_tutor' => true,
        'send_welcome_notification' => true,
        'guardian_name' => 'Tutor Responsable',
        'guardian_relationship' => 'padre',
        'guardian_phone' => '+56911112222',
        'guardian_email' => 'tutor@test.cl',
        'guardian_rut' => '22222222-2',
        // Dirección obligatoria
        'street' => 'Calle Falsa',
        'number' => '123',
        'commune_id' => 13101, // Santiago Centro
    ];

    $controller = app(PatientAdminController::class);
    
    // Crear el StorePatientRequest correctamente con los datos
    $storeRequest = new StorePatientRequest();
    $storeRequest->merge($data);
    $storeRequest->setContainer($app);
    
    // Configurar el validador manualmente
    $validator = Validator::make($data, $storeRequest->rules(), $storeRequest->messages());
    $storeRequest->setValidator($validator);
    
    // Ejecutamos el store
    $response = $controller->store($storeRequest);
    
    $patient = Patient::where('rut', $rut)->first();
    if ($patient) {
        echo "RESULTADO: ÉXITO - Paciente ID {$patient->id} creado.\n";
        echo "Tutor registrado: " . ($patient->primaryContact ? 'SI' : 'NO') . "\n";
        echo "Dirección registrada: " . ($patient->address ? 'SI (' . $patient->address->street . ')' : 'NO') . "\n";
    } else {
        echo "RESULTADO: FALLO - El paciente no se creó.\n";
    }
    
    DB::rollBack(); // No queremos ensuciar la DB real en la prueba
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- FIN DE LAS PRUEBAS ---\n";
