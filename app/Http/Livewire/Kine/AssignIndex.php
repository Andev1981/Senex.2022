<?php

namespace App\Http\Livewire\Kine;

use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use Livewire\Component;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Livewire\WithFileUploads;

class AssignIndex extends Component
{
    use WithFileUploads;

    public $opendetalles = 'hidden';
    public $openvalores = 'hidden';
    public $kine;
    public $year;
    public $month;
    public $statusFindView = -1;
    public $statusFind = [0,1,2,3];
    public $status=0;
    public $file_path;
    public $listSessions = [];
    public $buscarFecha;
    public $buscarFechaIn;
    public $atenciones = [];
    public $atencionSelected;
    public $atencionValor;
    public $applicationUsers=[];

  protected function rules() {
        return [
            'kine.avatar' => '',
            'kine.name' => 'required|min:3|max:50',
            'kine.last_name' => 'required|min:5|max:50',
            'kine.rut' => 'required|max:10|min:9',
            'kine.email' => 'required|email|max:255|unique:users,email,'.$this->kine->id,
            'kine.birth' => 'required|date',
            'kine.phone' => 'required|min:9|max:9',
            ];
    }

    public function render(){
        return view('livewire.kine.assign-index');
    }

    public function mount(User $doctor){
        if($doctor){
            $this->kine = $doctor;
            if($this->kine->id){
                $this->status = 1;
            }
        }
        $this->atenciones = ApplicationType::all();

        $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->get();

        $this->buscarFecha = Carbon::now();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');
        $this->searchByItems();
        

    }

    public function saveKine(){
        $this->validate();

         if($this->file_path){
            $this->kine->avatar = 'storage/'. $this->file_path->store('avatars','public');
        }

        $this->kine->save();
        $this->dispatchBrowserEvent('swal-success');
        
    }

    public function searchByItems(){


            $this->buscarFecha =  $this->year.'-'.$this->month;

            $this->listSessions = ApplyItem::with('assign')
                    ->where('fecha_atencion', 'like', $this->buscarFecha.'%')
                    ->where('status',1)->where('user_id', $this->kine->id)
                    ->latest('id')
                    ->get();
                    
    }


    public function saveValor(){


        $applyBuscar = ApplicationTypeUser::where('user_id',$this->kine->id)->where('application_type_id',$this->atencionSelected)->first();

        if($applyBuscar){
           $applyBuscar->price = $this->atencionValor;
           $applyBuscar->save();
        }else{
            ApplicationTypeUser::create([
                'user_id' => $this->kine->id,
                'application_type_id' => $this->atencionSelected,
                'price' => $this->atencionValor,
            ]);
        }

        $this->applicationUsers = ApplicationTypeUser::where('user_id',$this->kine->id)->get();
        
        $this->dispatchBrowserEvent('swal-success');

        
    }

    public function setValues(ApplicationTypeUser $apply){

        $this->atencionSelected = $apply->application_type_id;
        $this->atencionValor = $apply->price;

    } 
}
