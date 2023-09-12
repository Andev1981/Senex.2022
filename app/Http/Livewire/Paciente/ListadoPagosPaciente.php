<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPagosPaciente extends Component
{

    use WithPagination;
    public $selectedPaciente;
    public $search;
    protected $listeners = ['success' => 'render','success-paciente' => 'render'];
    protected $queryString = ['search'];
    public $sort = 'updated_at';
    public $direction = 'desc';
    public $openDelPaciente = 'hidden';
    public $quantity = 10;


    public function updatingSearch()
    {
        $this->resetPage();
    }


    public function render()
    {
        $pacientes = User::where('user_type', 'Paciente')
            ->where(function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
            })->orderBy($this->sort, $this->direction)->paginate($this->quantity);
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

    public function openDeleteModal($paciente){
        $this->selectedPaciente ='';
        $this->selectedPaciente = $paciente;
        $this->openDelPaciente = '';
    }

    public function deletePaciente(){
        $pacienteDel = User::find($this->selectedPaciente['id']);
        $pacienteDel->delete();
        $this->openDelPaciente = 'hidden';
    }
}
