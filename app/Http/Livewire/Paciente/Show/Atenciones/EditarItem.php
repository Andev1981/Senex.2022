<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;

class EditarItem extends Component
{
    public ApplyItem $applyItem;
    public  $types = [],
            $kines = [],
            $openItem = 'hidden',
            $openDelItem = 'hidden',
            $selectedKine,
            $selectedStatus,
            $selectedType,
            $application,
            $countApplies,
            $applypaciente,
            $user,
            $user_id,
            $status,
            $fecha_atencion,
            $comments = '',
            $application_type_id,
            $price,
            $numero_sesion;

    protected $rules = [
        'user_id' => 'required',
        'status' => 'required',
        'fecha_atencion' => '',
        'comments' => 'max:255',
        'application_type_id' => 'required',
        'price' => 'required',
        'numero_sesion' => 'required',
    ];

    public function render()
    {
        return view('livewire.paciente.show.atenciones.editar-item');
    }

    public function mount(ApplyItem $applyItem){

        $this->applyItem = $applyItem;      
        $this->application = $applyItem->application;
        $this->user = $applyItem->application->user;
        $this->user_id = (int)$applyItem->user_id;
        $this->status = (int)$applyItem->status;
        if($applyItem->fecha_atencion){
        $this->fecha_atencion = Carbon::parse(strtotime($applyItem->fecha_atencion))->format('Y-m-d');
        }
        $this->comments = $applyItem->comments;
        $this->application_type_id = (int)$applyItem->application_type_id;
        $this->price = (int)$applyItem->price;
        $this->numero_sesion = (int)$applyItem->numero_sesion;
        $this->countApplies = ApplyItem::where('application_id',$this->application->id)->count();
        $this->kines = User::where('user_type','Kine')->get();
        $this->types = ApplicationType::all();

    }

    public function save(){


        $this->validate();     
        $this->applyItem->user_id = $this->user_id;
        $this->applyItem->status = $this->status;
        if($this->fecha_atencion){
            $this->applyItem->fecha_atencion = $this->fecha_atencion;
        }
        $this->applyItem->comments = $this->comments;
        $this->applyItem->application_type_id = $this->application_type_id;
        $this->applyItem->price = $this->price;
        $this->applyItem->numero_sesion = $this->numero_sesion;
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
