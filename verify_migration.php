<?php

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Support\Facades\DB;

echo "--- CONTEOS ---\\n";
echo 'Users: ' . User::count() . "\\n";
echo 'Patients: ' . Patient::count() . "\\n";
echo 'Doctors: ' . Doctor::count() . "\\n";

echo "\\n--- USUARIOS CON MÁS PACIENTES (Detectar duplicidad) ---\\n";
$topUsers = Patient::select('user_id', DB::raw('count(*) as total'))
    ->groupBy('user_id')
    ->orderByDesc('total')
    ->limit(10)
    ->get();

foreach($topUsers as $u) {
    if ($u->total > 1) {
        $user = User::find($u->user_id);
        echo "User ID {$u->user_id} ({$user->email}) tiene {$u->total} pacientes asociados.\\n";
    }
}

echo "\\n--- DOCTORES VS USUARIOS (Muestreo) ---\\n";
$docs = Doctor::with('user')->limit(10)->get();
foreach($docs as $d) {
    echo "Doc: {$d->name} {$d->last_name} (RUT: {$d->rut}) | User: " . ($d->user->name ?? 'N/A') . " (Email: " . ($d->user->email ?? 'N/A') . ")\\n";
}

