<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPacientes extends Component
{

    use WithPagination;
    public $search;
    protected $listeners = ['success' => 'render','success-paciente' => 'render'];
    protected $queryString = ['search'];
    public $sort = 'updated_at';
    public $direction = 'desc';

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function render()
    {

        $pacientes = User::where('user_type', 'Paciente')
            ->where(function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%')
                    ->orWhere('payment_status', 'like', '%' . $this->search . '%')
                    ->orWhere('email', 'like', '%' . $this->search . '%');
            })->orderBy($this->sort, $this->direction)->paginate(5);

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
