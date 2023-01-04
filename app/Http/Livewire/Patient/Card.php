<?php

namespace App\Http\Livewire\Patient;

use App\Models\User;
use App\Models\Assign;
use App\Models\Patient;
use Livewire\Component;
use Livewire\WithFileUploads;

class Card extends Component
{
    protected $listeners = ['update' => 'mount'];
    use WithFileUploads;
    public $paciente;
    public $name;
    public $open;
    public $img;
    public $assignates;

    public function mount($paciente){

        $this->paciente = Patient::find($paciente);
        $this->name = $this->paciente->user->name;
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
            $this->mount($this->paciente);

    }

}
