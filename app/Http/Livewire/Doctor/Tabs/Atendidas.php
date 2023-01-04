<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use App\Models\Solicitud;

class Atendidas extends Component
{
    public $atendidas;

    public function mount($doctor){

        $this->solicitudes = Solicitud::where('doctor_id', $doctor->id)->where('status',1)->orderBy('created_at', 'DESC')->get();
    }

    public function render()
    {
        return view('livewire.doctor.tabs.atendidas');
    }
}
