<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Keeper;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ApoderadosCrear extends Component
{
    use WithFileUploads;

    public User $paciente;
    public $open = 'hidden';
    public $name = "";
    public $last_name = "";
    public $phone = "";
    public $email = "";


    protected $rules = [
        'name' => 'required|min:3|max:50',
        'last_name' => 'required|min:3|max:50',
        'phone' => 'required|min:9|max:9',
        'email' => 'required|email|unique:users,email|min:10|max:200',
    ];

    public function render()
    {
        return view('livewire.paciente.show.apoderados-crear');
    }

    public function mount(User $paciente){
        $this->paciente = $paciente;

    }

    public function updated($phone){
        $this->validateOnly($phone);
    }

    public function save(){

        $this->validate();

        $keeper = Keeper::create([
           'name' => $this->name ,
           'last_name' => $this->last_name,
           'email' => $this->email,
           'phone' => $this->phone,
           'user_id' => $this->paciente->id,
        ]);


        $this->emit('success');
        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
        $this->open = 'hidden';

    }

    public function clear(){
        $this->resetValidation();
        $this->resetErrorBag();
        $this->reset(['name','last_name','email','phone']);
    }
}
