<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class EditarItem extends Component
{
    public ApplyItem $applyItem;
    public  $patient, 
            $types = [],
            $kines = [],
            $openItem = 'hidden',
            $openDelItem = 'hidden',
            $selectedKine,
            $selectedStatus,
            $selectedType,
            $application,
            $countApplies,
            $applypaciente,
            $fecha_atencion,
            $comments = '',
            $price,
            $numero_sesion,
            $errorNumSesion=false;

    protected $rules = [
        'selectedKine' => 'required',
        'selectedStatus' => 'required',
        'fecha_atencion' => 'required',
        'comments' => 'max:255',
        'selectedType' => 'required',
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
        $this->patient = $this->applyItem->patient;
        $this->selectedKine = $applyItem->doctor->id;
        $this->selectedStatus = $applyItem->status;
        if($applyItem->fecha_atencion){
        $this->fecha_atencion = Carbon::parse(strtotime($applyItem->fecha_atencion))->format('Y-m-d');
        }
        $this->comments = $applyItem->comments;
        $this->selectedType = $applyItem->application_type_id;
        $this->price = $applyItem->price;
        $this->numero_sesion = $applyItem->numero_sesion;
        $this->countApplies = ApplyItem::where('application_id',$this->application->id)->count();
        $this->kines = Doctor::all();
        $this->types = ApplicationType::all();

    }

    public function save(){


        $this->validate();   

        
        
        if($this->applyItem->numero_sesion != $this->numero_sesion){
            $val = ApplyItem::where('application_id',$this->application->id)->where('numero_sesion',$this->numero_sesion)->first();
            if($val){
                $this->errorNumSesion = true;
                return;
            }else{
                $this->errorNumSesion = false;
            }
        }

        $this->applyItem->user_id = $this->selectedKine;
        $this->applyItem->doctor_id = $this->selectedKine;
        $this->applyItem->status = $this->selectedStatus;

        if($this->fecha_atencion){
            $this->applyItem->fecha_atencion = $this->fecha_atencion;
        }

        $this->applyItem->comments = $this->comments;
        $this->applyItem->application_type_id = $this->selectedType;
        $this->applyItem->price = $this->price;
        $this->applyItem->numero_sesion = $this->numero_sesion;
        $this->applyItem->save();
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
        $this->emit('success-item');
        $this->openItem = 'hidden';
        $this->openDelItem = 'hidden';
        $this->errorNumSesion = false;
    }
}
