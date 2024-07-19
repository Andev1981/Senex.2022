<?php

namespace App\Http\Livewire\Kine;

use App\Models\Doctor;
use App\Models\Comuna;
use App\Models\Region;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalEditar extends Component
{

    use WithFileUploads;

    public $doctor, $user;
    public $open = 'hidden';
    public $openDel = 'hidden';
    public $openDatosUser = 'hidden';
    public $file_path;
    public $status = 0;
    public $phoneLength = 0;
    public $pass;

    protected function rules()
    {

        return [
            'doctor.avatar' => '',
            'doctor.name' => 'required|min:3|max:50',
            'doctor.last_name' => 'required|min:5|max:50',
            'doctor.rut' => 'required|max:10|min:9',
            'doctor.user.email' => 'required|email|max:255|unique:users,email,' . $this->user->id,
            'doctor.birth' => 'required|date',
            'doctor.phone' => 'required|min:9|max:9',
        ];
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
        'doctor.user.email.required' => 'Correo es requerido',
        'doctor.rut.required' => 'Rut es requerido',
        'doctor.birth.required' => 'Fecha de nacimiento es requerida',
    ];

    public function render()
    {
        $regiones = Region::where('id', 1)->get();
        $comunas = Comuna::where('region_id', 1)->get();

        return view('livewire.kine.modal-editar', compact('regiones', 'comunas'));
    }


    public function mount(Doctor $doctor)
    {

        if ($doctor) {
            $this->doctor = $doctor;
            $this->user = $doctor->user;
            if ($this->doctor->id) {
                $this->status = 1;
            }
        }
    }

    public function save()
    {

        $this->validate();


        if ($this->file_path) {
            $this->doctor->avatar = 'storage/' . $this->file_path->store('avatars', 'public');
        }


        $this->doctor->save();

        $this->emitUp('success-kine');

        $this->dispatchBrowserEvent('swal-success');

        $this->clear();
    }

    public function delete()
    {
        $this->doctor->status = 0;
        $this->doctor->save();
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-info');
        $this->clear();
    }

    public function clear()
    {
        $this->resetErrorBag();
        $this->resetValidation();
        if ($this->status == 0) {
            $this->reset([
                'doctor'
            ]);
        }
        $this->open = 'hidden';
        $this->openDel = 'hidden';
    }
    public function saveUserData()
    {
        $user = $this->doctor->user;

        if ($this->pass !== '') {
            $user->password = bcrypt($this->pass);
        }
        if ($this->status == 1) {
            $user->status = 1;
        } else {
            $user->status = 0;
        }

        $user->save();
        $this->openDatosUser = 'hidden';
    }
}
