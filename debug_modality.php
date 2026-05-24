<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Branch;

$branch = Branch::where('is_main', true)->first();
echo "Branch: " . $branch->name . "\n";
echo "Allows Onsite: " . ($branch->allows_onsite ? 'YES' : 'NO') . "\n";
echo "Allows Home: " . ($branch->allows_home ? 'YES' : 'NO') . "\n";
echo "Allows Online: " . ($branch->allows_online ? 'YES' : 'NO') . "\n";
echo "Schedule: " . json_encode($branch->schedule) . "\n";
