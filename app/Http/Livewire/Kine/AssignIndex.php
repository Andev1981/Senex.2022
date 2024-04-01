<?php

namespace App\Http\Livewire\Kine;

use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\Doctor;
use App\Models\Patient;
use Livewire\Component;
use App\Models\User;
use Carbon\Carbon;
use Livewire\WithFileUploads;
use Dompdf\Dompdf;

class AssignIndex extends Component
{
	use WithFileUploads;

	public $opendetalles = 'hidden';
	public $kine;
	public $user;
	public $year;
	public $month;
	public $statusFindView = -1;
	public $statusFind = [0, 1, 2, 3];
	public $status = 0;
	public $file_path;
	public $applyItems = [];
	public $buscarFecha;
	public $buscarFechaIn;
	public $kineValues;
	public $totalPacientes = 0;
	public $totalKine = 0;
	public $pacientes = [];
	public $selPaciente;

	protected $listeners = ['success-value' => 'searchByItems'];


	protected function rules()
	{
		return [
			'kine.avatar' => '',
			'kine.name' => 'required|min:3|max:50',
			'kine.last_name' => 'required|min:5|max:50',
			'kine.rut' => 'required|max:10|min:9',
			'kine.email' => 'required|email|max:255|unique:users,email,' . $this->kine->id,
			'kine.birth' => 'required|date',
			'kine.phone' => 'required|min:9|max:9',
		];
	}

	public function render()
	{
		return view('livewire.kine.assign-index');
	}

	public function mount(Doctor $doctor)
	{

		$this->kine = $doctor;
		if ($this->kine->id) {
			$this->status = 1;
		}

		$this->pacientes = Patient::orderBy('name', 'asc')->get();
		$this->buscarFecha = Carbon::now();
		$this->month = $this->buscarFecha->format('m');
		$this->year = $this->buscarFecha->format('Y');
		$this->searchByItems();
	}

	public function searchByItems()
	{

		$this->totalKine = 0;
		$this->totalPacientes = 0;

		$this->buscarFecha =  $this->year . '-' . $this->month;

		if ($this->selPaciente != 0) {
			$this->applyItems = ApplyItem::with(['patient' => function ($query) {
				$query->orderBy('name', 'asc');
			}], 'application', 'doctor')
				->where('doctor_id', $this->kine->id)
				->where('patient_id', $this->selPaciente)
				->where('status', 1)
				->where('fecha_atencion', 'like', $this->buscarFecha . '%')->get();
		} else {
			$this->applyItems = ApplyItem::with(['patient' => function ($query) {
				$query->orderBy('name', 'asc');
			}], 'application', 'doctor')
				->where('doctor_id', $this->kine->id)
				->where('status', 1)
				->where('fecha_atencion', 'like', $this->buscarFecha . '%')->get();
		}



		$this->kineValues = ApplicationTypeUser::where('user_id', $this->kine->id)->get();

		foreach ($this->applyItems as $applyItem) {
			$this->totalPacientes += $applyItem->price;

			foreach ($this->kineValues as $kineValue)
				if ($kineValue->application_type_id == $applyItem->application_type_id) {
					$this->totalKine += $kineValue->price;
				}
		}
	}



	public function clear()
	{
		$this->resetValidation();
		$this->resetErrorBag();
		$this->reset(['atencionSelected', 'atencionValor', 'kine', 'totalClientes', 'totalKine']);
	}
}
