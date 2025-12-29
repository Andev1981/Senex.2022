<?php

namespace App\Http\Controllers\Admin\Acquisitions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('Acquisitions/Suppliers/Index');
    }

    public function store(Request $request) { /* ... */ }
    public function show($id) { /* ... */ }
    public function update(Request $request, $id) { /* ... */ }
    public function destroy($id) { /* ... */ }
}
