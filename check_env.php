<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
echo 'DB_HOST=' . env('DB_HOST') . PHP_EOL;
echo 'DB_PORT=' . env('DB_PORT') . PHP_EOL;
echo 'DB_DATABASE=' . env('DB_DATABASE') . PHP_EOL;
echo 'DB_USERNAME=' . env('DB_USERNAME') . PHP_EOL;
echo 'DB_PASSWORD=' . env('DB_PASSWORD') . PHP_EOL;
