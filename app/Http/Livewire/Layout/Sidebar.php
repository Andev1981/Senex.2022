<?php

namespace App\Http\Livewire\Layout;

use App\Models\SelectOption;
use Livewire\Component;

class Sidebar extends Component
{
    public function render()
    {
        return view('livewire.layout.sidebar');
    }

    /* Solo para actualizar información  */
    public function updateData(){

        SelectOption::create([
            'sort_order' => 11,
            'name' => 'Esposa',
            'model_type' =>'Keepers',
        ]);
        SelectOption::create([
            'sort_order' => 12,
            'name' => 'Esposo',
            'model_type' =>'Keepers',
        ]);

    }
}
