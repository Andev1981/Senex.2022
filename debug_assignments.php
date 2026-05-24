<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use App\Models\Patient;

$doctors = Doctor::all();
foreach ($doctors as $d) {
    echo "Doctor: {$d->full_name} (ID: {$d->id})\n";
    echo "  Assigned Patients: " . $d->patients()->count() . "\n";
    foreach ($d->patients as $p) {
        echo "    - {$p->full_name} (ID: {$p->id})\n";
    }
}
