<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\User;
use App\Models\ApplicationType;
use Livewire\Component;

class AtencionesEditar extends Component
{

    public User $paciente;
    public Application $application;
    public $openDelAtencion = 'hidden',
        $openEditAtencion = 'hidden',
        $selectedApplicationType = "",
        $kine = '',
        $kines = [],
        $valor = 0,
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $documentos = [];

    protected $rules = [
            'kine' => 'required',
            'tipo_de_pago' => 'required',
            'valor' => 'required|integer|min:3|max:999999',
            'profesional_derivacion' => 'string|max:100',
            'lugar_derivacion' => 'string|max:150',
            'mensaje' => 'string|max:300',
            'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024'
    ];


    public function render()
    {
        return view('livewire.paciente.show.atenciones.atenciones-editar');
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->paciente = $application->user;
        $this->kines = User::where('user_type', 'Kine')->get();
        $this->valor = $application->price;
   

    }

    public function save(){
        if($this->validate()){
            $this->application->derivado = $this->profesional_derivacion;
            $this->application->desde = $this->lugar_derivacion;
            $this->application->comments = $this->mensaje;
            $this->application->type_payment = $this->forma_de_pago;
        }
         $this->saveActivity();
    }

    public function clear()
    {
       
        $this->resetValidation();
        $this->resetErrorBag();
        $this->reset([
            'profesional_derivacion',
            'lugar_derivacion',
            'mensaje',
            'forma_de_pago',
            'valor',
        ]);

        $this->clear();
            $this->dispatchBrowserEvent('swal-success');
            $this->emit('success-atencion',$this->paciente->id);
            $this->openEditAtencion = 'hidden';
    }

    public function delete(){
        $this->application->delete();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-atencion',$this->paciente->id);
        $this->openDelAtencion = 'hidden';
    }

    public function saveActivity(){

         Activity::create([
                'user_id' => auth()->user()->id,
                'detail' => 'Se actualiza atención de ' .  $this->paciente->name .' ' . $this->paciente->last_name,
            ]);
        $this->paciente->updated_at = now();
        $this->paciente->save();
    }
}
