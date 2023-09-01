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

        $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->orderBy('application_type_id','asc')->get();

    }

    public function save(){

        $this->validate();
        $applicationTypeUser = ApplicationTypeUser::where('user_id',$this->kine->id)->where('application_type_id', $this->atencionSelected)->first();

        if(!$applicationTypeUser){
            ApplicationTypeUser::create([
                'user_id' => $this->kine->id,
                'application_type_id' => $this->atencionSelected,
                'price' => $this->atencionValor,
            ]);
        }else{
            $applicationTypeUser->price = $this->atencionValor;
            $applicationTypeUser->save();        
        }


        $this->clear();
        $this->emit('success-value');
        $this->dispatchBrowserEvent('swal-success');
        
    }

    public function setValues(ApplicationTypeUser $applicationTypeUser){
        $this->atencionSelected = $applicationTypeUser->application_type_id;
        $this->atencionValor = $applicationTypeUser->price;

    } 

     public function clear(){
             $this->resetValidation();
             $this->resetErrorBag();
             $this->reset(['atencionSelected','atencionValor']);
              $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->get();

            $this->kine->updated_at = now();
            $this->kine->save();
         }
}
