<?php

namespace App\Http\Livewire\Doctor;

use App\Models\Doctor;
use Livewire\Component;

class Tabs extends Component
{
    public $doctor;

    public function mount($doctor){
        
        $this->doctor = Doctor::find($doctor->id);
        //$this->doctor=$doctor;

    }

    public function render()
    {
        return view('livewire.doctor.tabs');
    }
}
