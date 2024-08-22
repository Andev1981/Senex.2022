<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\Patient;
use Livewire\Component;

class AtencionDetalle extends Component
{
    public $paciente;

    public function render()
    {
        return view('livewire.kinesiologos.atencion-detalle');
    }

    public function mount(Patient $paciente)
    {
        $this->paciente = $paciente;
    }
}
