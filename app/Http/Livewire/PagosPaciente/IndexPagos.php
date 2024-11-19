<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class IndexPagos extends Component
{
  use WithPagination;
  public $selectedPaciente;
  public $search = '';
  protected $listeners = ['success' => 'render', 'success-paciente' => 'render', 'update-payment' => 'render'];
  protected $queryString = ['search'];
  public $sort = 'orden';
  public $direction = 'desc';
  public $openDelPaciente = 'hidden';
  public $quantity = 10;
  public $inactivos = 0;
  public $pagados = 0;
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

  public function selectPagados()
  {
    if ($this->pagados == 1) {
      $this->pagados = 0;
    } else {
      $this->pagados = 1;
    }
  }

  public function render()
  {
    $this->fechaActual = Carbon::now();
    $this->fechaBuscar = $this->fechaActual->format('Y-m');


    if ($this->inactivos == 1) {
      if ($this->pagados == 1) {
        $pacientes = Patient::where(function ($query) {
          $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 0)->where('payment_status', 2)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
      } else {
        $pacientes = Patient::where(function ($query) {
          $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 0)->where('payment_status', 1)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
      }
    } else {
      if ($this->pagados == 1) {
        $pacientes = Patient::where(function ($query) {
          $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 1)->where('payment_status', 2)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
      } else {
        $pacientes = Patient::where(function ($query) {
          $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 1)->where('payment_status', 1)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
      }
    }

    if ($this->search !== '') {
      $pacientes = Patient::where(function ($query) {
        $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
      })->orderBy($this->sort, $this->direction)->paginate($this->quantity);
    }

    /* if ($this->inactivos == 1) {
			$pacientes = Patient::where(function ($query) {
				$query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
			})->where('status', 0)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
		} else {
			$pacientes = Patient::where(function ($query) {
				$query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
			})->where('status', 1)->orderBy($this->sort, $this->direction)->paginate($this->quantity);
		} */


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

  public $orden = 1;
  public function verificarPagos()
  {
    $allPacientes = Patient::with('applyItems')->where('status', 1)->orderBy('updated_at', 'asc')->get();

    $this->orden = $allPacientes->max('orden');

    foreach ($allPacientes as $paciente) {
      $buscarAplication = $paciente->applications->first();
      if ($buscarAplication) {
        $res = ApplyItem::where('patient_id', $paciente->id)->where('estado_pago', 0)->get();
        if (count($res) === 0) {
          $paciente = Patient::find($paciente->id);
          $paciente->payment_status = 2;
          $paciente->orden = $this->orden++;
          $paciente->save();
        } else {
          $paciente = Patient::find($paciente->id);
          $paciente->payment_status = 1;
          $paciente->orden = $this->orden++;
          $paciente->save();
        }
      }
    }

    $this->render();
  }
}
