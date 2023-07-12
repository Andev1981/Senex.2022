<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use Livewire\Component;
use App\Models\Application;


class CrearItem extends Component
{

    public $application;
    public function render()
    {
        return view('livewire.paciente.show.atenciones.crear-item');
    }

    public function mount(Application $application)
    {
        $this->application = $application;
    }

}
