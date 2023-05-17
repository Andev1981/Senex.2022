<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Support\Str;

class ModalCrear extends Component
{
    use WithFileUploads;

    public $open = 'hidden';
    public $name = "";
    public $last_name = "";
    public $phone = "";
    public $email = "";
    public $avatar;
    public $file_path;


    protected $rules = [
        'name' => 'required|min:6|max:45',
        'last_name' => 'required|min:6|max:45',
        'phone' => 'required|min:9|max:9',
        'email' => 'required|email|unique:users,email|min:10|max:200',
        'avatar' => 'mimes:png,jpg,jpeg'
    ];

    protected $messages = [
        'name.required' => 'El campo nombre es obligatorio',
        'name.min' => 'Nombre debe tener al menos 6 caracteres',
        'name.max' => 'Nombre supera el límite permitido de caracteres',
        'last_name.required' => 'Apellido es requerido',
        'last_name.min' => 'Apellido debe tener al menos 6 caracteres',
        'last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'phone.required' => 'Telefono es requerido',
        'phone.max' => 'Teléfono supera el máximo',
        'phone.min' => 'Ingrese número completo',
        'email.required' => 'Correo es requerido',
        'email.unique' => 'Correo ya está en uso',
        'email.min' => 'Correo debe tener al menos 10 caracteres',
        'email.max' => 'Correo ha superado el límite de caracteres',
        'avatar.mimes:png,jpg,jpeg' => 'Formato incorrecto de la imágen'
    ];

    public function render()
    {
        
        
        return view('livewire.paciente.modal-crear');
    }

    public function updated($phone){
        $this->validateOnly($phone);
    }

    public function save(){

             $this->validate();

            if($this->avatar){
                $file_name = $this->avatar->getClientOriginalName(); 
                $file_extension = $this->avatar->extension(); 
                $this->file_path = 'storage/'. $this->avatar->store('avatars','public'); 
            }

             $user = User::create([
                'name' => $this->name ,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'avatar' => $this->file_path,
                'phone' => $this->phone,
                'user_type' => 'Paciente',
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
             $this->reset(['name','last_name','email','phone', 'avatar','file_path']);
           

         }

        

}
