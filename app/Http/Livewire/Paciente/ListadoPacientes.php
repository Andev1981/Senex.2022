<?php

namespace App\Http\Livewire\Paciente;

use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPacientes extends Component
{

    use WithPagination;
    public $search;
    protected $listeners = ['success' => 'render'];
    protected $queryString = ['search'];
    public $sort = 'id';
    public $direction = 'desc';

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function render()
    {
        return view('livewire.paciente.listado-pacientes', [
            'pacientes' => User::where('name','like', '%'.$this->search.'%')
            ->orWhere('last_name','like', '%'.$this->search.'%')
            ->orWhere('phone','like', '%'.$this->search.'%')
            ->orderBy($this->sort, $this->direction)
            ->paginate(5),
        ]);
    }
}
