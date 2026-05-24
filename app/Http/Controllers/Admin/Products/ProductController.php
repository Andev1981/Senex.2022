<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ProductDetail;
use App\Models\ServiceDetail;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;
        $company = \App\Models\Company::find($companyId);
        
        // Si es clínica y no hay filtro de tipo, por defecto mostramos servicios
        if (!$request->has('type') && $company && $company->business_type->value === 'clinical') {
            $request->merge(['type' => 'service']);
        }

        $items = Item::query()
            ->where('company_id', $companyId)
            ->with(['category', 'productDetail', 'serviceDetail'])
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->category_id, function ($query, $categoryId) {
                // Obtenemos el ID de la categoría y de sus hijas para un filtro inclusivo
                $categoryIds = \App\Models\Category::where('id', $categoryId)
                    ->orWhere('parent_id', $categoryId)
                    ->pluck('id');
                $query->whereIn('category_id', $categoryIds);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('productDetail', function($qd) use ($search) {
                            $qd->where('barcode', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $categories = \App\Models\Category::where('company_id', $companyId)
            ->whereNull('parent_id')
            ->with('children')
            ->get();

        $activeBranch = \App\Models\Branch::find(session('active_branch_id'));

        return Inertia::render('products/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters'  => $request->only(['search', 'category_id', 'type']),
            'active_branch' => $activeBranch
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        return DB::transaction(function() use ($request) {
            $validated = $request->validated();
            
            $item = Item::create([
                'company_id'  => auth()->user()->company_id,
                'branch_id'   => session('active_branch_id'),
                'user_id'     => auth()->id(),
                'type'        => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'sku'         => $validated['sku'] ?? null,
                'price'       => $validated['price'],
                'is_exempt'   => $validated['is_exempt'] ?? true,
                'is_active'   => $validated['is_active'] ?? true,
            ]);

            if ($item->type === 'product') {
                ProductDetail::create([
                    'item_id'        => $item->id,
                    'barcode'        => $validated['barcode'] ?? null,
                    'cost_price'     => $validated['cost_price'] ?? null,
                    'stock'          => $validated['stock'] ?? 0,
                    'critical_stock' => $validated['critical_stock'] ?? 0,
                    'manage_stock'   => $validated['manage_stock'] ?? true,
                ]);
            } else {
                ServiceDetail::create([
                    'item_id'                       => $item->id,
                    'duration_minutes'              => $validated['duration_minutes'] ?? 45,
                    'requires_diagnosis'            => $validated['requires_diagnosis'] ?? false,
                    'requires_referral'             => $validated['requires_referral'] ?? false,
                    'commission_type'               => $validated['commission_type'] ?? 'fixed_amount',
                    'default_doctor_commission_clp' => $validated['default_doctor_commission_clp'] ?? 0,
                    'default_doctor_commission_own_clp' => $validated['default_doctor_commission_own_clp'] ?? $validated['default_doctor_commission_clp'] ?? 0,
                    'default_doctor_commission_assigned_clp' => $validated['default_doctor_commission_assigned_clp'] ?? $validated['default_doctor_commission_clp'] ?? 0,
                    'default_doctor_commission_percentage' => $validated['default_doctor_commission_percentage'] ?? 0,
                    'default_doctor_commission_own_percentage' => $validated['default_doctor_commission_own_percentage'] ?? $validated['default_doctor_commission_percentage'] ?? 0,
                    'default_doctor_commission_assigned_percentage' => $validated['default_doctor_commission_assigned_percentage'] ?? $validated['default_doctor_commission_percentage'] ?? 0,
                    'specialty'                     => $validated['specialty'] ?? null,
                    'billing_code'                  => $validated['billing_code'] ?? null,
                    'agenda_color'                  => $validated['agenda_color'] ?? '#3b82f6',
                    'patient_instructions'          => $validated['patient_instructions'] ?? null,
                    'allows_onsite'                 => $validated['allows_onsite'] ?? true,
                    'allows_online'                 => $validated['allows_online'] ?? false,
                    'allows_home'                   => $validated['allows_home'] ?? false,
                    'max_simultaneous_patients'     => $validated['max_simultaneous_patients'] ?? 3,
                    'requires_consent'              => $validated['requires_consent'] ?? false,
                ]);
            }

            return back()->with('success', 'Ítem creado exitosamente.');
        });
    }

    public function update(UpdateProductRequest $request, Item $product)
    {
        return DB::transaction(function() use ($request, $product) {
            $validated = $request->validated();

            $product->update([
                'type'        => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'sku'         => $validated['sku'] ?? null,
                'price'       => $validated['price'],
                'is_exempt'   => $validated['is_exempt'] ?? true,
                'is_active'   => $validated['is_active'] ?? true,
            ]);

            if ($product->type === 'product') {
                $product->productDetail()->updateOrCreate(
                    ['item_id' => $product->id],
                    [
                        'barcode'        => $validated['barcode'] ?? null,
                        'cost_price'     => $validated['cost_price'] ?? null,
                        'stock'          => $validated['stock'] ?? 0,
                        'critical_stock' => $validated['critical_stock'] ?? 0,
                        'manage_stock'   => $validated['manage_stock'] ?? true,
                    ]
                );
            } else {
                $product->serviceDetail()->updateOrCreate(
                    ['item_id' => $product->id],
                    [
                        'duration_minutes'              => $validated['duration_minutes'] ?? 45,
                        'requires_diagnosis'            => $validated['requires_diagnosis'] ?? false,
                        'requires_referral'             => $validated['requires_referral'] ?? false,
                        'commission_type'               => $validated['commission_type'] ?? 'fixed_amount',
                        'default_doctor_commission_clp' => $validated['default_doctor_commission_clp'] ?? 0,
                        'default_doctor_commission_own_clp' => $validated['default_doctor_commission_own_clp'] ?? $validated['default_doctor_commission_clp'] ?? 0,
                        'default_doctor_commission_assigned_clp' => $validated['default_doctor_commission_assigned_clp'] ?? $validated['default_doctor_commission_clp'] ?? 0,
                        'default_doctor_commission_percentage' => $validated['default_doctor_commission_percentage'] ?? 0,
                        'default_doctor_commission_own_percentage' => $validated['default_doctor_commission_own_percentage'] ?? $validated['default_doctor_commission_percentage'] ?? 0,
                        'default_doctor_commission_assigned_percentage' => $validated['default_doctor_commission_assigned_percentage'] ?? $validated['default_doctor_commission_percentage'] ?? 0,
                        'specialty'                     => $validated['specialty'] ?? null,
                        'billing_code'                  => $validated['billing_code'] ?? null,
                        'agenda_color'                  => $validated['agenda_color'] ?? '#3b82f6',
                        'patient_instructions'          => $validated['patient_instructions'] ?? null,
                        'allows_onsite'                 => $validated['allows_onsite'] ?? true,
                        'allows_online'                 => $validated['allows_online'] ?? false,
                        'allows_home'                   => $validated['allows_home'] ?? false,
                        'max_simultaneous_patients'     => $validated['max_simultaneous_patients'] ?? 3,
                        'requires_consent'              => $validated['requires_consent'] ?? false,
                    ]
                );
            }

            return back()->with('success', 'Ítem actualizado correctamente.');
        });
    }

    public function destroy(Item $product)
    {
        if ($product->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $product->delete();

        return back()->with('success', 'Ítem eliminado.');
    }
}
