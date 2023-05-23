<?php

namespace App\Http\Livewire\Paciente\Show\Apoderado;

use Livewire\Component;
use App\Models\Address;
use App\Models\Comuna;
use App\Models\Keeper;
use App\Models\Region;
use App\Models\SelectOption;

class ApoderadoEditar extends Component
{

    public Keeper $keeper;
    public Address $address;
    public $open = 'hidden', 
           $openDel = 'hidden',
           $paises = [],
           $regiones = [],
           $region = 1,
           $comunas = [],
           $parentescos = [];


    protected $rules = [
        'keeper.name' => 'required|min:3|max:50',
        'keeper.last_name' => 'required|min:3|max:50',
        'keeper.phone' => 'required|min:9|max:9',
        'keeper.email' => 'required|min:10|max:200|email',
        'keeper.parentesco' => 'required',
        'address.street' => 'required|max:150',
        'address.number' => 'required|integer',
        'address.address' => 'required|max:150',
        'address.comuna_id' => 'required',
    ];

    public function mount(Keeper $keeper){
        $this->keeper = $keeper;
        $this->address = $keeper->address;
        $this->regiones = Region::where('id',1)->get();
        $this->comunas = Comuna::where('region_id',1)->get();
        $this->parentescos = SelectOption::where('model_type', 'Keepers')->get();
        

    }

    public function render()
    {
        return view('livewire.paciente.show.apoderado.apoderado-editar');
    }

     public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function save(){
        
        $this->validate();

        $this->address->save();
        $this->keeper->save();

        $this->emit('success-apoderado');
        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
        $this->open = 'hidden';

    }

     public function delete(){
        $this->keeper->delete();
        $this->emit('success-apoderado');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
        $this->openDel = 'hidden';
    }

     public function clear(){
        $this->resetValidation();
        $this->resetErrorBag();

    }
}
