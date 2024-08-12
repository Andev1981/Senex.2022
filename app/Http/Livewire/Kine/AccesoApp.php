<?php

namespace App\Http\Livewire\Kine;

use App\Models\Doctor;
use Livewire\Component;
use Livewire\WithFileUploads;

class AccesoApp extends Component
{
    use WithFileUploads;

    public $doctor, $user, $status, $pass;
    public $isOpen = false;

    public function render()
    {

        return view('livewire.kine.acceso-app');
    }

    public function mount(Doctor $doctor)
    {
        if ($doctor) {
            $this->doctor = $doctor;
            $this->user = $doctor->user;
            $this->status = $doctor->status;
        }
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
    }

    public function clear()
    {
        $this->reset();
        $this->resetErrorBag();
        $this->resetValidation();
    }

    public function openModal()
    {
        $this->isOpen = true;
    }

    public function closeModal()
    {
        $this->isOpen = false;
    }
}
