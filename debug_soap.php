<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TreatmentSession;

$sessions = TreatmentSession::limit(5)->get();
foreach ($sessions as $s) {
    echo "ID: {$s->id} - Status: {$s->status->value}\n";
    echo "  Subjective: " . ($s->subjective ?? 'NULL') . "\n";
    echo "  Objective: " . ($s->objective ?? 'NULL') . "\n";
    echo "  Assessment: " . ($s->assessment ?? 'NULL') . "\n";
    echo "  Plan: " . ($s->plan ?? 'NULL') . "\n";
    echo "  Notes: " . ($s->notes ?? 'NULL') . "\n";
    echo "---------------------------------\n";
}
