<?php

namespace App\Http\Livewire\Paciente;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\User;
use Livewire\Component;

class ModalFix extends Component
{

    public $open = 'hidden';
    public User $user;
    public $applications = [];
    public $applicationSet = '';
    public $applicationInit = '';
    public $items = [];

    public function render()
    {
        return view('livewire.paciente.modal-fix');
    }

     public function mount(User $user){
         $this->user = $user;
         $this->applications = $user->applications;
         $this->applicationInit = $user->applications[0]->id;

         $fix = Application::find($user->applications[0]->id);
         $fix->status = 1;
         $fix->save();

     }

    public function cambioId(){
        $this->items = ApplyItem::where('application_id',$this->applicationSet)->get();
    }

    public function save(){

        foreach($this->items as $item){
            $item->application_id = $this->applicationInit;
            $item->save();
        }
        $this->applications = $this->user->applications;
    }

    public function aplicationDel(){

        $appli = Application::find($this->applicationSet);
        if($appli){
        $appli->delete();
        }
        $this->applications = $this->user->applications;
    }
}
