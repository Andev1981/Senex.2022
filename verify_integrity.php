<?php

use App\Models\TreatmentSession;
use App\Models\User;
use App\Models\Patient;

echo "--- VERIFICACIÓN DE INTEGRIDAD DE SESIONES ---\\n";

$totalSessions = TreatmentSession::count();
echo "Total Sesiones Migradas: $totalSessions\\n";

// 1. Check Orphan Patients
$orphanPatients = TreatmentSession::whereNull('patient_id')
    ->orWhereDoesntHave('patient')
    ->count();

if ($orphanPatients > 0) {
    echo "[ALERTA] Sesiones sin Paciente válido: $orphanPatients\\n";
} else {
    echo "[OK] Todas las sesiones tienen Paciente asignado.\\n";
}

// 2. Check Orphan Doctors
// doctor_id in TreatmentSession points to User ID (according to our migration logic)
$orphanDoctors = TreatmentSession::whereNull('doctor_id')
    ->orWhereDoesntHave('doctor', function($q) {
        // Here 'doctor' relation in model points to Doctor model via 'doctor_id'?
        // Wait, the migration said foreign key to USERS.
        // But the model says belongsTo(Doctor::class).
        // If the seeder put User ID in doctor_id column...
        // And the model expects Doctor ID...
        // WE MIGHT HAVE A PROBLEM IN THE APPLICATION LOGIC if the model relation is wrong.
        
        // Let's check raw values first.
    })
    ->count();

// Check Raw User existence
$invalidUserIds = TreatmentSession::whereNotNull('doctor_id')
    ->whereNotIn('doctor_id', User::pluck('id'))
    ->count();

if ($invalidUserIds > 0) {
    echo "[ALERTA] Sesiones con doctor_id que NO existe en tabla Users: $invalidUserIds\\n";
} else {
    echo "[OK] Todos los doctor_id apuntan a usuarios existentes.\\n";
}

// 3. Check for Fallback Admin assignments (User ID 1)
$adminSessions = TreatmentSession::where('doctor_id', 1)->count();
if ($adminSessions > 0) {
    echo "[INFO] Sesiones asignadas al Admin (ID 1) por falta de doctor original: $adminSessions\\n";
}

echo "\\n--- VERIFICACIÓN DE MODELO ---\\n";
// Let's verify if the TreatmentSession model relation is aligned with the data
$sample = TreatmentSession::first();
if ($sample) {
    echo "Muestra Sesión ID: " . $sample->id . "\\n";
    echo "Doctor ID (DB Value): " . $sample->doctor_id . "\\n";
    
    // Check if relation works as User
    $user = User::find($sample->doctor_id);
    echo "Usuario asociado: " . ($user ? $user->name : 'NULL') . "\\n";
    
    try {
        // This will fail if the relation expects Doctor model but finds User ID that doesn't match Doctor ID
        // Or if relation is belongsTo(Doctor::class) but FK is to users table.
        // Actually, if we stored UserID in DB, and Model expects Doctor::class, 
        // Eloquent will try to find `select * from doctors where id = $sample->doctor_id`.
        // If UserID 50 exists, but DoctorID 50 does not exist (or is another person), THIS IS BROKEN.
    } catch (
Exception $e) {
        echo "Error al cargar relación: " . $e->getMessage() . "\\n";
    }
}
