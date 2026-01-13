<?php

namespace App\Http\Controllers\Admin\Subscription;

use App\Http\Controllers\Controller;
use App\Models\SaaSPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $saasPlans = SaaSPlan::all();
        $subscription = Subscription::where('company_id', session('current_company_id'))->first();

        return Inertia::render('subscription/Index', [
            'saasPlans' => $saasPlans,
            'subscription' => $subscription,
        ]);
    }

    public function store(Request $request) 
    { 
        // Lógica para procesar el pago simulado y actualizar la suscripción
    }
}
