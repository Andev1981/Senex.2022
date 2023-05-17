<?php

namespace App\Http\Livewire\Kine;

use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoKines extends Component
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
        return view('livewire.kine.listado-kines', [
            'doctores' => User::where('last_name','like', '%'.$this->search.'%')
            ->orWhere('phone','like', '%'.$this->search.'%')
            ->orderBy($this->sort, $this->direction)
            ->paginate(5),
        ]);
    }
}
