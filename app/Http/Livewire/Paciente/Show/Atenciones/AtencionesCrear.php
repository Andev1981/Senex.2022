<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\ApplicationType;
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
           $tipo_atencion = "",
           $applicationTypes = [],
           $kine = "",
           $doctors = [],
           $valor,
           $sesiones,
           $profesional_derivacion = "",
           $lugar_derivacion = "",
           $mensaje = "",
           $documentos = [];

    protected $rules = [
        'valor' => 'required|integer|min:3|max:999999',
        'sesiones' => 'required|integer|min:1|max:99',
        'kine' => 'required',
        'tipo_atencion' => 'required',
        'profesional_derivacion' => 'required',
        'mensaje' => 'string',
        'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024'
    ];

    public function render()
    {
        return view('livewire.paciente.show.atenciones.atenciones-crear');
    }

     public function mount(User $paciente){
        $this->paciente = $paciente;
        $this->applicationTypes = ApplicationType::all();
        $this->doctors = User::where('user_type','Doctor')->get();
    }

    public function save(){

        $this->validate();

        $application = Application::create([
           'derivado' => $this->profesional_derivacion,
           'desde' => $this->lugar_derivacion,
           'comments' => $this->mensaje,
           'user_id' => $this->paciente->id,
           'application_type_id' => $this->tipo_atencion,
           'price' => $this->valor,
           'status' => 0,
        ]);

        foreach ($this->documentos as $file) {
            
            $fileExtension = $file->extension(); 
            
            $fileName = 'storage/'. $file->store('paciente/documentos/atencion-'.$application->id);
            
            $image = new Image([
                'url' => $fileName,
                'extencion' => $fileExtension
            ]);
            
            $application->images()->save($image);
        }

        for($i = 1; $i <= $this->sesiones; $i++){
            $apply = ApplyItem::create([
                'user_id' => $this->kine,
                'application_id' => $application->id,
            ]);

            Assign::create([
                'user_id' => $this->kine,
                'application_id' => $application->id,
                'apply_item_id' => $apply->id,
            ]);
        }



        $this->emit('success-atencion');
        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
        $this->openCrearAtencion = 'hidden';

    }

    public function clear(){
        $this->resetValidation();
        $this->resetErrorBag();
        $this->reset([
                        'profesional_derivacion',
                        'lugar_derivacion',
                        'mensaje',
                        'tipo_atencion',
                        'valor',
                        'sesiones',
                        'kine',
                    ]);
    }
}
