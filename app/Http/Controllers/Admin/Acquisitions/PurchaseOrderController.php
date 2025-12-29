<?php

namespace App\Http\Controllers\Admin\Acquisitions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Acquisitions/PurchaseOrders/Index');
    }

    public function store(Request $request) { /* ... */ }
    public function show($id) { /* ... */ }
    public function updateStatus(Request $request, $id) { /* ... */ }
}
