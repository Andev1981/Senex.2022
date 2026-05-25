<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Item;

$items = Item::with('serviceDetail')->get();
foreach ($items as $i) {
    echo "Item: {$i->name} (ID: {$i->id}) | Max Sim Patients: " . ($i->serviceDetail?->max_simultaneous_patients ?? 'NULL') . "\n";
}
