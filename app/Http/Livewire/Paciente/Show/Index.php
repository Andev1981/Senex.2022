<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Answer;
use App\Models\User;
use Livewire\Component;

class Index extends Component
{

    protected $listeners = ['success' => 'render'];

    public User $paciente;
    public $answers = [];
    public $doctores = [];
    public $opendetalles = 'hidden';
    public $openDelPaciente = 'hidden';

    public function render()
    {
        return view('livewire.paciente.show.index');
    }

    public function mount(User $paciente)
    {
        $this->paciente = $paciente;
        $this->doctores = User::where('user_type', 'Kine')->where('status', 1)->get();

        $this->answers = Answer::with(['question:id,name'])->whereBelongsTo($paciente)->get();

    }

    public function delete(){
        $this->paciente->delete();
        $this->clear();
    }

    public function clear(){
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-paciente');
        $this->openDelPaciente = 'hidden';
        $this->opendetalles = 'hidden';
    }
}
