<?php

namespace App\Http\Livewire\Paciente\Show\Apoderado;

use Livewire\Component;
use App\Models\Address;
use App\Models\Comuna;
use App\Models\Keeper;
use App\Models\Patient;
use App\Models\Region;
use App\Models\SelectOption;
use App\Models\User;

class ApoderadoCrear extends Component
{
      public Patient $paciente;

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
           $address="",
           $parentescos = [],
           $parentesco;

           
    protected $rules = [
        'name' => 'required|min:3|max:50',
        'last_name' => 'min:3|max:50',
        'phone' => 'min:9|max:9',
        'email' => 'email|min:10|max:200',
        'parentesco' => 'required',
    ];

    public function mount(Patient $paciente){
        $this->paciente = $paciente;
        $this->parentescos = SelectOption::where('model_type', 'Keepers')->get();
        

    }

    public function render()
    {
        return view('livewire.paciente.show.apoderado.apoderado-crear');
    }

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function save(){

        $this->validate();

        $this->address = 1;
        


        $keeper = Keeper::create([
           'name' => $this->name ,
           'last_name' => $this->last_name,
           'email' => $this->email,
           'phone' => $this->phone,
           'user_id' => $this->paciente->id,
           'patient_id' => $this->paciente->id,
           'address_id' => $this->address,
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
}
