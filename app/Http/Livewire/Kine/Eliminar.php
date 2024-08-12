<?php

namespace App\Http\Livewire\Kine;

use App\Models\Doctor;
use Livewire\Component;
use Livewire\WithFileUploads;

class Eliminar extends Component
{
  use WithFileUploads;

  public $doctor, $user;
  public $isOpen = false;

  public function render()
  {
    return view('livewire.kine.eliminar');
  }

  public function mount(Doctor $doctor)
  {
    if ($doctor) {
      $this->doctor = $doctor;
    }
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
