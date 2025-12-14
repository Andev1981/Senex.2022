<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  public function run(): void
  {
    $this->call(DiagnosticSeeder::class);
    $this->call(RegionsTableSeeder::class);
    $this->call(ProvincesTableSeeder::class);
    $this->call(CommunesTableSeeder::class);
    $this->call(TenantWithDemoDataSeeder::class);
    $this->call(InsuranceSeeder::class);
  }
}
