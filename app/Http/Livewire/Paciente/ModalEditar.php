<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalEditar extends Component
{

    use WithFileUploads;
    public User $paciente;

    public $open = 'hidden';
    public $openDel = 'hidden';
    public $file_path;

    
    protected $rules = [
        'paciente.name' => 'required|min:3|max:50',
        'paciente.last_name' => 'required|min:3|max:50',
        'paciente.phone' => 'required|min:9|max:9',
    ];
/* 
    protected $messages = [
        'paciente.name.required' => 'Nombre es requerido',
        'paciente.name.min' => 'Nombre debe tener al menos 3 caracteres',
        'paciente.name.max' => 'Nombre supera el límite permitido de caracteres',
        'paciente.last_name.required' => 'Apellido es requerido',
        'paciente.last_name.min' => 'Apellido debe tener al menos 3 caracteres',
        'paciente.last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'paciente.phone.required' => 'Telefono es requerido',
        'paciente.phone.max' => 'Teléfono supera el máximo',
        'paciente.phone.min' => 'Ingrese número completo',
        'name.required' => 'El campo nombre es obligatorio',
    ]; */

    public function mount(User $paciente){
        $this->paciente = $paciente;

    }

    public function updated($phone){
        $this->validateOnly($phone);
    }

    public function render()
    {
        return view('livewire.paciente.modal-editar');
    }

    public function save(){

        $this->validate();
        
        if($this->file_path){
            $this->paciente->avatar = 'storage/'. $this->file_path->store('avatars','public');
        }
        $this->paciente->save();

        $this->emit('success');

        $this->dispatchBrowserEvent('swal-success');
        
        $this->clear();
        $this->open = 'hidden';
    }

    public function delete(){
        $this->paciente->delete();
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
        $this->openDel = 'hidden';
    }

    public function clear(){
        $this->resetErrorBag();
        $this->resetValidation();
    }
}
