<?php

namespace App\Http\Livewire\Kine;

use App\Models\Address;
use App\Models\Doctor;
use App\Models\Comuna;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class Editar extends Component
{
  use WithFileUploads;

  public $isOpen = false,
    $phoneLength = 0,
    $doctor,
    $name,
    $last_name,
    $rut,
    $birth,
    $email,
    $phone,
    $street = "",
    $number = "",
    $address = '',
    $comuna_id = 1,
    $detail = '',
    $status = 0,
    $statusApp = 0,
    $pass = '',
    $address_id  = 0;


  public function openModal()
  {
    $this->isOpen = true;
  }

  public function closeModal()
  {
    $this->isOpen = false;
    $this->clear();
  }

  protected function rules()
  {

    return [
      'name' => 'required|min:3|max:50',
      'last_name' => 'required|min:5|max:50',
      'rut' => 'required|max:10|min:9',
      'birth' => 'required|date',
      'phone' => 'required|min:9|max:9',
      'street' => 'required',
      'number' => 'required',
      'email' => 'required|email|max:255',
      'comuna_id' => 'required',
      'detail' => 'max:150',
      'status' => 'boolean',

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
    'comuna_id.required' => 'Comuna es requerida',

  ];

  public function render()
  {
    $regiones = Region::where('id', 1)->get();
    $comunas = Comuna::where('region_id', 1)->get();
    return view('livewire.kine.editar', compact('regiones', 'comunas'));
  }

  public function mount(Doctor $doctor)
  {

    $this->email = $doctor->user->email;
    $this->name = $doctor->name;
    $this->last_name = $doctor->last_name;
    $this->rut = $doctor->rut;
    $this->phone = $doctor->phone;
    $this->birth = date('Y-m-d', strtotime($doctor->birth));
    $address = Address::findOrFail($doctor->address_id);
    $this->address_id = $address->id;
    $this->street = $address->street;
    $this->number = $address->number;
    $this->address = $address->address;
    $this->comuna_id = $address->comuna_id;
    $this->detail = $address->detail ?? '';
    $this->statusApp = $doctor->user->status;
    $this->status = $doctor->status;
  }

  public function save()
  {
    $this->validate();

    $doctor = Doctor::findOrFail($this->doctor->id);
    $user = User::findOrFail($this->doctor->user_id);

    if ($this->pass !== '') {
      $user->update([
        'password' => bcrypt($this->pass),
        'status' => $this->statusApp == 1 ? 1 : 0,
      ]);
    } else {
      $user->update([
        'status' => $this->statusApp == 1 ? 1 : 0,
      ]);
    }

    $doctor->update([
      'name' => $this->name,
      'last_name' => $this->last_name,
      'rut' => $this->rut,
      'phone' => $this->phone,
      'status' => $this->status
    ]);

    /*  if ($this->address_id > 0) {
      $address = Address::find($this->address_id);
      $address->update([
        'street' => $this->street,
        'number' => $this->number,
        'address' => $this->address,
        'comuna_id' => $this->comuna_id,
        'detail' => $this->detail,
      ]);
    } */

    if ($this->address_id == 1) {
      $address = Address::create([
        'street' => $this->street,
        'number' => $this->number,
        'address' => '',
        'comuna_id' => $this->comuna_id,
        'detail' => $this->detail
      ]);
      $doctor->update([
        'address_id' => $address->id
      ]);
    }


    $this->emitUp('success-kine');
    $this->dispatchBrowserEvent('swal-success');
    $this->clear();
  }

  public function clear()
  {
    $this->reset();
    $this->resetErrorBag();
    $this->resetValidation();
    $this->reset();


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
