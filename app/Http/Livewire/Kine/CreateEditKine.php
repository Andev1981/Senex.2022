<?php

namespace App\Http\Livewire\Kine;

use App\Models\Comuna;
use App\Models\Region;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Livewire\Component;
use Livewire\WithFileUploads;

class CreateEditKine extends Component
{
    use WithFileUploads;

    public $doctor;
    public $open = 'hidden';
    public $openDel = 'hidden';
    public $file_path;
    public $status=0;
    public $phoneLength=0;

    
    protected function rules() {

        if($this->status == 1){

            return [
                'doctor.avatar' => '',
                'doctor.name' => 'required|min:3|max:50',
                'doctor.last_name' => 'required|min:5|max:50',
                'doctor.rut' => 'required|max:10|min:9',
                'doctor.birth' => 'required|date',
                'doctor.email' => 'required|email|max:255|unique:users,email,',
                'doctor.phone' => 'required|min:9|max:9',
            ];
        }else{

            return [
                'doctor.avatar' => '',
                'doctor.name' => 'required|min:3|max:50',
                'doctor.last_name' => 'required|min:5|max:50',
                'doctor.rut' => 'required|max:10|min:9',
                'doctor.email' => 'required|email|max:255|unique:users,email,'.$this->doctor->id,
                'doctor.birth' => 'required|date',
                'doctor.phone' => 'required|min:9|max:9',
            ];
        }
    }

    protected $messages = [
        'doctor.name.required' => 'Nombre es requerido',
        'doctor.name.min' => 'Nombre debe tener al menos 3 caracteres',
        'doctor.name.max' => 'Nombre supera el límite permitido de caracteres',
        'doctor.last_name.required' => 'Apellido es requerido',
        'doctor.last_name.min' => 'Apellido debe tener al menos 5 caracteres',
        'doctor.last_name.max' => 'Apellido supera el límite permitido de caracteres',
        'doctor.phone.required' => 'Teléfono es requerido',
        'doctor.phone.max' => 'Teléfono supera el máximo',
        'doctor.phone.min' => 'Teléfono debe tener al menos 9 caracteres',
    ];

    public function render()
    {
        return view('livewire.kine.create-edit-kine');
    }

    public function mount(User $doctor){
        $this->doctor = $doctor;
            if($doctor){
                if($this->doctor->id){
                    $this->status = 1;
                }
        }
    }

    public function save(){

        $this->validate();

         if($this->file_path){
            $this->doctor->avatar = 'storage/'. $this->file_path->store('avatars','public');
        }

        $this->doctor->password = bcrypt('Senex2023');
        $this->doctor->address_id = 1;
        $this->doctor->status = 1;
        $this->doctor->user_type = 'Kine';
        $this->doctor->save();

        $this->emitUp('success-kine');

        $this->dispatchBrowserEvent('swal-success');
        
        $this->clear();
    }

    public function delete(){
        $this->doctor->delete();
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
    }

    public function clear(){
        $this->resetErrorBag();
        $this->resetValidation();
        if($this->status == 0){
            $this->reset([
                'doctor'
            ]);
        }
        $this->open = 'hidden';
        $this->openDel = 'hidden';


    }
}
