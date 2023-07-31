<?php

namespace App\Http\Livewire\Kine;

use App\Models\Address;
use App\Models\Comuna;
use App\Models\Region;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalCrear extends Component
{

     use WithFileUploads;
    public User $paciente;
    public Address $address;

    public $file_path;
    public $open = 'hidden';
    public $openDel = 'hidden';
    public $regiones = [];
    public $comunas = [];
    public $questions = [];
    public $avatar;
    public $phone;


     protected function rules() {
        
        return [
            'name' => 'required|min:3|max:50',
            'last_name' => 'required|min:3|max:50',
            'rut' => 'required|max:10|min:9',
            'email' => 'required|email|max:255|unique:users,email',
            'birth' => 'required|date',
            'phone' => 'required',
            'status' => 'required',
            'street' => 'required|max:150',
            'number' => 'required|integer',
            'address' => 'required|max:150',
            'avatar' => '',
            'comuna_id' => 'required',
        ];
    } 

    protected $messages = [
        'name.required' => 'Nombre es requerido',
        'name.min' => 'Nombre debe tener al menos 6 caracteres',
        'name.max' => 'Nombre supera el límite permitido de caracteres',
        'last_name.required' => 'Apellido es requerido',
        'last_name.min' => 'Apellido debe tener al menos 6 caracteres',
        'last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'phone.required' => 'Telefono es requerido',
        'phone.max' => 'Teléfono supera el máximo',
        'phone.min' => 'Teléfono debe tener al menos 12 caracteres',
        'email.required' => 'Correo es requerido',
        'email.unique' => 'Correo ya está en uso',
        'email.min' => 'Correo debe tener al menos 10 caracteres',
        'email.max' => 'Correo ha superado el límite de caracteres',
    ];

    public function render()
    {

        return view('livewire.kine.modal-crear');
    }

    public function save(){

             $this->validate();

              if($this->avatar){
                /* $file_name = $this->avatar->getClientOriginalName(); 
                $file_extension = $this->avatar->extension();  */
                $this->file_path = 'storage/'. $this->avatar->store('avatars','public'); 
            }

             $user = User::create([
                'name' => $this->name ,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'avatar' => $this->file_path,
                'rut' => $this->rut,
                'phone' => $this->phone,
                'status' => $this->status,
                'user_type' => 'Kine',
                'address_id' => 1,
                'password' => bcrypt($this->name . '-SENEX2023'),
             ]);

             $user->assignRole([3]);

             $this->dispatchBrowserEvent('swal-success');
             $this->emit('success-kine');
             $this->clear();

         }

         public function clear(){
             $this->resetValidation();
             $this->resetErrorBag();
             $this->reset(['name','last_name','email','phone']);
             $this->open = 'hidden';

         }


}
