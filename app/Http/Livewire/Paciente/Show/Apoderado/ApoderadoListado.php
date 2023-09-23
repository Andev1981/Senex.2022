<?php

namespace App\Http\Livewire\Paciente\Show\Apoderado;

use App\Models\Keeper;
use App\Models\Patient;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ApoderadoListado extends Component
{
    use WithPagination;
    public Patient $paciente;
    protected $listeners = ['success-apoderado' => 'render'];

    public function render()
    {
         $keepers = Keeper::where('patient_id',$this->paciente->id)->paginate(5);
        return view('livewire.paciente.show.apoderado.apoderado-listado', compact('keepers'));
    }

     public function mount(Patient $paciente){
        $this->paciente = $paciente;
    }

}
