<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\ApplyItem;
use Livewire\Component;
use Livewire\WithPagination;

class AtencionItems extends Component
{
     use WithPagination;
    Public $application;
    public $openItem = 'hidden';
    Public $paciente;
    public function render()
    {
        $items = ApplyItem::where('application_id',$this->application->id)->paginate(5);
        $atendidas = $items->where('status',1);
        $pendientes = count($items) - count($atendidas);
        return view('livewire.paciente.show.atenciones.atencion-items', 
        compact('items','atendidas', 'pendientes'));
    }

      public function mount(Application $application){
        $this->application = $application;
        $this->paciente = $this->application->user;
    }
}
