<?php

namespace App\Http\Livewire\Doctor\Tabs;

use Livewire\Component;
use App\Models\Doctor;
use App\Models\Payment;

class Cuentas extends Component
{

    public $payments;

    public function mount($doctor){

        $this->payments = Payment::where('user_id',$doctor->user_id)->get();

    }

    public function render()
    {
        return view('livewire.doctor.tabs.cuentas');
    }
}
