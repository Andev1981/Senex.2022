<?php

namespace App\Http\Livewire\PagosPaciente\Estados;

use App\Models\Patient;
use Livewire\Component;
use Livewire\WithPagination;
use Carbon\Carbon;

class Pendiente extends Component
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

    public function render()
    {
        $this->fechaActual = Carbon::now();
        $this->fechaBuscar = $this->fechaActual->format('Y-m');
        $pacientes = Patient::where(function ($query) {
            $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 1)->where('payment_status', 1)->orderBy($this->sort, $this->direction)->paginate($this->quantity);

        return view('livewire.pagos-paciente.estados.pendiente', compact('pacientes'));
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
}
