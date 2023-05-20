<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Keeper;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class Apoderados extends Component
{
    use WithPagination;
    public User $paciente;

    public function render()
    {
        $keepers = Keeper::where('user_id',$this->paciente->id)->paginate(5);

        return view('livewire.paciente.show.apoderados', compact('keepers'));
    }

    public function mount(User $paciente){
        $this->paciente = $paciente;
    }
}
