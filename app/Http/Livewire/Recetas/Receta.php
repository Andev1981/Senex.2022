<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Solicitud;

class Receta extends Component
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
        return view('livewire.recetas.receta');
    }

}
