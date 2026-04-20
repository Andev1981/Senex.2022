<?php

namespace App\Http\Controllers\Admin\Acquisitions;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $currentCompanyId = session('current_company_id');
        $activeBranchId = session('active_branch_id');

        $purchaseOrders = PurchaseOrder::where('company_id', $currentCompanyId)
            ->with(['supplier', 'user'])
            ->orderBy('date', 'desc')
            ->get();

        $suppliers = Supplier::where('company_id', $currentCompanyId)
            ->where('is_active', true)
            ->get(['id', 'business_name', 'rut']);

        return Inertia::render('acquisitions/PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'required|date',
            'number' => 'required|string|unique:purchase_orders,number',
            'observations' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price_clp' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $netAmount = 0;
            foreach ($validated['items'] as $item) {
                $netAmount += $item['quantity'] * $item['unit_price_clp'];
            }

            $taxAmount = round($netAmount * 0.19); // IVA 19%
            $totalAmount = $netAmount + $taxAmount;

            $order = PurchaseOrder::create([
                'company_id' => session('current_company_id'),
                'branch_id' => session('active_branch_id'),
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'number' => $validated['number'],
                'date' => $validated['date'],
                'net_amount_clp' => $netAmount,
                'tax_amount_clp' => $taxAmount,
                'total_amount_clp' => $totalAmount,
                'observations' => $validated['observations'],
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price_clp' => $item['unit_price_clp'],
                    'total_price_clp' => $item['quantity'] * $item['unit_price_clp'],
                ]);
            }

            return redirect()->back()->with('message', 'Orden de Compra generada.')->with('type', 'success');
        });
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'items', 'user', 'branch']);
        return response()->json($purchaseOrder);
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate(['status' => 'required|string']);
        $purchaseOrder->update(['status' => $request->status]);
        return redirect()->back()->with('message', 'Estado de la orden actualizado.')->with('type', 'success');
    }
}
