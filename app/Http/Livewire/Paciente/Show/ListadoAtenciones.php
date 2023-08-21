<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Application;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoAtenciones extends Component
{
    use WithPagination;
    public User $paciente;

    public function render()
    {

         $atenciones = Application::where('user_id', $this->paciente->id)->orderBy('updated_at', 'desc')->paginate(5);

        return view('livewire.paciente.show.listado-atenciones', compact('atenciones'));
    }

    public function mount(User $paciente){
        $this->paciente = $paciente;
    }
}
