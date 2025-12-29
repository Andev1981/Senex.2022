<?php

namespace App\Http\Controllers\Admin\Insurances;

use App\Enums\PaymentMethodEnum;
use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Http\Requests\StoreInsuranceCompanyRequest;
use App\Http\Requests\UpdateInsuranceCompanyRequest;
use App\Models\SessionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceController extends Controller
{
    /* public function indexPagos()
    {
       
        $patients = Patient::get();
        $sessionTypes = SessionType::get();
        $insurances = Insurance::get();
        $plans = Plan::get();
        $paymentMethods = collect(PaymentMethodEnum::cases())->map(function ($method) {
        return [
                'value' => $method->value,
                'label' => $method->label(),
            ];
        })->toArray();



        return Inertia::render('BillingCheckout/Index', [
            'patients' => $patients,
            'sessionTypes' => $sessionTypes,
            'insurances' => $insurances,
            'plans' => $plans,
            'paymentMethods' => $paymentMethods,
        ]);
    } */

    public function index()
    {
        $currentCompanyId = session('current_company_id');

        // Traemos las aseguradoras con sus planes para mostrarlas en la tabla/modales.
        $insurances = Insurance::where('company_id', $currentCompanyId)->with('plans')->get();

        $sessionTypes = SessionType::where('company_id', $currentCompanyId)->get(['id', 'name', 'base_price_clp']);

        return Inertia::render('Insurances/InsuranceIndex', [
            'insurances' => $insurances,
            'sessionTypes' => $sessionTypes,
            'user' => auth()->user()->load('roles'),
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:insurances,rut',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        Insurance::create($validated);

        return back()
            ->with('success', 'Insurance Company created successfully.');
    }

    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:insurances,rut,' . $insurance->id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        $insurance->update($validated);

        return back()
            ->with('success', 'Insurance Company updated successfully.');
    }

    public function destroy(Insurance $insuranceCompany)
    {
        $insuranceCompany->delete();

        return back()
            ->with('success', 'Insurance Company deleted successfully.');
    }
}
