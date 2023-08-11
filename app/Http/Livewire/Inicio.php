<?php

namespace App\Http\Livewire;

use App\Models\ApplicationTypeUser;
use Livewire\Component;

class Inicio extends Component
{
    public function render()
    {
        $applycationTypeUser = ApplicationTypeUser::where('price', null)->get();

            foreach($applycationTypeUser as $apply){
                $apply->price = 0;
                $apply->save();
            }

        return view('livewire.inicio');
    }
}
