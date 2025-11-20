<?php

namespace App\Http\Controllers;

use App\Models\HealthInsurer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HealthInsurerController extends Controller
{
    public function index(Request $request)
    {
       
        $healthInsurers = HealthInsurer::orderBy('name')->get();

        return Inertia::render('HealthInsurers/Index', [
            'healthInsurers' => $healthInsurers,
        ]);
    }

   /*  public function create()
    {
        return Inertia::render('HealthInsurers/Form');
    } */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:health_insurers,rut',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        HealthInsurer::create($validated);

        return redirect()->route('health-insurers.index')
            ->with('success', 'Health Insurer created successfully.');
    }

    /* public function edit(HealthInsurer $healthInsurer)
    {
        return Inertia::render('HealthInsurers/Form', [
            'healthInsurer' => $healthInsurer,
        ]);
    } */

    public function update(Request $request, HealthInsurer $healthInsurer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|max:255|unique:health_insurers,rut,' . $healthInsurer->id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        $healthInsurer->update($validated);

        return redirect()->route('health-insurers.index')
            ->with('success', 'Health Insurer updated successfully.');
    }

    public function destroy(HealthInsurer $healthInsurer)
    {
        $healthInsurer->delete();

        return redirect()->route('health-insurers.index')
            ->with('success', 'Health Insurer deleted successfully.');
    }
}

