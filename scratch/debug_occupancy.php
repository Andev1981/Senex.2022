<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Appointment;
use App\Models\TreatmentSession;
use Carbon\Carbon;

echo "=== APPOINTMENTS FOR TODAY ===\n";
$appts = Appointment::whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
    ->with(['doctor', 'item.serviceDetail'])
    ->get();

foreach ($appts as $a) {
    $weight = ($a->item?->serviceDetail?->max_simultaneous_patients == 1) ? 3 : 1;
    echo "Apt ID: {$a->id} | Patient: {$a->patient_name} | Doctor ID: {$a->doctor_id} ({$a->doctor?->full_name}) | Status: {$a->status->value} | Start: {$a->start_at} | End: {$a->end_at} | Weight: {$weight} (Max Sim: " . ($a->item?->serviceDetail?->max_simultaneous_patients ?? 'null') . ")\n";
}

echo "\n=== TREATMENT SESSIONS FOR TODAY ===\n";
$sessions = TreatmentSession::whereNotIn('status', [\App\Enums\AppointmentStatusEnum::CANCELLED, \App\Enums\AppointmentStatusEnum::NO_SHOW])
    ->with(['doctor', 'item.serviceDetail'])
    ->get();

foreach ($sessions as $s) {
    $weight = ($s->item?->serviceDetail?->max_simultaneous_patients == 1) ? 3 : 1;
    echo "Sess ID: {$s->id} | Apt ID: {$s->appointment_id} | Doctor ID: {$s->doctor_id} | Status: {$s->status->value} | Date: {$s->date->toDateString()} | Time: {$s->time->format('H:i:s')} | Weight: {$weight}\n";
}
