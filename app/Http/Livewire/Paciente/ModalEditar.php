<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;

class ModalEditar extends Component
{
    public $paciente;

    public $open = 'hidden';
    public $openDel = 'hidden';

    
    protected $rules = [
        'paciente.name' => 'required|min:3|max:50',
        'paciente.last_name' => 'required|min:5|max:50',
        'paciente.phone' => 'required|min:12|max:12',
    ];

    protected $messages = [
        'paciente.name.required' => 'Nombre es requerido',
        'paciente.name.min' => 'Nombre debe tener al menos 3 caracteres',
        'paciente.name.max' => 'Nombre supera el límite permitido de caracteres',
        'paciente.last_name.required' => 'Apellido es requerido',
        'paciente.last_name.min' => 'Apellido debe tener al menos 5 caracteres',
        'paciente.last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'paciente.phone.required' => 'Telefono es requerido',
        'paciente.phone.max' => 'Teléfono supera el máximo',
        'paciente.phone.min' => 'Teléfono debe tener al menos 12 caracteres',
    ];

    public function mount(User $paciente){
        $this->paciente = $paciente;
    }

    public function render()
    {
        return view('livewire.paciente.modal-editar');
    }

    public function save(){

        $this->validate();

        $this->paciente->save();

        $this->emitUp('success');

        $this->dispatchBrowserEvent('swal-success');
        
        $this->clear();
    }

    public function delete(){
        $this->paciente->delete();
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
