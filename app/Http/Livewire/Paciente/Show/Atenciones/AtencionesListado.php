<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class AtencionesListado extends Component
{

    use WithPagination;
    public User $paciente;
    
    public function render()
    {
         $atenciones = Application::where('user_id',$this->paciente->id)->paginate(5);

        return view('livewire.paciente.show.atenciones.atenciones-listado', compact('atenciones'));
    }

      public function mount(User $paciente){
        $this->paciente = $paciente;
    }

}
