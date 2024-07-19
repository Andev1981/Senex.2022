<?php

namespace App\Http\Livewire\Kine;

use App\Models\Comuna;
use App\Models\Doctor;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class CreateEditKine extends Component
{
	use WithFileUploads;

	public $doctor;
	public $open = 'hidden';
	public $openDel = 'hidden';
	public $file_path;
	public $status = 0;
	public $phoneLength = 0;
	public $avatar,
		$name,
		$last_name,
		$rut,
		$birth,
		$email,
		$phone;


	protected function rules()
	{


		return [
			'avatar' => '',
			'name' => 'required|min:3|max:50',
			'last_name' => 'required|min:5|max:50',
			'rut' => 'required|max:10|min:9',
			'birth' => 'required|date',
			'email' => 'required|email|max:255|unique:users,email',
			'phone' => 'required|min:9|max:9',
		];
	}



	public function render()
	{
		$regiones = Region::where('id', 1)->get();
		$comunas = Comuna::where('region_id', 1)->get();

		return view('livewire.kine.create-edit-kine', compact('regiones', 'comunas'));
	}


	public function save()
	{

		$this->validate();


		if ($this->file_path) {
			$this->avatar = 'storage/' . $this->file_path->store('avatars', 'public');
		}


		$newUser = User::create([
			'name' => $this->name,
			'last_name' => $this->last_name,
			'email' => $this->email,
			'password' => bcrypt('Senex2023'),
			'avatar' => '',
			'rut' => '',
			'birth' => null,
			'phone' => '',
			'address_id' => 1,
			'status' => 1,
			'user_type' => 'Kine'
		]);


		$newDoctor = Doctor::create([
			'user_id' => $newUser->id,
			'avatar' => $this->avatar,
			'name' => $this->name,
			'last_name' => $this->last_name,
			'rut' => $this->rut,
			'phone' => $this->phone,
			'address_id' => 1,
			'status' => 1,
		]);



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
}
