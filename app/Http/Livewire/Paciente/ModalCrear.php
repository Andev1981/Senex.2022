<?php

namespace App\Http\Livewire\Paciente;

use App\Models\Address;
use App\Models\Comuna;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalCrear extends Component
{
    use WithFileUploads;

    public $open = 'hidden';
    public $name = "";
    public $last_name = "";
    public $telefono = "";
    public $correo = "";
    public $rut = "";
    public $fecha_nacimiento;
    public $avatar;
    public $file_path,
    $paises = [],
           $pais = "",
           $region = 1,
           $comuna,
           $calle = "",
           $numero,
           $detalle_direccion = "";


    protected $rules = [
        'name' => 'required|min:3|max:50',
        'last_name' => 'required|min:3|max:50',
        'telefono' => 'required|min:9|max:9',
        'correo' => 'required|email|unique:users,email|min:10|max:200',
        'avatar' => 'mimes:png,jpg,jpeg|max:1024',
        'calle' => 'required|max:150',
        'rut' => 'required|max:10|min:9',
        'fecha_nacimiento' => 'required|date',
        'numero' => 'required|integer',
        'detalle_direccion' => 'required|max:150',
        'comuna' => 'required',
    ];

    public function render()
    {
        $regiones = Region::where('id',1)->get();
        $comunas = Comuna::where('region_id',1)->get();
        
        return view('livewire.paciente.modal-crear', compact('regiones','comunas'));
    }

    public function updated($telefono){
        $this->validateOnly($telefono);
    }

    public function save(){

             $this->validate();

            if($this->avatar){
                $file_name = $this->avatar->getClientOriginalName(); 
                $file_extension = $this->avatar->extension(); 
                $this->file_path = 'storage/'. $this->avatar->store('avatars','public'); 
            }
            
            $address = Address::create([
                'street' => $this->calle,
                'number' => $this->numero,
                'address' => $this->detalle_direccion,
                'comuna_id' => $this->comuna,
            ]);

             $user = User::create([
                'name' => $this->name ,
                'last_name' => $this->last_name,
                'email' => $this->correo,
                'avatar' => $this->file_path,
                'phone' => $this->telefono,
                'birth' => $this->fecha_nacimiento,
                'rut' => $this->rut,
                'user_type' => 'Paciente',
                'address_id' => $address->id,
                'password' => bcrypt($this->name . '-SENEX2023'),
             ]);

             $user->assignRole([3]);

             $this->emit('success');
             $this->dispatchBrowserEvent('swal-success');

             $this->clear();
             $this->open = 'hidden';

         }

         public function clear(){
             $this->resetValidation();
             $this->resetErrorBag();
             $this->reset(['name','last_name','correo','telefono', 'avatar','file_path']);
         }

        

}
