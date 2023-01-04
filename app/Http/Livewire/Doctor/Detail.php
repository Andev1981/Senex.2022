<?php

namespace App\Http\Livewire\Doctor;

use Livewire\Component;
use App\Models\Doctor;
use App\Models\User;

class Detail extends Component
{
    public $doctor;
    public $open = false;
    public $name;
    public $rut;
    public $email;
    public $fecha_nacimiento;
    public $user;

    public function mount($doctor){
        $this->doctor = Doctor::find($doctor->id);
        $this->user = User::find($this->doctor->user->id);
        $this->name=$this->doctor->user->name;
        $this->rut=$this->doctor->user->rut;
        $this->email=$this->doctor->user->email;
        $this->birthday=$this->doctor->user->birthday;
        $this->emit('update',$this->doctor);
    }

    public function render()
    {
        return view('livewire.doctor.detail');
    }

    public function open(){
        $this->open =true;
    }

    public function cancel(){
        $this->open = '';
    }

    public function update(){
        $this->user->name = $this->name;
        $this->user->rut = $this->rut;
        $this->user->email = $this->email;
        $this->user->birthday = $this->birthday;
        $this->user->save();
        $this->open = '';
        $this->mount($this->doctor);
    }
}
