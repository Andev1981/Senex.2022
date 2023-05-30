<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\ApplyItem;
use Livewire\Component;
use Livewire\WithPagination;

class AtencionesItems extends Component
{
    use WithPagination;
    public Application $application;
    public $openItem = 'hidden';
    public $paciente;

    public function render()
    {
        $items = ApplyItem::where('application_id', $this->application->id)->paginate(5);
        $atendidas = $items->where('status', 1);
        $pendientes = count($items) - count($atendidas);

        return view('livewire.paciente.show.atenciones.atenciones-items', compact('items', 'atendidas', 'pendientes'));
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->paciente = $this->application->user;
    }
}
