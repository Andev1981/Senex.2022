<?php

namespace App\Http\Livewire;

use App\Models\Patient;
use App\Models\User;
use Livewire\Component;

class Paciente extends Component
{

    public $search;

    public function render()
    {
       /*  $users = User::where('name', 'like', '%' . $this->search . '%')->orderBy('id', 'DESC')->get(); */
        
       $pacientes = User::query()->with(['roles'],['patients'],[''])->when($this->search, function($query){
        return $query->where('name','like','%'. $this->search .'%');
       })->paginate(5);

        return view('livewire.paciente',compact('pacientes'));
    }
}
