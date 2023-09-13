<?php

namespace App\Http\Livewire\Paciente;

use App\Models\ApplyItem;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;

class ListadoSesionesPaciente extends Component
{

    public $buscarFecha;
    public $year;
    public $month;
    public $applyItems = [];
    protected $listeners = ['success-item-single' => 'mount','success' => 'render','success-item' => 'mount','success-atencion' => 'mount'];

    public function render()
    {
        return view('livewire.paciente.listado-sesiones-paciente');
    }

     public function mount()
    {
        $this->buscarFecha = Carbon::now();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');
        $this->searchByItems();
    }

      public function searchByItems()
    {
        $this->buscarFecha =  $this->year . '-' . $this->month .'-';
        $this->applyItems = ApplyItem::where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy('created_at', 'desc')->get();
    }
}
