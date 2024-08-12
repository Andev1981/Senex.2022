<?php

namespace App\Http\Livewire\Kine;

use App\Models\Address;
use App\Models\Doctor;
use App\Models\Comuna;
use App\Models\Region;
use Livewire\Component;
use Livewire\WithFileUploads;

class Editar extends Component
{
  use WithFileUploads;

  public $isOpen = false;
  public $status = 0;
  public $phoneLength = 0;
  public $doctor, $pass,
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


  public function openModal()
  {
    $this->isOpen = true;
  }

  public function closeModal()
  {
    $this->isOpen = false;
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
    'email.required' => 'Correo es requerido',
    'rut.required' => 'Rut es requerido',
    'birth.required' => 'Fecha de nacimiento es requerida',
  ];

  public function render()
  {
    $regiones = Region::where('id', 1)->get();
    $comunas = Comuna::where('region_id', 1)->get();
    return view('livewire.kine.editar', compact('regiones', 'comunas'));
  }

  public function mount($doctor)
  {
    if ($doctor) {
      $this->doctor = Doctor::findOrFail($doctor->id);
      $this->email = $doctor->user->email;
      $this->name = $doctor->name;
      $this->last_name = $doctor->last_name;
      $this->rut = $doctor->rut;
      $this->phone = $doctor->phone;
      $this->birth = date('Y-m-d', strtotime($doctor->birth));
      $address = Address::findOrFail($doctor->address_id);
      $this->street = $address->street;
      $this->number = $address->number;
      $this->address = $address->address;
      $this->comuna_id = $address->comuna_id;
    }
  }

  public function save()
  {
    $this->validate();

    $doctor = Doctor::findOrFail($this->doctor->id);
    $doctor->update([
      'name' => $this->name,
      'last_name' => $this->last_name,
      'rut' => $this->rut,
      'phone' => $this->phone
    ]);
    if ($this->doctor->address_id) {
      $product = Address::find($this->doctor->address_id);
      $product->update([
        'street' => $this->street,
        'number' => $this->number,
        'address' => $this->address,
        'comuna_id' => $this->comuna_id,
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
    if ($this->status == 0) {
      $this->reset([
        'doctor'
      ]);
    }

    $this->isOpen = false;
    return redirect('/kines');
  }
}
