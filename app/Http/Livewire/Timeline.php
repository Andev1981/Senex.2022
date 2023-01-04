<?php

namespace App\Http\Livewire;

use Livewire\Component;

class Timeline extends Component
{
    public $pages;

    public function render()
    {
        return view('livewire.timeline');
    }
}
