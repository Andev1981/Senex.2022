<?php

namespace App\Http\Livewire\Paciente;

use App\Models\Address;
use App\Models\Comuna;
use App\Models\Question;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalEditar extends Component
{

    use WithFileUploads;
    public User $paciente;
    public Address $address;

    public $open = 'hidden';
    public $openDel = 'hidden';
    public $regiones = [];
    public $comunas = [];
    public $questions = [];


    protected $rules = [
        'paciente.name' => 'required|min:3|max:50',
        'paciente.last_name' => 'required|min:3|max:50',
        'paciente.rut' => 'required|max:10|min:9',
        'paciente.birth' => 'required|date',
        'paciente.phone' => 'required',
        'paciente.status' => 'required',
        'address.street' => 'required|max:150',
        'address.number' => 'required|integer',
        'address.address' => 'required|max:150',
        'address.comuna_id' => 'required',
    ];

    public function mount(User $paciente)
    {
        $this->paciente = $paciente;
        $this->questions = Question::all();
        $this->address = $paciente->address;
        $this->regiones = Region::where('id', 1)->get();
        $this->comunas = Comuna::where('region_id', 1)->get();
    }

    public function render()
    {
        return view('livewire.paciente.modal-editar');
    }


    public function save()
    {

        $this->validate();

        $this->address->save();
        $this->paciente->save();

        $this->emit('success');

        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
        $this->open = 'hidden';
    }

    public function delete()
    {
        $this->paciente->delete();
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
        $this->openDel = 'hidden';
    }

    public function clear()
    {
        $this->resetErrorBag();
        $this->resetValidation();
    }
}
