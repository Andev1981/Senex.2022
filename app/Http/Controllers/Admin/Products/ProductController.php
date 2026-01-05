<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $products = Product::where('company_id', $companyId)
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

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(StoreProductRequest $request)
    {
        // 1. Inyectamos el ID de la empresa
        $data = $request->validated();
        $data['company_id'] = auth()->user()->company_id;

        // 2. Crear
        Product::create($data);

        return redirect()->route('products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function edit(Product $product)
    {
        // Validar que el producto pertenezca a la empresa del usuario
        if ($product->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        return Inertia::render('Products/Edit', [
            'product' => $product
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        if ($product->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $product->update($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado correctamente.');
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
