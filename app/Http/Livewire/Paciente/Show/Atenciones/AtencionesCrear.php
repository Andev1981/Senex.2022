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
        $tipo_atenciones = [],
        $doctors = [],
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $mensaje = "",
        $documentos = [],
        $kine = "",
        $valor,
        $forma_de_pago;

    protected $rules = [
        'kine' => 'required',
        'tipo_atencion' => 'required',
        'forma_de_pago' => 'required',
        'valor' => 'required|integer|min:3|max:999999',
        'profesional_derivacion' => 'string|max:100',
        'lugar_derivacion' => 'string|max:150',
        'mensaje' => 'string|max:300',
        'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024'
    ];

    public function render()
    {
        return view('livewire.paciente.show.atenciones.atenciones-crear');
    }

    public function mount(User $paciente)
    {
        $this->paciente = $paciente;
        $this->tipo_atenciones = ApplicationType::all();
        $this->doctors = User::where('user_type', 'Kine')->get();
    }

    public function saveAtencion()
    {

        $this->validate();

        $application = Application::create([
            'derivado' => $this->profesional_derivacion,
            'desde' => $this->lugar_derivacion,
            'comments' => $this->mensaje,
            'user_id' => $this->paciente->id,
            'status' => 0,
            'type_payment' => $this->forma_de_pago,
            'type_value' => 0,
        ]);

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
                'application_type_id' => $this->tipo_atencion,
                'price' => $this->valor,
            ]);

            Assign::create([
                'user_id' => $this->kine,
                'application_id' => $application->id,
                'apply_item_id' => $apply->id,
            ]);
     
            $this->clear();
            $this->dispatchBrowserEvent('swal-success');
            $this->emit('success-atencion',$this->paciente->id);
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
            'tipo_atencion',
            'forma_de_pago',
            'valor',
        ]);
    }
}
