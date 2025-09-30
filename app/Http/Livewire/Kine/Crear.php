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
    $commune_id = 1,
    $detail = '',
    $status = 0,
    $statusApp = 0,
    $pass = '';


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
      'commune_id' => 'required',
      'detail' => 'max:150',
      'pass' => 'min:8|max:100',
    ];
  }

  protected $messages = [
    'name.required' => 'Nombre es requerido',
    'name.min' => 'Nombre debe tener al menos 3 caracteres',
    'name.max' => 'Nombre supera el límite permitido de caracteres',
    'last_name.required' => 'Apellido es requerido',
    'last_name.min' => 'Apellido debe tener al menos 5 caracteres',
    'last_name.max' => 'Apellido supera el límite permitido de caracteres',
    'phone.required' => 'Teléfono es requerido',
    'phone.max' => 'Teléfono supera el máximo',
    'phone.min' => 'Teléfono debe tener al menos 9 caracteres',
    'detail.max' => 'Detalles deben tener menos 150 caracteres',
    'email.required' => 'Correo es requerido',
    'rut.required' => 'Rut es requerido',
    'birth.required' => 'Fecha de nacimiento es requerida',
    'commune_id.required' => 'Comuna es requerida',
    'pass.min' => 'Contrasena debe tener al menos 8 caracteres',
    'pass.max' => 'Contrasena supera el límite permitido de caracteres',
  ];

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
      'commune_id' => $this->commune_id,
      'detail' => $this->detail
    ]);

    $newUser = User::create([
      'name' => $this->name,
      'last_name' => $this->last_name,
      'email' => $this->email,
      'password' => bcrypt($this->pass),
      'rut' => $this->rut,
      'birth' =>  $this->birth,
      'phone' => $this->phone,
      'address_id' => $address->id,
      'status' => $this->statusApp == 1 ? 1 : 0,
      'user_type' => 'Kine'
    ]);

    $newDoctor = Doctor::create([
      'user_id' => $newUser->id,
      'name' => $this->name,
      'last_name' => $this->last_name,
      'rut' => $this->rut,
      'phone' => $this->phone,
      'address_id' => $address->id,
      'status' => $this->status == 1 ? 1 : 0,
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

  public function changeStatus()
  {

    $this->status = $this->status == 1 ? 0 : 1;
  }

  public function changeStatusApp()
  {

    $this->statusApp = $this->statusApp == 1 ? 0 : 1;
  }
}
