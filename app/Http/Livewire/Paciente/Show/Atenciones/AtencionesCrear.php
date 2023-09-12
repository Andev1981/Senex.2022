<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\Image;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class AtencionesCrear extends Component
{
    use WithFileUploads;
    public User $paciente;
    public $openCrearAtencion = 'hidden',
        $tipo_atenciones = [],
        $tipo_atencion = '',
        $doctors = [],
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $documentos = [],
        $kine = "",
        $valor,
        $forma_de_pago,
        $errorNumSesion=false,
        $status = '',
        $fecha_atencion,
        $applyUser;

    protected $rules = [
        'kine' => 'required',
        'forma_de_pago' => 'required',
        'valor' => 'required|integer|min:3|max:999999',
        'profesional_derivacion' => 'string|max:100',
        'lugar_derivacion' => 'string|max:150',
        'mensaje' => 'string|max:300',
        'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024',
        'tipo_atencion' => 'required',
        'status' => 'required',
         'fecha_atencion' => 'date',
    ];

    public function render()
    {
      
        return view('livewire.paciente.show.atenciones.atenciones-crear');
    }

    public function mount(User $user)
    {
        $this->paciente = $user;
        $this->doctors = User::where('user_type', 'Kine')->get();
        $this->tipo_atenciones = ApplicationType::all();
    }

    public function saveAtencion()
    {

        $this->validate();

          $this->applyUser = ApplicationTypeUser::where('user_id',$this->kine)->where('application_type_id',$this->tipo_atencion)->first();

          if(!$this->applyUser){
            $this->applyUser = ApplicationTypeUser::create([
                'user_id' => $this->kine,
                'application_type_id' => $this->tipo_atencion,
                'price' => $this->valor,
            ]);
          }

       

        $application = Application::create([
            'derivado' => $this->profesional_derivacion,
            'desde' => $this->lugar_derivacion,
            'comments' => $this->mensaje,
            'user_id' => $this->paciente->id,
            'status' => $this->status,
            'type_payment' => $this->forma_de_pago,
            'type_value' => 0,
        ]);


        $this->paciente->updated_at = now();
        $this->paciente->save();

        foreach ($this->documentos as $file) {

            $fileExtension = $file->extension();

            $fileName = 'storage/' . $file->store('paciente/documentos/atencion-' . $application->id);

            $image = new Image([
                'url' => $fileName,
                'extencion' => $fileExtension
            ]);

            $application->images()->save($image);
        }


            $apply = ApplyItem::create([
                'user_id' => $this->kine,
                'application_id' => $application->id,
                'fecha_atencion' => $this->fecha_atencion,
                'application_type_id' => $this->tipo_atencion,
                'application_type_user_id' => $this->applyUser->id,
                'price' => $this->valor,
                'numero_sesion' => 1,
            ]);

            Assign::create([
                'user_id' => $this->kine,
                'application_id' => $application->id,
                'apply_item_id' => $apply->id,
                'application_type_user_id' =>  $this->applyUser->id,
            ]);

            $this->saveActivity();
     
            $this->clear();
            $this->dispatchBrowserEvent('swal-success');
            $this->emit('success-atencion');
            $this->openCrearAtencion = 'hidden';
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
    }

    public function saveActivity(){

         Activity::create([
                'user_id' => auth()->user()->id,
                'detail' => 'Se crea nueva atención para usuario ' .  $this->paciente->name .' ' . $this->paciente->last_name,
            ]);
    }
}
