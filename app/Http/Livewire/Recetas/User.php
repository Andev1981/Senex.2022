<?php

namespace App\Http\Livewire\Recetas;

use App\Models\Solicitud;
use Livewire\Component;

class User extends Component
{
    public $solicitud;

    public function mount($solicitud){
        $this->solicitud = $solicitud;
    }

    public function render()
    {
        return view('livewire.recetas.user');
    }
}
