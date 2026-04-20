<?php

namespace App\Http\Controllers\Admin\Acquisitions;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index()
    {
        $currentCompanyId = session('current_company_id');
        
        $suppliers = Supplier::where('company_id', $currentCompanyId)
            ->orderBy('business_name', 'asc')
            ->get();

        return Inertia::render('acquisitions/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rut' => 'nullable|string',
            'business_name' => 'required|string|max:255',
            'giro' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string',
        ]);

        $validated['company_id'] = session('current_company_id');

        Supplier::create($validated);

        return redirect()->back()->with('message', 'Proveedor registrado exitosamente.')->with('type', 'success');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'rut' => 'nullable|string',
            'business_name' => 'required|string|max:255',
            'giro' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('message', 'Datos del proveedor actualizados.')->with('type', 'success');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->back()->with('message', 'Proveedor eliminado.')->with('type', 'success');
    }
}
