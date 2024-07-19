<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\PacienteKine;
use App\Models\Patient;
use Livewire\Component;

class KineIndex extends Component
{
    public $pacientes = [];

    public function mount()
    {
        if (auth()->user()->doctor) {
            $this->pacientes = PacienteKine::where('doctor_id', auth()->user()->doctor->id)->get();
            dd($this->pacientes);
        } else {
            return redirect('/');
        }
    }

    public function render()
    {
        return view('livewire.kinesiologos.kine-index');
    }
}
