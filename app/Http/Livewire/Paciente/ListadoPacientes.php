<?php

namespace App\Http\Livewire\Paciente;

use App\Models\Patient;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPacientes extends Component
{

    use WithPagination;
    public $selectedPaciente;
    public $search;
    protected $listeners = ['success' => 'render', 'success-paciente' => 'render','success-item-single' => 'render','success-item' => 'render','success-atencion' => 'render'];
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
      
        $pacientes = Patient::with('applications')->where(function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
            })->orderBy($this->sort, $this->direction)->paginate(10);

        return view('livewire.paciente.listado-pacientes', compact('pacientes'));
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


}
