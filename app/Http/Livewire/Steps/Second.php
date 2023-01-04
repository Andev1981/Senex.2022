<?php

namespace App\Http\Livewire\Steps;

use Livewire\Component;

class Second extends Component
{
    public $currentPage;
    public $pages;

    public function render()
    {
        return view('livewire.steps.second');
    }

      /* Funciones pagina 2 */
      public function agendar(){
            $this->currentPage++;
            $this->pages[2]['porcentaje'] = 100;
            $this->pages[3]['porcentaje'] = 0;
            $this->pages[3]['bgColor'] = 'bg-green-500';
            $this->pages[3]['txtColor'] = 'text-white';
            $this->emit('parentUpdate',$this->currentPage,$this->pages);
    }

}
