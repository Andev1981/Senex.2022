<?php

namespace App\Http\Livewire;

use App\Models\ApplicationTypeUser;
use Livewire\Component;

class Inicio extends Component
{
    public function render()
    {

        if (auth()->user()->user_type === "Super-Administrador") {
            return view('livewire.kinesiologos.kine-index');
        }

        return view('livewire.inicio');
    }
}
