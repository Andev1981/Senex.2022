<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TreatmentSession;
use App\Models\Doctor;

$sessions = TreatmentSession::with('doctor')->get();
foreach ($sessions as $s) {
    echo "ID: {$s->id} - Status: {$s->status->value} - Doctor: " . ($s->doctor->full_name ?? 'N/A') . " (ID: {$s->doctor_id})\n";
    echo "  Subjective: " . ($s->subjective ?? 'NULL') . "\n";
    echo "---------------------------------\n";
}

echo "\nAvailable Doctors:\n";
foreach (Doctor::all() as $d) {
    echo "Doctor: {$d->full_name} (ID: {$d->id}) - User ID: {$d->user_id}\n";
}
