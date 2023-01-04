<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use App\Models\Schedule;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

class Agenda extends Component
{
    public $schedules;
    public $open = '';
    public $openEdit = '';
    public $fecha;
    public $repeticiones;
    public $fechaEdit;
    public $repeticionesEdit;
    public $repeticionesAtendidas='0';
    public $doctor;
    public $errores;
    public $shedule;

    public function mount($doctor){

        $this->fecha = Carbon::now();
        $this->doctor = Doctor::find($doctor->id);
        $this->schedules = Schedule::where('user_id',$this->doctor->user_id)->get();
    }

    public function render()
    {
        return view('livewire.doctor.tabs.agenda');
    }

    public function abrir(){
        $this->open = true;
    }

    public function cerrar(){
        $this->open = "";
        $this->fecha = Carbon::now();
        $this->repeticiones = "";
        $this->repeticionesAtendidas = "";
        $this->openEdit = '';
        $this->errores = '';
    }

    public function save(){

        $fechaHoy = Carbon::now();
        $compara = Carbon::parse($this->fecha);

        $res = $compara->isBefore($fechaHoy->subDays(1));

        if($res){
            $this->errores = "La fecha no puede ser menor a la actual";
            return;
        }

        $fecha = Schedule::where('fecha_disponible', $this->fecha)->where('user_id',  $this->doctor->user_id)->first();

        if($fecha){
            $this->errores = "Fecha ya se ha ingresado anteriormente";
        }else{
            Schedule::create([
                'fecha_disponible' => $this->fecha,
                'quantity' => $this->repeticiones,
                'quantity_usage' => $this->repeticionesAtendidas,
                'user_id' => $this->doctor->user_id
            ]);

            $this->schedules = Schedule::where('user_id',$this->doctor->user_id)->get();
            $this->cerrar();
        }

    }

    public function show($id){

        $this->schedule = Schedule::find($id);

        $this->fechaEdit = $this->schedule->fecha_disponible;
        $this->repeticionesEdit = $this->schedule->quantity;

        $this->openEdit = true;

    }

    public function update(){
        $fechaHoy = Carbon::now();
        $compara = Carbon::parse($this->fechaEdit);

        $res = $compara->isBefore($fechaHoy->subDays(1));

        if($res){
            $this->errores = "La fecha no puede ser igual o menor a la actual";
            return;
        }

        $this->schedule->fecha_disponible = $this->fechaEdit;
        $this->schedule->quantity = $this->repeticionesEdit;
        $this->schedule->save();
        $this->schedules = Schedule::where('user_id',$this->doctor->user_id)->get();
        $this->cerrar();
    }

}
