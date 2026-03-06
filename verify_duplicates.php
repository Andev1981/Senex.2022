<?php

use App\Models\Patient;
use Illuminate\Support\Facades\DB;

echo "--- VERIFICACIÓN DE DUPLICADOS DE NOMBRE ---\\n";

$duplicates = Patient::select('name', 'last_name', DB::raw('count(*) as count'))
    ->groupBy('name', 'last_name')
    ->having('count', '>', 1)
    ->get();

if ($duplicates->isEmpty()) {
    echo "NO se encontraron pacientes con el mismo Nombre y Apellido duplicados.\\n";
    echo "La lógica de fusión funcionó correctamente.\\n";
} else {
    echo "Se encontraron " . $duplicates->count() . " nombres duplicados que NO se fusionaron:\\n";
    foreach ($duplicates as $d) {
        echo "- {$d->name} {$d->last_name} ({$d->count} veces)\\n";
        // Mostrar los RUTs de estos duplicados para ver por qué no se fusionaron (quizás lógica falló o no entraron al 'if')
        $pats = Patient::where('name', $d->name)->where('last_name', $d->last_name)->get();
        foreach($pats as $p) {
            echo "  > ID: {$p->id}, RUT: {$p->rut}, UserID: {$p->user_id}\\n";
        }
    }
}

