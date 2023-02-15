<?php

namespace App\Http\Livewire\Patient;

use App\Models\User;
use App\Models\Assign;
use App\Models\Patient;
use Livewire\Component;
use Livewire\WithFileUploads;

class Card extends Component
{
    protected $listeners = ['update' => 'mount', 'render' => 'mount'];
    use WithFileUploads;
    public $paciente;
    public $name;
    public $open;
    public $opens = false;
    public $img;
    public $assignates;
    public $modal = false;
    public $p1;
    public $p2;
    public $p3;
    public $p4;
    public $p5;
    public $user;

    public $parametro;  

    public function opens(){
        $this->modal =true;
      
    }
    public function closeModal(){
        $this->modal = false;
    }

    public function mount($paciente){

        $this->parametro = $paciente;
        $this->paciente = Patient::find($paciente);
        $this->name = $this->paciente->user->name;
        $this->p1 = $this->paciente->p1;
        $this->p2 = $this->paciente->p2;
        $this->p3 = $this->paciente->p3;
        $this->p4 = $this->paciente->p4;
        $this->p5 = $this->paciente->p5;

        $this->assignates = Assign::where('patient_id', $paciente)->get();
    }

    public function render()
    {
        return view('livewire.patient.card');
    }

    public function cerrar(){
        $this->open = '';
    }
    public function changeAvatar(){
        $this->open = true;
    }

    public function save(){

        $this->validate([
            'img' => 'required|image|max:1024',
        ]);

            $nombre =  time() . '.'.$this->img->getClientOriginalExtension();
            $this->img->storeAs('img/avatar', $nombre);

            $user = User::find($this->paciente->user->id);
            $user->avatar = 'img/avatar/'.$nombre;
            $user->save();
            $this->img = '';
            $this->open='';
            $this->mount($this->parametro);

    }
    public function deleteApoderado($id){

           $sd = Assign::findOrFail($id);
           $sd->delete();

           $this->mount($this->parametro);
    }

    public function update(){

        $this->paciente->p1= $this->p1;
        $this->paciente->p2= $this->p2;
        $this->paciente->p3=$this->p3;
        $this->paciente->p4=$this->p4;
        $this->paciente->p5=$this->p5;
        $this->paciente->save();
        $this->modal = '';
        $this->mount($this->parametro);
        
    }
    public function cancel(){
        $this->modal = '';
    }

}
