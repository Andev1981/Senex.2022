<?php

namespace App\Http\Livewire;

use App\Models\Patient;
use Livewire\Component;

class Paciente extends Component
{
    public $pacientes;

    public function mount(){
        $this->pacientes = Patient::orderBy('id', 'DESC')->get();
    }

    public function render()
    {
        return view('livewire.paciente');
    }
}
