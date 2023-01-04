<?php

namespace App\Http\Livewire\Recetas;

use Livewire\Component;
use App\Models\Solicitud;

class Index extends Component
{
    public $solicitud;
    public $repetir = false;
    public $veces;
    public $detalle;
    public $open;
    public $first = 'true',$second='',$third='',$fourth='';

    public function mount($solicitud){
        $this->solicitud = Solicitud::find($solicitud);
        $this->kine = $this->solicitud->doctor;
        $this->status = $this->solicitud->status;
    }

    public function render(){
        return view('livewire.recetas.index');
    }

    public function tabs($tabname){

        $this->first = '';
        $this->second = '';
        $this->third='';
        $this->fourth='';

   /*      dd($tabname); */

        if($tabname == '1'){
            $this->first = 'true';
        }
        if($tabname == '2'){
            $this->second = 'true';
        }
        if($tabname == '3'){
            $this->third = 'true';
        }
        if($tabname == '4'){
            $this->fourth = 'true';
        }
    }

    public function cerrar(){
        $this->open = '';
    }

    public function open(){
        $this->open = true;
    }


    public function save(){
        $this->solicitud->status = $this->status;
        $this->solicitud->save();
        $this->cerrar();

        $this->mount($this->solicitud->id);
    }


}
