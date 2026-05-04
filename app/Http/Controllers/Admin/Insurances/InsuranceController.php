<?php

namespace App\Http\Controllers\Admin\Insurances;

use App\Enums\PaymentMethodEnum;
use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Http\Requests\StoreInsuranceCompanyRequest;
use App\Http\Requests\UpdateInsuranceCompanyRequest;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsuranceController extends Controller
{
    /* public function indexPagos()
    {
       
        $patients = Patient::get();
        $items = Item::get();
        $insurances = Insurance::get();
        $plans = Plan::get();
        $paymentMethods = collect(PaymentMethodEnum::cases())->map(function ($method) {
        return [
                'value' => $method->value,
                'label' => $method->label(),
            ];
        })->toArray();



        return Inertia::render('billing-checkout/Index', [
            'patients' => $patients,
            'items' => $items,
            'insurances' => $insurances,
            'plans' => $plans,
            'paymentMethods' => $paymentMethods,
        ]);
    } */

    public function index()
    {
        $currentCompanyId = session('current_company_id');

        // Traemos las aseguradoras con sus planes y el convenio activo con sus reglas
        $insurances = Insurance::where('company_id', $currentCompanyId)
            ->with(['plans', 'activeAgreement.rules.item', 'activeAgreement.rules.plan'])
            ->get();

        $sessionTypes = Item::services()->where('company_id', $currentCompanyId)->get(['id', 'name', 'price']);

        return Inertia::render('insurances/InsuranceIndex', [
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
            'institution_type' => 'required|in:health_insurer,insurance_company,clinic',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            \DB::beginTransaction();
            $validated['company_id'] = session('current_company_id');
            $insurance = Insurance::create($validated);

            // AUTOMATIZACIÓN PROFESIONAL: Crear convenio maestro al nacer la aseguradora
            \App\Models\Agreement::create([
                'company_id' => $insurance->company_id,
                'insurance_id' => $insurance->id,
                'name' => "Tarifario Maestro - {$insurance->name}",
                'is_active' => true,
                'start_date' => now(),
            ]);

            \DB::commit();
            session()->flash('message', '✅ Aseguradora y Tarifario creados.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            \DB::rollBack();
            session()->flash('message', '❌ Error: ' . $e->getMessage());
            session()->flash('type', 'error');
        }
        return back();
    }

    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:insurances,rut,' . $insurance->id,
            'institution_type' => 'required|in:health_insurer,insurance_company,clinic',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            $insurance->update($validated);
            session()->flash('message', '✅ Aseguradora actualizada exitosamente.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            session()->flash('message', '❌ Error al actualizar aseguradora: ' . $e->getMessage());
            session()->flash('type', 'error');
        }
    }

    public function destroy(Insurance $insurance)
    {
        try {
            $insurance->delete();
            session()->flash('message', '✅ Aseguradora eliminada exitosamente.');
            session()->flash('type', 'success');
        } catch (\Exception $e) {
            session()->flash('message', '❌ Error al eliminar aseguradora: ' . $e->getMessage());
            session()->flash('type', 'error');
        }

        return back();
    }
}
