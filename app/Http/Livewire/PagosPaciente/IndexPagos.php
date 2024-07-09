<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use Barryvdh\Debugbar\Twig\Extension\Dump;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class IndexPagos extends Component
{
	use WithPagination;
	public $selectedPaciente;
	public $search;
	protected $listeners = ['success' => 'render', 'success-paciente' => 'render', 'update-payment' => 'render'];
	protected $queryString = ['search'];
	public $sort = 'updated_at';
	public $direction = 'desc';
	public $openDelPaciente = 'hidden';
	public $quantity = 10;
	public $inactivos = 0;
	public $fechaActual;
	public $fechaBuscar = '';

	public function updatingSearch()
	{
		$this->resetPage();
	}

	public function selectItem()
	{
		if ($this->inactivos == 1) {
			$this->inactivos = 0;
		} else {
			$this->inactivos = 1;
		}
	}

	public function render()
	{
		$this->fechaActual = Carbon::now();
		$this->fechaBuscar = $this->fechaActual->format('Y-m');


		if ($this->inactivos == 1) {
			$pacientes = Patient::where(function ($query) {
				$query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
			})->where('status', 0)->orderBy($this->sort, $this->direction)->orderBy('status', 'asc')->orderBy('name', 'asc')->paginate($this->quantity);
		} else {
			$pacientes = Patient::where(function ($query) {
				$query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
			})->where('status', 1)->orderBy($this->sort, $this->direction)->orderBy('status', 'desc')->orderBy('name', 'asc')->paginate($this->quantity);
		}


		return view('livewire.pagos-paciente.index-pagos', compact('pacientes'));
	}

	public function order($sort)
	{
		if ($this->sort === $sort) {

			if ($this->direction === 'desc') {
				$this->direction = 'asc';
			} else {
				$this->direction = 'desc';
			}
		} else {
			$this->sort = $sort;
		}
	}

	public function openDeleteModal($paciente)
	{
		$this->selectedPaciente = '';
		$this->selectedPaciente = $paciente;
		$this->openDelPaciente = '';
	}

	public function deletePaciente()
	{
		$pacienteDel = Patient::find($this->selectedPaciente['id']);
		$pacienteDel->status = 0;
		$pacienteDel->save();
		$this->openDelPaciente = 'hidden';
	}

	public function activarPaciente()
	{
		$pacienteDel = Patient::find($this->selectedPaciente['id']);
		$pacienteDel->status = 1;
		$pacienteDel->save();
		$this->openDelPaciente = 'hidden';
	}

	public function verificarPagos()
	{
		$allPacientes = Patient::with('applyItems')->where('status', 1)->get();

		foreach ($allPacientes as $paciente) {
			$buscarAplication = $paciente->applications->first();
			if ($buscarAplication) {
				$res = ApplyItem::where('patient_id', $paciente->id)->where('estado_pago', 0)->get();
				if (count($res) === 0) {

					$paciente = Patient::find($paciente->id);
					$paciente->payment_status = 2;
					$paciente->save();
				} else {
					$paciente = Patient::find($paciente->id);
					$paciente->payment_status = 1;
					$paciente->save();
				}
			}
		}

		$this->render();
	}
}
