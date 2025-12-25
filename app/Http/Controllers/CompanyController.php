<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

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
        $company->load(['dteConfiguration', 'authorizedFolios', 'logo']);

        return Inertia::render('Companies/Edit', [
            'company' => $company,
            'dteConfig' => $company->dteConfiguration,
            'folios' => $company->authorizedFolios()->orderByDesc('created_at')->get(),
            'logo' => $company->logo
        ]);
    }

    public function update(Request $request, Company $company)
    {
        // Actualización básica de datos de empresa...
        // (Implementar similar al store)
    }
}
