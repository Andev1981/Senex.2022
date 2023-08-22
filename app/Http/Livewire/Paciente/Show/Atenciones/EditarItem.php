<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\User;
use Livewire\Component;

class EditarItem extends Component
{
    public ApplyItem $applyItem;
    public $selectedKine;
    public $selectedStatus;
    public $selectedType;
    public $price;
    public $kines = [];
    public $types = [];
    public $openItem = 'hidden';
    public $openDelItem = 'hidden';
    public $fecha_atencion;
    public $comments;
    public $application;
    public $countApplies;
    public $applypaciente;
    public $user;

    protected $rules = [
        'applyItem.user_id' => 'required',
        'applyItem.status' => 'required',
        'applyItem.fecha_atencion' => '',
        'applyItem.comments' => 'max:255',
        'applyItem.application_type_id' => 'required',
        'applyItem.price' => 'required',
        'applyItem.numero_sesion' => 'required',
    ];

    public function render()
    {
        return view('livewire.paciente.show.atenciones.editar-item');
    }

    public function mount(ApplyItem $applyItem){
        $this->applyItem = $applyItem;
      
        $this->application = $this->applyItem->application->id;
        $this->applypaciente = Application::find($this->applyItem->application->id);
        $this->countApplies = ApplyItem::where('application_id',$this->application)->count();
        $this->kines = User::where('user_type','Kine')->get();
        $this->user = User::find($this->applypaciente->user_id);
        $this->types = ApplicationType::all();

    }

    public function save(){


        $this->validate();     
        $this->applyItem->save();
        $this->user->updated_at = now();
        $this->user->save();
        $this->saveActivity();
        $this->clear();
        
    }

    public function delete(){
        $this->applyItem->delete();
        $this->clear();
    }

    public function clear(){
        $this->resetValidation();
        $this->resetErrorBag();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-item',$this->application);
        $this->openItem = 'hidden';
    }

    public function saveActivity(){

         Activity::create([
                'user_id' => auth()->user()->id,
                'detail' => 'Se edita sesión de ' .  $this->user->name .' ' . $this->user->last_name,
            ]);

    }
}
