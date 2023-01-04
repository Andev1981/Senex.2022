<?php

namespace App\Http\Livewire\Recetas;

use Livewire\Component;

class Create extends Component
{
    public $solicitud;
    public $repetir = false;
    public $veces;
    public $detalle;

    public function mount($solicitud){
        $this->solicitud = $solicitud;
    }

    public function render()
    {
        return view('livewire.recetas.create');
    }
}
