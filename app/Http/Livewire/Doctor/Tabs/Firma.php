<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Support\Facades\Session;
use App\Models\Image;
use App\Models\Doctor;

class Firma extends Component
{
    use WithFileUploads;

    public $subirImagen;
    public $firmaDigital;
    public $editar;
    public $img;
    public $firma;

    public $doctor;

    public function mount($doctor){

        $this->doctor = Doctor::find($doctor->id);
        $this->firma = $this->doctor->firma;
    }

    public function render()
    {
        return view('livewire.doctor.tabs.firma');
    }

    public function imagen(){
        $this->subirImagen = true;
        $this->firmaDigital = false;
    }

    public function firma(){
        $this->firmaDigital = true;
        $this->subirImagen = false;
        $this->dispatchBrowserEvent('cargar-firma');
    }

    public function resetear(){
        $this->firmaDigital = false;
        $this->subirImagen = false;
        $this->editar = false;
        $this->img = "";
    }

    public function editar(){
        $this->editar = true;
    }

    public function save(){

        $this->validate([
            'img' => 'required|image|max:1024',
        ]);

        $nombre =  time() . '.'.$this->img->getClientOriginalExtension();
        $this->img->storeAs('img/firma', $nombre);

        $this->doctor->firma = 'img/firma/'.$nombre;
        $this->doctor->save();

        $this->resetear();

        $this->mount( $this->doctor);

    }

}
