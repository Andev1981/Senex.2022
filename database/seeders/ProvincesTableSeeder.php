<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Province;

class ProvincesTableSeeder extends Seeder
{
  public function run(): void
  {
    // id, region_id, code, name
    $provinces = [
      [1101, 15, '011', 'Arica'],
      [1102, 15, '014', 'Parinacota'],
      [1201, 1, '021', 'Iquique'],
      [1202, 1, '022', 'Tamarugal'],
      [1301, 2, '031', 'Antofagasta'],
      [1302, 2, '032', 'El Loa'],
      [1303, 2, '033', 'Tocopilla'],
      [1401, 3, '041', 'Copiapó'],
      [1402, 3, '042', 'Chañaral'],
      [1403, 3, '043', 'Huasco'],
      [1501, 4, '051', 'Elqui'],
      [1502, 4, '052', 'Choapa'],
      [1503, 4, '053', 'Limarí'],
      [1601, 5, '061', 'Valparaíso'],
      [1602, 5, '062', 'Isla de Pascua'],
      [1603, 5, '063', 'Los Andes'],
      [1604, 5, '064', 'Petorca'],
      [1605, 5, '065', 'Quillota'],
      [1606, 5, '066', 'San Antonio'],
      [1607, 5, '067', 'San Felipe de Aconcagua'],
      [1608, 5, '068', 'Marga Marga'],
      [1701, 6, '071', 'Cachapoal'],
      [1702, 6, '072', 'Cardenal Caro'],
      [1703, 6, '073', 'Colchagua'],
      [1801, 7, '081', 'Talca'],
      [1802, 7, '082', 'Cauquenes'],
      [1803, 7, '083', 'Curicó'],
      [1804, 7, '084', 'Linares'],
      [1901, 8, '091', 'Concepción'],
      [1902, 8, '092', 'Arauco'],
      [1903, 8, '093', 'Biobío'],
      [1904, 8, '094', 'Ñuble (hist)'],
      [2001, 9, '101', 'Cautín'],
      [2002, 9, '102', 'Malleco'],
      [2101, 10, '111', 'Llanquihue'],
      [2102, 10, '112', 'Chiloé'],
      [2103, 10, '113', 'Osorno'],
      [2104, 10, '114', 'Palena'],
      [2201, 11, '121', 'Coyhaique'],
      [2202, 11, '122', 'Aysén'],
      [2203, 11, '123', 'General Carrera'],
      [2204, 11, '124', 'Capitán Prat'],
      [2301, 12, '131', 'Magallanes'],
      [2302, 12, '132', 'Antártica Chilena'],
      [2303, 12, '133', 'Tierra del Fuego'],
      [2304, 12, '134', 'Última Esperanza'],
      [2401, 13, '141', 'Santiago'],
      [2402, 13, '142', 'Cordillera'],
      [2403, 13, '143', 'Chacabuco'],
      [2404, 13, '144', 'Maipo'],
      [2405, 13, '145', 'Melipilla'],
      [2406, 13, '146', 'Talagante'],
      [2501, 14, '151', 'Valdivia'],
      [2502, 14, '152', 'Ranco'],
      [2601, 16, '161', 'Diguillín'],
      [2602, 16, '162', 'Itata'],
      [2603, 16, '163', 'Punilla'],
    ];

    foreach ($provinces as [$id, $region_id, $code, $name]) {
      Province::updateOrCreate(['id' => $id], compact('region_id', 'code', 'name') + ['id' => $id]);
    }
  }
}
