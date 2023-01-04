<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use App\Models\Doctor;

class Pacientes extends Component
{

    public $doctor;

    public function mount($doctor){

        $doctor = Doctor::find($doctor);
        $this->firma = $doctor->firma;
    }


    public function render()
    {
        return view('livewire.doctor.tabs.pacientes');
    }
}
