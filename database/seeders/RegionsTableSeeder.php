<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Region;

class RegionsTableSeeder extends Seeder
{
  public function run(): void
  {
    $regions = [
      // id, code, name, roman
      [1, '01', 'Región de Tarapacá', 'I'],
      [2, '02', 'Región de Antofagasta', 'II'],
      [3, '03', 'Región de Atacama', 'III'],
      [4, '04', 'Región de Coquimbo', 'IV'],
      [5, '05', 'Región de Valparaíso', 'V'],
      [6, '06', 'Región del Libertador General Bernardo O’Higgins', 'VI'],
      [7, '07', 'Región del Maule', 'VII'],
      [8, '08', 'Región del Biobío', 'VIII'],
      [9, '09', 'Región de La Araucanía', 'IX'],
      [10, '10', 'Región de Los Lagos', 'X'],
      [11, '11', 'Región de Aysén del General Carlos Ibáñez del Campo', 'XI'],
      [12, '12', 'Región de Magallanes y de la Antártica Chilena', 'XII'],
      [13, '13', 'Región Metropolitana de Santiago', 'RM'],
      [14, '14', 'Región de Los Ríos', 'XIV'],
      [15, '15', 'Región de Arica y Parinacota', 'XV'],
      [16, '16', 'Región de Ñuble', 'XVI'],
    ];

    foreach ($regions as [$id, $code, $name, $roman]) {
      Region::updateOrCreate(['id' => $id], compact('code', 'name', 'roman') + ['id' => $id]);
    }
  }
}
