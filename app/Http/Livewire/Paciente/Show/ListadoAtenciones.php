<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoAtenciones extends Component
{
    use WithPagination;
    public Patient $paciente;

    public function render()
    {

         $atenciones = Application::where('patient_id', $this->paciente->id)->orderBy('updated_at', 'desc')->paginate(5);

        return view('livewire.paciente.show.listado-atenciones', compact('atenciones'));
    }

    public function mount(Patient $paciente){
        $this->paciente = $paciente;
    }

    public function selectItem($selectedItem){
        $selItem = ApplyItem::find($selectedItem);

    }
}
