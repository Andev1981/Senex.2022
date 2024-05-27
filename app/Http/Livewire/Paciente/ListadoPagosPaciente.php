<?php

namespace App\Http\Livewire\Paciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPagosPaciente extends Component
{

    use WithPagination;
    public $selectedPaciente;
    public $search;
    protected $listeners = ['success' => 'render', 'success-paciente' => 'render'];
    protected $queryString = ['search'];
    public $sort = 'payment_status';
    public $direction = 'asc';
    public $openDelPaciente = 'hidden';
    public $quantity = 10;


    public function updatingSearch()
    {
        $this->resetPage();
    }


    public function render()
    {

        $pacientes = Patient::where(function ($query) {
            $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
        })->where('status', 1)->orderBy($this->sort, $this->direction)->paginate($this->quantity);

        return view('livewire.paciente.listado-pagos-paciente', compact('pacientes'));
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
        $pacienteDel->delete();
        $this->openDelPaciente = 'hidden';
    }
}
