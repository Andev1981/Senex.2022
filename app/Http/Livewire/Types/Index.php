<?php

namespace App\Http\Livewire\Types;

use App\Models\ApplicationType;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
     use WithPagination;

     protected $listeners = ['success-type' => 'render'];

    public function render()
    {
        $types = ApplicationType::orderBy('id','desc')->paginate(5);
        return view('livewire.types.index', compact('types'));
    }
}
