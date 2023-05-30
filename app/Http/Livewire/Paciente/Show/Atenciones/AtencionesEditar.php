<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\User;
use Livewire\Component;

class AtencionesEditar extends Component
{

    public User $paciente;
    public Application $application;
    public $openAtencion = 'hidden',
        $openDelAtencion = 'hidden',
        $tipo_atencion = '',
        $applicationTypes = [],
        $kine = '',
        $doctors = [],
        $valor = 0,
        $sesiones = 0,
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $documentos = [];


    public function render()
    {
        return view('livewire.paciente.show.atenciones.atenciones-editar');
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->paciente = $this->application->user;
    }
}
