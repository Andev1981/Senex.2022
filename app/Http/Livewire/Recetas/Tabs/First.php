<?php

namespace App\Http\Livewire\Recetas\Tabs;

use Livewire\Component;
use App\Models\QuizzAnswer;

class First extends Component
{
    public $respuestas;

    public function mount($solicitud){
        $this->respuestas = QuizzAnswer::where('solicitud_id',$solicitud->id)->get();
    }
    public function render()
    {
        return view('livewire.recetas.tabs.first');
    }
}
