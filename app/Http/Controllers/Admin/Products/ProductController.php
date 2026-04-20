<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $companyId = session('current_company_id');

        $products = Product::where('company_id', $companyId)
            ->with('category')
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->category_id, fn($q, $cat) => $q->where('category_id', $cat))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Lista de categorías para filtros y formularios
        $categories = \App\Models\Category::where('company_id', $companyId)
            ->with('children')
            ->whereNull('parent_id')
            ->get();

        return Inertia::render('products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters'  => $request->only(['search', 'type', 'category_id']),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();
        
        $data['company_id'] = session('current_company_id');
        $data['branch_id']  = session('current_branch_id');
        $data['user_id']    = auth()->id();

        Product::create($data);

        return back()->with('success', 'Ítem creado exitosamente.');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        // Validar propiedad
        if ($product->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        $product->update($request->validated());

        return back()->with('success', 'Ítem actualizado correctamente.');
    }

    public function destroy(Product $product)
    {
        if ($product->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        // Validación Opcional: No borrar si ya tiene ventas
        if ($product->sales()->exists()) {
            return back()->with('error', 'No puedes eliminar un producto que ya ha sido vendido. Desactívalo en su lugar.');
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado.');
    }
}
