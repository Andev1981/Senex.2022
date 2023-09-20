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
    public $pacientes = [];
    public $selPaciente ='';
    protected $listeners = ['success-item-single' => 'mount','success' => 'render','success-item' => 'mount','success-atencion' => 'mount'];
    public $sort = 'created_at';
    public $direction = 'desc';

    public function render()
    {
        return view('livewire.paciente.listado-sesiones-paciente');
    }

     public function mount()
    {
        $this->buscarFecha = Carbon::now();
        $this->pacientes = User::where('user_type','Paciente')->get();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');
        $this->searchByItems();
    }

      public function searchByItems()
    {
        $this->buscarFecha =  $this->year . '-' . $this->month .'-';
        $this->applyItems = ApplyItem::with('application')->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->get();
    }
}
