<?php

namespace App\Http\Controllers;

use App\Models\InsuranceCompany;
use App\Http\Requests\StoreInsuranceCompanyRequest;
use App\Http\Requests\UpdateInsuranceCompanyRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceCompanyController extends Controller
{
    public function index()
    {
       
        $insuranceCompanies = InsuranceCompany::orderBy('name')->get();

        return Inertia::render('InsuranceCompanies/Index', [
            'insuranceCompanies' => $insuranceCompanies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:insurance_companies,rut',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        InsuranceCompany::create($validated);

        return redirect()->route('insurance-companies.index')
            ->with('success', 'Insurance Company created successfully.');
    }

    public function update(Request $request, InsuranceCompany $insuranceCompany)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:insurance_companies,rut,' . $insuranceCompany->id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        $insuranceCompany->update($validated);

        return redirect()->route('insurance-companies.index')
            ->with('success', 'Insurance Company updated successfully.');
    }

    public function destroy(InsuranceCompany $insuranceCompany)
    {
        $insuranceCompany->delete();

        return redirect()->route('insurance-companies.index')
            ->with('success', 'Insurance Company deleted successfully.');
    }
}