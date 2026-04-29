<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Gestión de Pacientes
            'patients.index', 'patients.create', 'patients.edit', 'patients.delete', 'patients.view',
            
            // Gestión Clínica (Kinesiología)
            'doctors.index', 'doctors.create', 'doctors.edit', 'doctors.delete',
            'attendances.index', 'attendances.manage',
            'session-types.index', 'session-types.manage',
            'treatments.index', 'treatments.manage',
            'sessions.index', 'sessions.manage',
            
            // Finanzas y Facturación
            'invoices.index', 'invoices.view', 'invoices.cancel', 'invoices.pdf',
            'payments.index', 'payments.process', 'payments.pdf',
            'dte.issue', 'dte.status', 'dte.lookup',
            'payrolls.index', 'payrolls.manage',
            'finance.receivables.index',
            
            // Administración y Configuración
            'companies.index', 'companies.manage',
            'branches.index', 'branches.manage',
            'agreements.index', 'agreements.manage',
            'insurances.index', 'insurances.manage',
            'acquisitions.suppliers.index', 'acquisitions.purchase-orders.index',
            'products.index', 'categories.index',
            
            // Configuración del Sistema
            'admin.users-management.index',
            'subscription.index',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Asignar todos los permisos al rol superadmin
        $superadmin = Role::where('name', 'superadmin')->first();
        if ($superadmin) {
            $superadmin->syncPermissions(Permission::all());
        }

        // Asignar algunos permisos base al rol admin
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->syncPermissions([
                'patients.index', 'patients.view', 'patients.create', 'patients.edit',
                'invoices.index', 'invoices.view', 'invoices.pdf',
                'payments.index', 'payments.process',
                'attendances.index',
                'treatments.index',
                'sessions.index',
            ]);
        }
    }
}
