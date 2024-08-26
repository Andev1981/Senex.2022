<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\ApplyItem;
use App\Models\Patient;
use Livewire\Component;

class AtencionDetalle extends Component
{
    public $applyItem, $isOpen = false;

    public function render()
    {
        return view('livewire.kinesiologos.atencion-detalle');
    }

    public function mount(ApplyItem $applyItem)
    {
        $this->applyItem = $applyItem;
    }

    public function openModal()
    {
        $this->isOpen = true;
    }

    public function closeModal()
    {
        $this->isOpen = false;
    }
}
