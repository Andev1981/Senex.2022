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
    public $tratamientos='';
    public $apoderados='hidden';
    public $cssTratamientos='';
    public $cssApoderados='';
    public $active = 'inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 dark:border-blue-500';
    public $inactive = 'inline-block p-4 text-gray-500 border-b-2 border-gray-100 rounded-t-lg dark:border-transparent hover:text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300';

    public function render()
    {
        return view('livewire.paciente.show.index');
    }

    public function mount(User $paciente)
    {
        $this->paciente = $paciente;
        $this->doctores = User::where('user_type', 'Kine')->where('status', 1)->get();

        $this->answers = Answer::with(['question:id,name'])->whereBelongsTo($paciente)->get();
        $this->cssTratamientos = $this->active;
        $this->cssApoderados = $this->inactive;

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

    public function setTab($id){
        if($id == 1){
            $this->tratamientos = '';
            $this->apoderados = 'hidden';
            $this->cssTratamientos = $this->active;
            $this->cssApoderados = $this->inactive;
        }else if($id == 2){
            $this->tratamientos = 'hidden';
            $this->apoderados = '';
            $this->cssTratamientos = $this->inactive;
            $this->cssApoderados = $this->active;
        }
    }
}
