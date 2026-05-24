<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Branch;
use App\Models\Availability;
use Carbon\Carbon;

$branches = Branch::all();
foreach ($branches as $branch) {
    echo "--- Branch: {$branch->name} (ID: {$branch->id}) ---\n";
    echo "Is Main: " . ($branch->is_main ? 'YES' : 'NO') . "\n";
    echo "Schedule: " . json_encode($branch->schedule) . "\n";
    
    $avCount = Availability::where('branch_id', $branch->id)->count();
    echo "Availabilities count: {$avCount}\n\n";
}

$date = Carbon::now();
$dayOfWeek = strtoupper(substr($date->englishDayOfWeek, 0, 2));
echo "Today: " . $dayOfWeek . "\n";
