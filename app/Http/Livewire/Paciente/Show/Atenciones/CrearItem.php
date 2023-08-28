<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Activity;
use Livewire\Component;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\User;


class CrearItem extends Component
{

    public $application,
           $tipo_atenciones = [],
           $kines = [],
           $openItemCreate = 'hidden',
           $kine = '',
           $tipo_atencion = '',
           $status = '',
           $valor = '',
           $fecha_atencion,
           $mensaje ='',
           $numero_sesion,
           $paciente,
           $countApplies;
    
    protected function rules() {
        return [
            'kine' => 'required',
            'tipo_atencion' => 'required',
            'status' => 'required',
            'valor' => 'required|integer|min:1|max:999999',
            'mensaje' => 'max:255',
            'numero_sesion' => 'required',
        ];
    }
    
    public function render()
    {
        return view('livewire.paciente.show.atenciones.crear-item');
    }

    public function mount(Application $application)
    {
        $this->application = $application;
        $this->countApplies = ApplyItem::where('application_id',$this->application->id)->count();
        $valor = ApplyItem::where('application_id',$this->application->id)->orderBy('id','desc')->first('price');
        $this->valor = $valor->price;
        $this->tipo_atenciones = ApplicationType::all();
        $this->kines = User::where('user_type', 'Kine')->get();
        $this->paciente = $this->application->user;
       
    }

    public function save(){
        
        $this->validate();
        
        $apply = ApplyItem::create([
            'user_id' => $this->kine,
            'application_id' => $this->application->id,
            'application_type_id' => $this->tipo_atencion,
            'price' => $this->valor,
            'numero_sesion' =>$this->numero_sesion,
        ]);


        $applicationTypeUser = ApplicationTypeUser::where('apply_item_id',$apply->id)->where('user_id',$this->kine)->first();


        Assign::create([
                'user_id' => $this->kine,
                'application_id' => $this->application->id,
                'apply_item_id' => $apply->id,
                'application_type_user_id' => $applicationTypeUser->id,
        ]);



       
        $this->saveActivity();
        $this->clear();
    }

    public function clear()
    {
        $this->resetErrorBag();
        $this->resetValidation();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-item-single',$this->application->id);
        $this->openItemCreate = 'hidden';
         $this->reset([
            'kine',
            'tipo_atencion',
            'status',
            'mensaje',
            'numero_sesion'
        ]);

    }

    public function saveActivity(){

 
         Activity::create([
                'user_id' => auth()->user()->id,
                'detail' => 'Se ingresa nueva sesión para ' .  $this->application->user->name .' ' . $this->application->user->last_name,
            ]);
        $this->paciente->updated_at = now();
        $this->paciente->save();
    }

}
