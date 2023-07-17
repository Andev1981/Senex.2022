<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\User;
use App\Models\ApplicationType;
use Livewire\Component;

class AtencionesEditar extends Component
{

    public User $paciente;
    public Application $application;
    public $openAtencion = 'hidden',
        $openDelAtencion = 'hidden',
        $tipo_atencion = '',
        $applicationTypes = [],
        $selectedApplicationType = "",
        $kine = '',
        $doctors = [],
        $valor = 0,
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $documentos = [];

    protected $rules = [
            'kine' => 'required',
            'tipo_atencion' => 'required',
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
        $this->applicationTypes = ApplicationType::all();
        $this->kine = $application->user;
        $this->doctors = User::where('user_type', 'Kine')->get();
        $this->valor = $application->price;
        if($application->type){
            $this->selectedApplicationType = $application->type;
        }

    }

    public function save(){
        if($this->validate()){

        }
    }
}
