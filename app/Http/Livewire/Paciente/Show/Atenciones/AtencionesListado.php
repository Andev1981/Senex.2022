<?php

namespace App\Http\Livewire\Paciente\Show\Atenciones;

use App\Models\Application;
use App\Models\Patient;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class AtencionesListado extends Component
{

  use WithPagination;
  public Patient $paciente;

  protected $listeners = ['success-atencion' => 'successAtention'];

  public function render()
  {

    $atenciones = Application::where('user_id', $this->paciente->id)->orderBy('updated_at', 'desc')->paginate(5);

    return view('livewire.paciente.show.atenciones.atenciones-listado', compact('atenciones'));
  }

  public function mount(Patient $paciente)
  {
    $this->paciente = $paciente;
  }

  public function successAtention(Patient $paciente)
  {

    $this->mount($paciente);
  }
}
