<?php

namespace App\Http\Livewire\Kine;

use App\Models\Doctor;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoKines extends Component
{
  use WithPagination;
  public $search;
  protected $listeners = ['success-kine' => 'render', 'success' => 'render'];
  protected $queryString = ['search'];
  public $sort = 'updated_at';
  public $direction = 'desc';

  public function updatingSearch()
  {
    $this->resetPage();
  }

  public function render()
  {
    $doctores = Doctor::where(function ($query) {
      $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%')
        ->orWhere('rut', 'like', '%' . $this->search . '%')
        ->orWhere('status', 'like', '%' . $this->search . '%');
    })->orderBy($this->sort, $this->direction)->paginate(5);

    return view('livewire.kine.listado-kines', compact('doctores'));
  }
}
