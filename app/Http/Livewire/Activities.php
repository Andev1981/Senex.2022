<?php

namespace App\Http\Livewire;

use App\Models\Activity;
use Livewire\Component;

class Activities extends Component
{

    

    public function render()
    {
        $activities = Activity::where('user_id',auth()->user()->id)->latest()
     ->take(5)
     ->get();;
        return view('livewire.activities', compact('activities'));
    }
}
