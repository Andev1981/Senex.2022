<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\PacienteKine;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoPacientes extends Component
{
  use WithPagination;
  public $selPaciente;

  public function render()
  {
    if (auth()->user()->user_type === "Kine") {
      $items = PacienteKine::where('doctor_id', auth()->user()->doctor->id)->paginate(10);
    } else {
      return redirect('/');
    }
    return view('livewire.kinesiologos.listado-pacientes', compact('items'));
  }

  public function selectPaciente($paciente)
  {
    return redirect('/kinesiologos/pacientes/' . $paciente);
  }
}
