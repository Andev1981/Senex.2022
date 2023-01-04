<?php

namespace App\Http\Livewire\Doctor;

use App\Models\Doctor;
use Livewire\Component;

class Index extends Component
{
    public $doctor;

    public function mount($kine){
        
        $this->doctor = Doctor::find($kine);
        //$this->doctor=$doctor;

    }

    public function render()
    {
        return view('livewire.doctor.index');
    }
}
