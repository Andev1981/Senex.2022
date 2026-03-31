<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
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

  public function kines()
  {
    $doctors = Doctor::all();
    return Inertia::render('Kines/KinesIndex', compact('doctors'));
  }
}
