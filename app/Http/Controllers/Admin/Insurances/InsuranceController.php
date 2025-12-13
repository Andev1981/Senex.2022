<?php

namespace App\Http\Controllers\Admin\Insurances;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Http\Requests\StoreInsuranceCompanyRequest;
use App\Http\Requests\UpdateInsuranceCompanyRequest;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceController extends Controller
{
    public function index()
    {
       
        $insurances = Insurance::get();
        $plans = Plan::get();


        return Inertia::render('Insurances/Index', [
            'insurances' => $insurances,
            'plans' => $plans,
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

        Insurance::create($validated);

        return redirect()->route('insurance-companies.index')
            ->with('success', 'Insurance Company created successfully.');
    }

    public function update(Request $request, Insurance $insuranceCompany)
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

    public function destroy(Insurance $insuranceCompany)
    {
        $insuranceCompany->delete();

        return redirect()->route('insurance-companies.index')
            ->with('success', 'Insurance Company deleted successfully.');
    }
}