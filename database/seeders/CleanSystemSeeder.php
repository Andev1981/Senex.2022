<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Treatment;
use App\Models\TreatmentSession;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CleanSystemSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Iniciando limpieza total del sistema...');

        // Desactivar checks de llaves foráneas para truncar
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. Limpiar Tablas Operacionales
        Payment::truncate();
        Invoice::truncate();
        TreatmentSession::truncate();
        Treatment::truncate();
        Patient::truncate();
        Doctor::truncate();
        User::truncate();
        Branch::truncate();
        Company::truncate();
        
        // Limpiar tablas pivot y relacionadas
        DB::table('branch_user')->truncate();
        DB::table('branch_patient')->truncate();
        DB::table('branch_doctor')->truncate();
        DB::table('doctor_patient_assignments')->truncate();
        DB::table('model_has_roles')->truncate();

        // 2. Crear Empresa SENEX
        $company = Company::create([
            'rut' => '76765699-8',
            'business_name' => 'Senex SPA',
            'business_type' => 'clinical',
            'giro' => 'Servicios de Kinesiología',
            'email' => 'senex@senex.cl',
            'phone' => '+56900000000'
        ]);

        // 3. Crear Sucursal Única (Requerida por el sistema)
        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => 'Chesterton',
            'codigo_sucursal_sii' => '0',
            'is_main' => true,
            'active' => true,
            'email' => 'chesterton@senex.cl',
        ]);

        $this->command->info('Empresa Senex y sucursal Chesterton creadas.');

        // 4. Configurar Usuarios Administrativos (Minimalista: 1 Superadmin, 1 Admin)
        $admins = [
            [
                'name' => 'Juan Andrés (Superadmin)',
                'email' => 'javt1981@gmail.com',
                'password' => 'senex2026',
                'role' => 'superadmin'
            ],
            [
                'name' => 'Mónica Fagres (Admin)',
                'email' => 'mfagres@gmail.com',
                'password' => 'senex2026',
                'role' => 'admin'
            ]
        ];

        foreach ($admins as $adminData) {
            $user = User::create([
                'company_id' => $company->id,
                'name' => $adminData['name'],
                'email' => $adminData['email'],
                'password' => Hash::make($adminData['password']),
                'is_active' => true,
            ]);

            $user->assignRole($adminData['role']);
            $user->branches()->sync([$branch->id]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Limpieza completada. Solo quedan los usuarios administradores en Senex.');
    }
}
