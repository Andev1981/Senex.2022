<?php

namespace App\Http\Livewire\Paciente;

use App\Models\ApplyItem;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoSesionesPaciente extends Component
{

    use WithPagination;
    public $buscarFecha;
    public $year;
    public $month;
    public $pacientes = [];
    public $selPaciente;
    public $kines = [];
    public $selKine;
    protected $listeners = ['success-item-single' => 'render','success' => 'render','success-item' => 'render','success-atencion' => 'render'];
    public $sort = 'created_at';
    public $direction = 'desc';
    public $reloadStatus = 0;
    public $quantity = 10;

    public function render()
    {
        if($this->reloadStatus == 0){
            $this->buscarFecha = Carbon::now();
            $this->pacientes = Patient::all();
            $this->kines = Doctor::all();
            $this->month = $this->buscarFecha->format('m');
            $this->year = $this->buscarFecha->format('Y');
            $this->reloadStatus = 1;
        }
       
        $this->buscarFecha =  $this->year . '-' . $this->month .'-';
        if($this->selPaciente != 0 && $this->selKine != 0){
           
            $applyItems = ApplyItem::with('application','patient','doctor')->where('patient_id', $this->selPaciente)->orWhere('doctor_id', $this->selKine)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate($this->quantity);
     

        }elseif($this->selPaciente != 0){
           
            $applyItems = ApplyItem::with('application','patient','doctor')->where('patient_id', $this->selPaciente)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate($this->quantity);
     

        }elseif($this->selKine != 0){
           
            $applyItems = ApplyItem::with('application','patient','doctor')->where('doctor_id', $this->selKine)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate($this->quantity);
     

        }else{
            $applyItems = ApplyItem::with('application','patient','doctor')->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate($this->quantity);
        }

        return view('livewire.paciente.listado-sesiones-paciente', compact('applyItems'));
    }

}
