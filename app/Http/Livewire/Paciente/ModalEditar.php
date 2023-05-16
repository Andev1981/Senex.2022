<?php

namespace App\Http\Livewire\Paciente;

use Livewire\Component;

class ModalEditar extends Component
{
    public $paciente;


    public function mount($paciente){
        $this->paciente = $paciente;
    }

    public function render()
    {
        return view('livewire.paciente.modal-editar');
    }
}
