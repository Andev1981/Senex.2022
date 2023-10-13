<?php

namespace App\Http\Livewire\Tratamientos;

use App\Models\Application;
use App\Models\Patient;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class IndexTratamientos extends Component
{
    use WithPagination;
  public Patient $paciente;

  protected $listeners = ['success-atencion' => 'successAtention'];

    public function render()
    {
        $atenciones = Application::where('patient_id', $this->paciente->id)->orderBy('updated_at', 'desc')->paginate(5);
        return view('livewire.tratamientos.index-tratamientos', compact('atenciones'));
    }

      public function mount(Patient $paciente)
  {
    $this->paciente = $paciente;
  }

  public function successAtention(Patient $paciente){

    $this->mount($paciente);
  }
  
}
