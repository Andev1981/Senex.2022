<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\User;
use Livewire\Component;

class Index extends Component
{

    protected $listeners = ['success' => 'render'];

    public User $paciente;
    public $doctores;

    public function render()
    {
        return view('livewire.paciente.show.index');
    }

    public function mount(User $paciente){
        $this->paciente = $paciente;
        $this->doctores = User::where('user_type','Doctor')->where('status',1)->get();

    }
    public function closeModal(){
        $this->reset();
    }
}
