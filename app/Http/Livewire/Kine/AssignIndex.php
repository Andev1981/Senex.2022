<?php

namespace App\Http\Livewire\Kine;

use Livewire\Component;
use App\Models\User;

class AssignIndex extends Component
{
    public $opendetalles= 'hidden';
    public User $doctor;
    public $status=0;

    public function render()
    {
        return view('livewire.kine.assign-index');
    }

    public function mount(User $doctor){
        
        if($doctor){
            $this->doctor = $doctor;
            if($this->doctor->id){
                $this->status = 1;
            }
        }
    }
}
