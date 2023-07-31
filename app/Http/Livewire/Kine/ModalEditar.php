<?php

namespace App\Http\Livewire\Kine;

use App\Models\Comuna;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalEditar extends Component
{

     use WithFileUploads;

    public $doctor;
    public $regiones = [];
    public $comunas = [];
    public $open = 'hidden';
    public $openDel = 'hidden';
    public $file_path;
    public $status=0;

    
    protected $rules = [
        'doctor.name' => 'required|min:3|max:50',
        'doctor.last_name' => 'required|min:5|max:50',
        'doctor.phone' => 'required|min:9|max:9',
    ];

    protected $messages = [
        'doctor.name.required' => 'Nombre es requerido',
        'doctor.name.min' => 'Nombre debe tener al menos 3 caracteres',
        'doctor.name.max' => 'Nombre supera el límite permitido de caracteres',
        'doctor.last_name.required' => 'Apellido es requerido',
        'doctor.last_name.min' => 'Apellido debe tener al menos 5 caracteres',
        'doctor.last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'doctor.phone.required' => 'Teléfono es requerido',
        'doctor.phone.max' => 'Teléfono supera el máximo',
        'doctor.phone.min' => 'Teléfono debe tener al menos 12 caracteres',
    ];

    public function mount(User $doctor){
        if($doctor){
            $this->doctor = $doctor;
            if($this->doctor->id){
                $this->status = 1;
            }
        }
        $this->regiones = Region::where('id',1)->get();
        $this->comunas = Comuna::where('region_id',1)->get();
    }

    public function render()
    {
        return view('livewire.kine.modal-editar');
    }

    public function save(){

        $this->validate();

         if($this->file_path){
            $this->doctor->avatar = 'storage/'. $this->file_path->store('avatars','public');
        }

        $this->doctor->save();

        $this->emitUp('success');

        $this->dispatchBrowserEvent('swal-success');
        
        $this->clear();
    }

    public function delete(){
        $this->doctor->delete();
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
    }

    public function clear(){
        $this->resetErrorBag();
        $this->resetValidation();
        $this->open = 'hidden';
        $this->openDel = 'hidden';


    }

}
