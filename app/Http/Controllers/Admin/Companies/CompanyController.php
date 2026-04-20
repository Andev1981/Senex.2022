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
        // Cargamos el logo y la configuración DTE
        $companies = Company::with(['logo', 'dteConfiguration'])->latest()->get()->map(function ($company) {
            $dte = $company->dteConfiguration;
            return [
                'id' => $company->id,
                'rut' => $company->rut,
                'business_name' => $company->business_name,
                'logo_url' => $company->logo ? $company->logo->url : null,
                'is_configured' => !!$dte,
                'dte_environment' => $dte?->environment,
                'dte_expiration' => $dte?->expiration_date?->format('Y-m-d'),
                'is_expired' => $dte?->expiration_date?->isPast(),
            ];
        });

        return Inertia::render('companies/Index', [
            'companies' => $companies
        ]);
    }

    public function create()
    {
        return Inertia::render('companies/Create');
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

        return Inertia::render('companies/Edit', [
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
            'business_type' => 'required|string|in:clinical,service,retail',
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

    
}
