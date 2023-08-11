<?php

namespace App\Http\Livewire;

use App\Models\ApplicationTypeUser;
use Livewire\Component;

class Inicio extends Component
{
    public function render()
    {
        $applycationTypeUser = ApplicationTypeUser::get();
        dd($applycationTypeUser);

           /*  foreach($applycationTypeUser as $apply){
                $apply->price = 0;
                $apply->save();
            } */

        return view('livewire.inicio');
    }
}
