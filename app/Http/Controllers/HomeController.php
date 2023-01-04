<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(){

      if(auth()->user()->patient == null && auth()->user()->doctor == null){
            return back();
        }
        if(auth()->user()->roles[0]->name == 'Patient'){
            return redirect()->route('paciente.show', auth()->user()->patient->id);
        }elseif(auth()->user()->roles[0]->name == 'Doctor'){
            return redirect()->route('doctor.show', auth()->user()->doctor->id);
        }
        return view('admin.index');
    }
}
