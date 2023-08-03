<?php

namespace App\Http\Livewire\Kine;

use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\User;
use Livewire\Component;

class ValuesKine extends Component
{

    public $kine;
    public $atenciones = [];
    public $atencionSelected;
    public $atencionValor;
    public $applicationUsers=[];
    public $openvalores = 'hidden';

    protected $rules=[
        'atencionSelected' => 'required',
        'atencionValor' => 'required',
    ];

    public function render()
    {
        return view('livewire.kine.values-kine');
    }

    public function mount(User $doctor){
        
        $this->kine = $doctor;
        $this->atenciones = ApplicationType::all();

        $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->get();

    }

    public function save(){

        $this->validate();
        

            ApplicationTypeUser::updateOrCreate([ 'application_type_id' => $this->atencionSelected],[
                'user_id' => $this->kine->id,
                'price' => $this->atencionValor,
            ]);
        

        $this->clear();

        $this->dispatchBrowserEvent('swal-success');

        
    }

    public function setValues(ApplicationTypeUser $apply){
        $this->atencionSelected = $apply->application_type_id;
        $this->atencionValor = $apply->price;

    } 

     public function clear(){
             $this->resetValidation();
             $this->resetErrorBag();
             $this->reset(['atencionSelected','atencionValor']);
              $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->get();
         }
}
