<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

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
        'name' => 'required|min:3|max:50',
        'last_name' => 'required|min:3|max:50',
        'phone' => 'required|min:9|max:9',
        'email' => 'required|email|unique:users,email|min:10|max:200',
        'avatar' => 'mimes:png,jpg,jpeg'
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
