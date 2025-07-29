<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Inertia\Inertia;

class InertiaHomeController extends Controller
{
  public function inertiaHome()
  {
    $user = auth()->user();
    $pacientes = Patient::with('address', 'address.comuna', 'lastAttention', 'lastAttention.doctor')->get();

    return Inertia::render('Dashboard', compact('user', 'pacientes'));
  }

  public function base()
  {
    $pacientes = Patient::all();
    return json_decode($pacientes->toJson());
  }
}
