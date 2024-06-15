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
	public $sort = 'payment_status';
	public $direction = 'asc';
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
				/* 0: Por sesion, 1: Por Tratamiento, 2: Mensual por sesión, 3: Por Adelantado */
				if ($buscarAplication->type_payment == 0) {
					//Por Sesión
					$applyItems = ApplyItem::where('patient_id', $paciente->id)->where('status', 1)->where('estado_pago', 0)->get();
					if ($applyItems->count() > 0) {
						$paciente = Patient::find($paciente->id);
						$paciente->payment_status = 1;/* Pagos Pendientes */
						$paciente->save();
						return;
					} else {
						$paciente = Patient::find($paciente->id);
						$paciente->payment_status = 2; /* Pagos al dia */
						$paciente->save();
						return;
					}
				} else if ($buscarAplication->type_payment == 1) {
					//Pago Tratamiento
					$applyItems = ApplyItem::where('patient_id', $paciente->id)->where('status', 1)->where('estado_pago', 0)->get();

					if (count($applyItems) > 0) {
						$pac = Patient::find($paciente->id);
						$pac->payment_status = 1;/* Pagos Pendientes */
						$pac->save();
					} else {
						$pac = Patient::find($paciente->id);
						$pac->payment_status = 2; /* Pagos al dia */
						$pac->save();
					}
				} else if ($buscarAplication->type_payment == 2) {
					//Mensual por Sesiones
					$applyItems = ApplyItem::where('patient_id',  $paciente->id)->where('status', 1)->where('estado_pago', 0)->where('fecha_atencion', '<', $this->fechaBuscar . '-01  00:00:00')->get();

					if ($applyItems->count() > 0) {
						$paciente = Patient::find($paciente->id);
						$paciente->payment_status = 1;/* Pagos Pendientes */
						$paciente->save();
					} else {
						$paciente = Patient::find($paciente->id);
						$paciente->payment_status = 2; /* Pagos al dia */
						$paciente->save();
					}
				} else if ($buscarAplication->type_payment == 3) {
					//Por Adelantado
				}
			}
		}

		$this->render();
	}
}
