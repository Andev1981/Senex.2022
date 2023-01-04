<?php

namespace App\Http\Livewire\Doctor;

use Livewire\Component;
use App\Models\Doctor;
use App\Models\User;

use Livewire\WithFileUploads;

class Card extends Component
{

    use WithFileUploads;

    protected $listeners = ['update' => 'mount'];
    public $doctor;
    public $open;
    public $img;
    public function mount($doctor){
        
        $this->doctor = Doctor::find($doctor['id']);

    }

    public function render()
    {
        return view('livewire.doctor.card');
    }

    public function cerrar(){
        $this->open = '';
    }
    public function changeAvatar(){
        $this->open = true;
    }

    public function save(){

        $this->validate([
            'img' => 'required|mimes:jpg,jpeg,png,bmp,gif,svg|max:1024',
        ]);

            $nombre =  time() . '.'.$this->img->getClientOriginalExtension();
            $this->img->storeAs('/img/avatar', $nombre);

            $user = User::find($this->doctor->user->id);
            $user->avatar = 'img/avatar/'.$nombre;
            $user->save();
            $this->img = '';
            $this->open='';
            $this->mount($this->doctor);

    }

}
