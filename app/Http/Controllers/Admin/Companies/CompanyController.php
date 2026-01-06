<?php

namespace App\Http\Controllers\Admin\Companies;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

use App\Models\Branch;
use App\Models\Region;

class CompanyController extends Controller
{
    public function index()
    {
        // Cargamos el logo polimórfico
        $companies = Company::with('logo')->latest()->get()->map(function ($company) {
            return [
                'id' => $company->id,
                'rut' => $company->rut,
                'business_name' => $company->business_name,
                'logo_url' => $company->logo ? $company->logo->url : null,
                'is_configured' => $company->dteConfiguration()->exists(), // Flag visual
            ];
        });

        return Inertia::render('Companies/Index', [
            'companies' => $companies
        ]);
    }

    public function create()
    {
        return Inertia::render('Companies/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'rut' => 'required|string|unique:companies,rut',
            'business_name' => 'required|string',
            'email' => 'nullable|email',
            'logo' => 'nullable|image|max:2048'
        ]);

        $company = Company::create($data);

        // Guardar Logo Polimórfico si viene
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $company->logo()->create([
                'path' => $path,
                'url' => Storage::url($path),
                'type' => 'logo'
            ]);
        }

        return redirect()->route('companies.edit', $company->id)
            ->with('success', 'Empresa creada. Ahora configura el DTE.');
    }

    public function edit(Company $company)
    {
        // Cargamos TODA la configuración para la vista de edición
        $company->load(['dteConfiguration', 'authorizedFolios', 'logo', 'branches.addresses']);

        // Cargamos regiones y comunas para el formulario de dirección
        $regions = Region::with('communes')->get();

        return Inertia::render('Companies/Edit', [
            'company' => $company,
            'dteConfig' => $company->dteConfiguration,
            'folios' => $company->authorizedFolios()->orderByDesc('created_at')->get(),
            'logo' => $company->logo,
            'branches' => $company->branches,
            'regions' => $regions
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $data = $request->validate([
            'rut' => 'required|string|unique:companies,rut,' . $company->id,
            'business_name' => 'required|string',
            'giro' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'logo' => 'nullable|image|max:2048'
        ]);

        $company->update($data);

        // Guardar Logo Polimórfico si viene nuevo
        if ($request->hasFile('logo')) {
            // Opcional: Borrar anterior si existe
            if ($company->logo) {
                Storage::delete($company->logo->path);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $company->logo()->updateOrCreate(
                ['type' => 'logo'],
                [
                    'path' => $path,
                    'url' => Storage::url($path),
                ]
            );
        }

        return back()->with('success', 'Datos corporativos actualizados correctamente.');
    }

    public function storeBranch(Request $request, Company $company)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'codigo_sucursal_sii' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            
            // Dirección
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
        ]);

        // Crear dirección si viene data
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

    public function updateBranch(Request $request, Company $company, Branch $branch)
    {
        if ($branch->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'codigo_sucursal_sii' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            'is_main' => 'boolean', // Nuevo campo
            
            // Dirección
            'street' => 'nullable|string',
            'number' => 'nullable|string',
            'commune_id' => 'nullable|exists:communes,id',
            'region_id' => 'nullable|exists:regions,id',
        ]);

        // Lógica de Casa Matriz
        if (isset($data['is_main']) && $data['is_main']) {
            // Desmarcar todas las otras sucursales
            $company->branches()->where('id', '!=', $branch->id)->update(['is_main' => false]);
            $branch->is_main = true;
        }

        $branch->update([
            'name' => $data['name'],
            'codigo_sucursal_sii' => $data['codigo_sucursal_sii'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            // Si se marcó como main, se guarda aquí
            'is_main' => $branch->is_main 
        ]);

        // Actualizar o crear dirección principal
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
