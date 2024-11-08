<?php

namespace App\Http\Livewire;

use App\Models\ApplicationTypeUser;
use Livewire\Component;

class Inicio extends Component
{
    public function render()
    {

        return view('livewire.inicio');
    }

    public function mount()
    {

        if (auth()->user()->user_type === "Kine") {
            if (auth()->user()->status === 0) {

                return redirect('/no-autorizado');
            }

            return redirect('/mis-atenciones');
        }

        return redirect('/pagos');
    }
}
