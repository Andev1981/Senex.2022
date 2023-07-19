<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use Livewire\Component;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\User;


class CrearItem extends Component
{

    public $application,
           $tipo_atenciones = [],
           $kines = [],
           $openItemCreate = 'hidden',
           $kine,
           $tipo_atencion,
           $status,
           $valor,
           $fecha_atencion,
           $mensaje;
    
    protected $rules = [
            'kine' => 'required',
            'tipo_atencion' => 'required',
            'status' => 'required',
            'valor' => 'required|integer|min:1|max:999999',
            'mensaje' => 'max:255',
        ];
    
    public function render()
    {
        return view('livewire.paciente.show.atenciones.crear-item');
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->tipo_atenciones = ApplicationType::all();
        $this->kines = User::where('user_type', 'Kine')->get();
    }

    public function saveApply(){
        
        $this->validate();
        
        $apply = ApplyItem::create([
            'user_id' => $this->kine,
            'application_id' => $this->application->id,
            'application_type_id' => $this->tipo_atencion,
            'price' => $this->valor,
        ]);


        $assign = Assign::create([
                'user_id' => $this->kine,
                'application_id' => $this->application->id,
                'apply_item_id' => $apply->id,
            ]);

        
        $this->clear();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-item-single',$this->application->id);
        $this->openItemCreate = 'hidden';
    }

    public function clear()
    {
        $this->resetValidation();
        $this->resetErrorBag();
        $this->reset([
            'kine',
            'mensaje',
            'tipo_atencion',
            'valor',
        ]);
    }

}
