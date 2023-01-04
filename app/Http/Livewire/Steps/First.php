<?php

namespace App\Http\Livewire\Steps;

use Livewire\Component;

class First extends Component
{
    public $currentPage;
    public function render()
    {
        return view('livewire.steps.first');
    }
}
