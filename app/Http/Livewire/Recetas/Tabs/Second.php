<?php

namespace App\Http\Livewire\Recetas\Tabs;

use Livewire\Component;
use App\Models\Image;
use App\Models\Solicitud;

class Second extends Component
{
    public $images;
    public function mount($solicitud){
        $this->images = $solicitud->images->where('type',1);
    }

    public function render()
    {
        return view('livewire.recetas.tabs.second');
    }
}
