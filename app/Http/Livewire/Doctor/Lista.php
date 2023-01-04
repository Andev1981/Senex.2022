<?php

namespace App\Http\Livewire\Doctor;

use Livewire\Component;
use App\Models\Doctor;

class Lista extends Component
{


    public function render()
    {
        return view('livewire.doctor.lista',[
            'doctores' => Doctor::all()
        ]);
    }
}
