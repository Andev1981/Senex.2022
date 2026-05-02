<?php

namespace App\Http\Controllers\Admin\Products;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $companyId = session('current_company_id');

        $categories = Category::where('company_id', $companyId)
            ->with(['children', 'parent'])
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return Inertia::render('categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $data['company_id'] = session('current_company_id');
        $data['slug'] = Str::slug($data['name']) . '-' . rand(1000, 9999);

        Category::create($data);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, Category $category)
    {
        if ($category->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'required|boolean',
        ]);

        // Evitar que sea su propia madre
        if ($data['parent_id'] == $category->id) {
            return back()->withErrors(['parent_id' => 'Una categoría no puede ser subcategoría de sí misma.']);
        }

        $category->update($data);

        return back()->with('success', 'Categoría actualizada.');
    }

    public function destroy(Category $category)
    {
        if ($category->company_id !== (int)session('current_company_id')) {
            abort(403);
        }

        // Verificar si la categoría o cualquiera de sus subcategorías tiene ítems
        $categoryIds = Category::where('id', $category->id)
            ->orWhere('parent_id', $category->id)
            ->pluck('id');

        $hasItems = \App\Models\Item::whereIn('category_id', $categoryIds)->exists();

        if ($hasItems) {
            return back()->with('error', 'No puedes eliminar esta categoría porque ella o sus subcategorías tienen productos/servicios asociados.');
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada.');
    }
}
