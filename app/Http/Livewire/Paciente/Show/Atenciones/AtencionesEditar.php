<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\User;
use App\Models\ApplicationType;
use App\Models\Doctor;
use App\Models\Patient;
use Livewire\Component;

class AtencionesEditar extends Component
{

    public Patient $paciente;
    public Application $application;
    public $openDelAtencion = 'hidden',
        $openEditAtencion = 'hidden',
        $selectedApplicationType = "",
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $status, $forma_de_pago;

    protected $rules = [
        'forma_de_pago' => 'required',
        'profesional_derivacion' => 'string|max:100',
        'lugar_derivacion' => 'string|max:150',
        'mensaje' => 'string|max:300'
    ];


    public function render()
    {
        return view('livewire.paciente.show.atenciones.atenciones-editar');
    }

    public function mount($application)
    {

        $this->application = $application;
        $this->paciente = $application->patient;
        $this->status = $application->status;
        $this->lugar_derivacion = $application->desde;
        $this->profesional_derivacion = $application->derivado;
        $this->forma_de_pago = $application->type_payment;
    }

    public function saveAtencion()
    {

        $this->validate();
        $this->application->desde = $this->profesional_derivacion;
        $this->application->derivado = $this->lugar_derivacion;
        $this->application->comments = $this->mensaje;
        $this->application->type_payment = $this->forma_de_pago;
        $this->application->status = $this->status;
        $this->application->save();
        $this->clear();

        /* 
        [
            'derivado' => $this->profesional_derivacion,
            'desde' => $this->lugar_derivacion,
            'comments' => $this->mensaje,
            'type_payment' => $this->forma_de_pago,
            'status' => $this->status
        ]
        */
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
            'status'
        ]);

        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-atencion', $this->paciente);
        $this->openEditAtencion = 'hidden';
        $this->mount($this->application);
    }

    public function delete()
    {
        $this->application->delete();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-atencion', $this->paciente->id);
        $this->openDelAtencion = 'hidden';
    }
}
