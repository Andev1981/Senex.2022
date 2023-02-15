<?php

namespace App\Http\Livewire\Patient;

use App\Models\Assign;
use App\Models\User;
use App\Models\Patient;
use Livewire\Component;

class Detail extends Component
{
    public $patient;
    public $open = false;
    public $name;
    public $rut;
    public $email;
    public $fecha_nacimiento;
    public $user;
    public $phone;
    public $direccion;
    public $comuna;
    public $patients;

    public $modal = false;

    public function mount($paciente){

        $this->patients = Patient::all();
        $this->user = $paciente;
        $this->name=$paciente->user->name;
        $this->rut=$paciente->user->rut;
        $this->email=$paciente->user->email;
        $this->birthday=$paciente->user->birthday;
        $this->phone=$paciente->phone;
        $this->direccion=$paciente->direccion;
        $this->comuna=$paciente->comuna;
        // $this->p1=$paciente->p1;
        // $this->p2=$paciente->p2;
        // $this->p3=$paciente->p3;
        // $this->p4=$paciente->p4;
        // $this->p5=$paciente->p5;
        $this->emit('update',$paciente->id);
    }

    public function render()
    {
        return view('livewire.patient.detail');
    }
  
    public function open(){
        $this->open =true;
    }

    public function cancel(){
        $this->open = '';
    }

    public function update(){
        // dd($this->direccion);
     
        $this->user->user->name = $this->name;
        $this->user->user->rut = $this->rut;
        $this->user->user->email = $this->email;
        $this->user->user->birthday = $this->birthday;
        $this->user->phone = $this->phone;
        $this->user->direccion = $this->direccion;
        $this->user->comuna = $this->comuna;
        // guardar usuario
        $this->user->user->save();
        //guardar paciente 
        $this->user->save();
        
        $this->open = '';
        $this->mount($this->user);
        
    }
    public function openModal(){
        $this->modal = true;
    }

    public function closeModal(){
        $this->modal = false;
    }

    public function asignarApoderado($id){

        $search = Assign::where('user_id', $id)->first();
        if(!$search){
            $asignar = Assign::create([
                'user_id' => $id,
                'patient_id' => $this->user->id,
                'relation' => 0
            ]);
        }
        $this->emit('render');
        $this->closeModal();
    }

   

}
