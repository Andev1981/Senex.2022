<?php

namespace App\Http\Livewire\Recetas\Tabs;

use Livewire\Component;

class Third extends Component
{
    public $images;
    public function mount($solicitud){
        $this->images = $solicitud->images->where('type',3);
    }

    public function render()
    {
        return view('livewire.recetas.tabs.third');
    }
}
