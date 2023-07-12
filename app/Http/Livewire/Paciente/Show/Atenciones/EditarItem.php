<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\ApplyItem;
use App\Models\User;
use Livewire\Component;

class EditarItem extends Component
{
    public ApplyItem $applyItem;
    public $selectedKine;
    public $selectedStatus;
    public $kines = [];
    public $openItem = 'hidden';
    public $openDelItem = 'hidden';

    public function render()
    {
        return view('livewire.paciente.show.atenciones.editar-item');
    }

    public function mount(ApplyItem $applyItem){
        $this->applyItem = $applyItem;
        $this->selectedKine = $this->applyItem->user;
        $this->selectedStatus = $this->applyItem->status;
        $this->kines = User::where('user_type','Kine')->get();
    }
}
