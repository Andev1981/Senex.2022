<?php

namespace App\Http\Controllers;

use App\Models\HealthInsurer;
use App\Models\InsuranceCompany;
use App\Services\PlanService;
use App\Services\PaymentService;
use App\Models\Plan;
use App\Models\SessionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with(['healthInsurer', 'insuranceCompany'])
            ->orderBy('name')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'codigo' => $plan->codigo,
                    'institution_type' => $plan->institution_type,
                    'institution_id' => $plan->institution_id,
                    'institution_name' => $plan->institution_type === 'health_insurer' 
                        ? $plan->healthInsurer?->name 
                        : $plan->insuranceCompany?->name,
                    'type' => $plan->type,
                    'total_sessions' => $plan->total_sessions,
                    'price' => $plan->price,
                    'valid_months' => $plan->valid_months,
                    'session_types' => $plan->session_types,
                    'description' => $plan->description,
                    'coverage' => $plan->coverage,
                    'start_date' => $plan->start_date,
                    'end_date' => $plan->end_date,
                    'is_active' => $plan->is_active,
                ];
            });

        $healthInsurers = HealthInsurer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $insuranceCompanies = InsuranceCompany::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sessionTypes = SessionType::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Plans/Index', [
            'plans' => $plans,
            'healthInsurers' => $healthInsurers,
            'insuranceCompanies' => $insuranceCompanies,
            'sessionTypes' => $sessionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'codigo' => 'required|string|max:255|unique:plans,codigo',
            'institution_type' => 'required|in:health_insurer,insurance_company,clinic',
            'institution_id' => 'nullable|integer',
            'type' => 'required|in:annual,session_pack,unlimited',
            'total_sessions' => 'nullable|integer|min:0',
            'price' => 'required|integer|min:0',
            'valid_months' => 'nullable|integer|min:0',
            'session_types' => 'nullable|array',
            'description' => 'nullable|string',
            'coverage' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Si es plan de clínica, institution_id debe ser null
        if ($validated['institution_type'] === 'clinic') {
            $validated['institution_id'] = null;
        }

        // Convert session_types array to JSON
        if (isset($validated['session_types'])) {
            $validated['session_types'] = json_encode($validated['session_types']);
        }

        Plan::create($validated);

        return redirect()->route('plans.index')
            ->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'codigo' => 'required|string|max:255|unique:plans,codigo,' . $plan->id,
            'institution_type' => 'required|in:health_insurer,insurance_company,clinic',
            'institution_id' => 'nullable|integer',
            'type' => 'required|in:annual,session_pack,unlimited',
            'total_sessions' => 'nullable|integer|min:0',
            'price' => 'required|integer|min:0',
            'valid_months' => 'nullable|integer|min:0',
            'session_types' => 'nullable|array',
            'description' => 'nullable|string',
            'coverage' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Si es plan de clínica, institution_id debe ser null
        if ($validated['institution_type'] === 'clinic') {
            $validated['institution_id'] = null;
        }

        // Convert session_types array to JSON
        if (isset($validated['session_types'])) {
            $validated['session_types'] = json_encode($validated['session_types']);
        }

        $plan->update($validated);

        return redirect()->route('plans.index')
            ->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return redirect()->route('plans.index')
            ->with('success', 'Plan deleted successfully.');
    }
}