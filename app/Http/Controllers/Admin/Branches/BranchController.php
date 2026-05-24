<?php

namespace App\Http\Controllers\Admin\Branches;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\Region;

class BranchController extends Controller
{
    public function store(Request $request, Company $company)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'codigo_sucursal_sii' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            'allows_onsite' => 'boolean',
            'allows_home' => 'boolean',
            
            // Dirección Directa
            'street' => 'nullable|string',
            'number' => 'nullable|string',
            'commune_id' => 'nullable|exists:communes,id',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        $branch = $company->branches()->create([
            'name' => $data['name'],
            'codigo_sucursal_sii' => $data['codigo_sucursal_sii'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'allows_onsite' => $request->boolean('allows_onsite', true),
            'allows_home' => $request->boolean('allows_home', true),
        ]);

        // Guardar Dirección Polimórfica (Única Fuente de Verdad)
        if (!empty($data['street']) || !empty($data['commune_id'])) {
            $branch->addresses()->create([
                'street' => $data['street'] ?? '',
                'number' => $data['number'] ?? '',
                'commune_id' => $data['commune_id'] ?? null,
                'region_id' => $data['region_id'] ?? null,
                'country' => 'Chile',
                'is_primary' => true
            ]);
        }

        return back()->with('success', 'Sucursal creada exitosamente.');
    }

    public function update(Request $request, Branch $branch)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'codigo_sucursal_sii' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            'is_main' => 'boolean',
            'allows_onsite' => 'boolean',
            'allows_home' => 'boolean',
            
            // Datos de Ubicación (para la tabla addresses)
            'street' => 'nullable|string',
            'number' => 'nullable|string',
            'commune_id' => 'nullable|exists:communes,id',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        // Lógica de Casa Matriz
        if (isset($data['is_main']) && $data['is_main']) {
            Branch::where('company_id', $branch->company_id)
                ->where('id', '!=', $branch->id)
                ->update(['is_main' => false]);
            $branch->is_main = true;
        }

        $branch->update([
            'name' => $data['name'],
            'codigo_sucursal_sii' => $data['codigo_sucursal_sii'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'allows_onsite' => $request->boolean('allows_onsite', true),
            'allows_home' => $request->boolean('allows_home', true),
            'is_main' => $branch->is_main,
        ]);

        // Sincronizar dirección polimórfica
        $branch->addresses()->updateOrCreate(
            ['is_primary' => true],
            [
                'street' => $data['street'] ?? '',
                'number' => $data['number'] ?? '',
                'commune_id' => $data['commune_id'] ?? null,
                'region_id' => $data['region_id'] ?? null,
                'country' => 'Chile'
            ]
        );

        return back()->with('success', 'Sucursal actualizada exitosamente.');
    }

    public function destroyBranch(Company $company, Branch $branch)
    {
        if ($branch->is_main) {
            return back()->with('error', 'No se puede eliminar la sucursal matriz.');
        }

        if ($branch->company_id !== $company->id) {
            abort(403, 'Esta sucursal no pertenece a la empresa.');
        }

        $branch->delete();

        return back()->with('success', 'Sucursal eliminada exitosamente.');
    }
}
