<?php

namespace App\Http\Livewire\Paciente\Show;

use Livewire\Component;
use App\Models\Address;
use App\Models\Comuna;
use App\Models\Keeper;
use App\Models\Region;
use App\Models\SelectOption;
use App\Models\User;

class ApoderadosCrear extends Component
{

    public User $paciente;
    public $open = 'hidden', 
           $name = "", 
           $last_name = "",
           $phone = "",
           $email = "",
           $paises = [],
           $pais = "",
           $regiones = [],
           $region = 1,
           $comunas = [],
           $comuna,
           $street = "",
           $number,
           $address = "",
           $parentescos = [],
           $parentesco;


    protected $rules = [
        'name' => 'required|min:3|max:50',
        'last_name' => 'required|min:3|max:50',
        'phone' => 'required|min:9|max:9',
        'email' => 'required|email|unique:users,email|min:10|max:200',
        'street' => 'required|max:150',
        'number' => 'required|integer',
        'address' => 'required|max:150',
        'comuna' => 'required',
        'parentesco' => 'required',
    ];

    public function render()
    {
        return view('livewire.paciente.show.apoderados-crear');
    }

    public function mount(User $paciente){
        $this->paciente = $paciente;

       /*  $this->paises = Country::where('id',1)->first(); */
        /* $this->regiones = Region::all(); */
        $this->regiones = Region::where('id',1)->get();
        $this->comunas = Comuna::where('region_id',1)->get();
        $this->parentescos = SelectOption::where('model_type', 'Keepers')->get();
        

    }

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function save(){

        $this->validate();
        
        $address = Address::create([
            'street' => $this->street,
            'number' => $this->number,
            'address' => $this->address,
            'comuna_id' => $this->comuna,
        ]);

        $keeper = Keeper::create([
           'name' => $this->name ,
           'last_name' => $this->last_name,
           'email' => $this->email,
           'phone' => $this->phone,
           'user_id' => $this->paciente->id,
           'address_id' => $address->id,
           'parentesco' => $this->parentesco,
        ]);


        $this->emit('success-apoderado');
        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
        $this->open = 'hidden';

    }

    public function clear(){
        $this->resetValidation();
        $this->resetErrorBag();
        $this->reset([
                        'name',
                        'last_name',
                        'email',
                        'phone',
                        'parentesco',
                        'comuna',
                        'street',
                        'number',
                        'address',
                    ]);
    }

  /*   public function updatedRegion($id){
        $this->comunas = Comuna::where('region_id',$id)->get();
    } */
}
