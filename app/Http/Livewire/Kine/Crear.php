<?php

namespace App\Http\Livewire\Kine;

use App\Models\Address;
use App\Models\Comuna;
use App\Models\Doctor;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class Crear extends Component
{

  use WithFileUploads;

  public $doctor,
    $isOpen = false,
    $status = 0,
    $phoneLength = 0,
    $name,
    $last_name,
    $rut,
    $birth,
    $email,
    $phone,
    $street = "",
    $number = "",
    $address = '',
    $comuna_id = 1;


  protected function rules()
  {
    return [
      'name' => 'required|min:3|max:50',
      'last_name' => 'required|min:5|max:50',
      'rut' => 'required|max:10|min:9',
      'birth' => 'required|date',
      'email' => 'required|email|max:255|unique:users,email',
      'phone' => 'required|min:9|max:9',
      'street' => 'required',
      'number' => 'required',
      'comuna_id' => 'required',
    ];
  }

  public function render()
  {
    $regiones = Region::where('id', 1)->get();
    $comunas = Comuna::where('region_id', 1)->get();

    return view('livewire.kine.crear', compact('regiones', 'comunas'));
  }

  public function save()
  {
    $this->validate();

    $address = Address::create([
      'street' => $this->street,
      'number' => $this->number,
      'address' => '',
      'comuna_id' => $this->comuna_id,
    ]);

    $newUser = User::create([
      'name' => $this->name,
      'last_name' => $this->last_name,
      'email' => $this->email,
      'password' => bcrypt('Senex2024'),
      'rut' => $this->rut,
      'birth' =>  $this->birth,
      'phone' => $this->phone,
      'address_id' => $address->id,
      'status' => 1,
      'user_type' => 'Kine'
    ]);

    $newDoctor = Doctor::create([
      'user_id' => $newUser->id,
      'name' => $this->name,
      'last_name' => $this->last_name,
      'rut' => $this->rut,
      'phone' => $this->phone,
      'address_id' => $address->id,
      'status' => 1,
    ]);



    $this->emitUp('success-kine');

    $this->dispatchBrowserEvent('swal-success');

    $this->clear();
  }

  public function clear()
  {
    $this->reset();
    $this->resetErrorBag();
    $this->resetValidation();
    $this->isOpen = false;
    return redirect()->route('kines');
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
