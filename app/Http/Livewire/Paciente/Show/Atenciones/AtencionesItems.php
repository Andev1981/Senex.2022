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
    protected $listeners = ['success-item' => 'successItem', 'success-item-single' => 'successItem'];

    public function render()
    {
        $items = ApplyItem::where('application_id', $this->application->id)->with('applicationType')->orderBy('created_at', 'desc')->paginate(6);
        $atendidas = $items->where('status', 1);
        $pendientes = count($items) - count($atendidas);

        $itemStatus = ApplyItem::where('application_id', $this->application->id)->where('status', '>', 0)->get();

        if (count($itemStatus) > 0) {
            $this->application->status = 1;
            $this->application->save();
        }

        return view('livewire.paciente.show.atenciones.atenciones-items', compact('items', 'atendidas', 'pendientes'));
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->paciente = $this->application->patient;
    }

    public function successItem(Application $application)
    {

        $this->mount($application);
    }
}
