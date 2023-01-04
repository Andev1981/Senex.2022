<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use App\Models\Doctor;

class Pendientes extends Component
{

    public $doctor;

    public function mount($doctor){

        $doctor = Doctor::find($doctor);
        $this->solicitudes = $doctor->solicituds->where('status',0);
    }


    public function render()
    {
        return view('livewire.doctor.tabs.pendientes');
    }
}
