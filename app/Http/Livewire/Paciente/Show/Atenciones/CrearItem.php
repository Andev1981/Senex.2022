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
use Carbon\Carbon;

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
           $countApplies,
           $errorNumSesion=false,
           $estado = 0,
           $profesional_derivacion = "",
           $lugar_derivacion = "",
           $documentos = [],
           $forma_de_pago,
           $applyUser;
    
    protected function rules() {
        if($this->estado == 1){

            return [
                'kine' => 'required',
                'tipo_atencion' => 'required',
                'status' => 'required',
                'valor' => 'required|integer|min:1|max:999999',
                'mensaje' => 'max:255',
                'numero_sesion' => 'required',
                'fecha_atencion' => 'required',
                'forma_de_pago' => 'required',
                'profesional_derivacion' => 'string|max:100',
                'lugar_derivacion' => 'string|max:150',
                'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024',
            ];

        }else{
            return [
                'kine' => 'required',
                'tipo_atencion' => 'required',
                'status' => 'required',
                'valor' => 'required|integer|min:1|max:999999',
                'mensaje' => 'max:255',
                'numero_sesion' => 'required',
                'fecha_atencion' => 'required',
            ];
        }
        
    }
    
    public function render()
    {
        return view('livewire.paciente.show.atenciones.crear-item');
    }

    public function mount(User $user)
    {

        $this->application = Application::where('user_id',$user->id)->where('status',1)->first();

        if(!$this->application){
            $this->countApplies = 0;
            $this->valor = 0;
            $this->estado = 1;
        }else{
            $this->countApplies = ApplyItem::where('application_id',$this->application->id)->count();
            $valor = ApplyItem::where('application_id',$this->application->id)->orderBy('id','desc')->first('price');
            if($valor){
                $this->valor = $valor->price;
            }else{
                $this->valor = 0;
            }
        }

        $this->tipo_atenciones = ApplicationType::all();
        $this->kines = User::where('user_type', 'Kine')->get();
        $this->paciente = $user;
       
    }

    public function save(){
        
        $this->validate();

        if($this->estado == 1){
            $this->application = Application::create([
                'derivado' => $this->profesional_derivacion,
                'desde' => $this->lugar_derivacion,
                'comments' => $this->mensaje,
                'user_id' => $this->paciente->id,
                'status' => 1,
                'type_payment' => $this->forma_de_pago,
            ]);
            $this->estado == 0;
        }else{
            $validador = ApplyItem::where('application_id',$this->application->id)->where('numero_sesion',$this->numero_sesion)->first();
            if($validador){
                $this->errorNumSesion = true;
                return;
            }else{
                $this->errorNumSesion = false;
            }
        }

        

        $apply = ApplyItem::create([
            'user_id' => $this->kine,
            'application_id' => $this->application->id,
            'application_type_id' => $this->tipo_atencion,
            'application_type_user_id' => 0,
            'price' => $this->valor,
            'fecha_atencion' => $this->fecha_atencion,
            'numero_sesion' =>$this->numero_sesion,
        ]);


        $applicationTypeUser = ApplicationTypeUser::where('application_type_id',$this->application->id)->where('user_id',$this->kine)->first();

        if(!$applicationTypeUser){
            $applicationTypeUser = ApplicationTypeUser::create([
                'user_id' => $this->kine,
                'application_type_id' => $this->tipo_atencion,
                'price' => 0
            ]);
        }

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
        $this->emit('success-item-single');
        $this->openItemCreate = 'hidden';
         $this->reset([
            'kine',
            'tipo_atencion',
            'status',
            'mensaje',
            'numero_sesion',
            'estado'
        ]);
         $this->errorNumSesion = false;

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
