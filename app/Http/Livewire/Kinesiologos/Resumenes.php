<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\PacienteKine;
use Livewire\Component;
use Carbon\Carbon;
use Livewire\WithFileUploads;

class Resumenes extends Component
{
  use WithFileUploads;

  public $isOpen = false;
  public $kine;
  public $user;
  public $year;
  public $month;
  public $statusFindView = -1;
  public $statusFind = [0, 1, 2, 3];
  public $status = 0;
  public $file_path;
  public $applyItems = [];
  public $buscarFecha;
  public $buscarFechaIn;
  public $kineValues;
  public $totalPacientes = 0;
  public $totalKine = 0;
  public $selPaciente;
  public $reloadStatus = 0;
  public $dias = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
  public $dia = 0;
  public $estadoEliminar = 0;
  public $hoy;
  public $fechaBusquedaExtencion = '%';
  protected $listeners = ['create-sesion' => 'render', 'delete-sesion' => 'render'];

  public function render()
  {
    $this->kine = auth()->user()->doctor;

    if ($this->kine == null) {
      return redirect()->route('/');
    }

    if ($this->kine->id) {
      $this->status = 1;
    }

    if ($this->reloadStatus == 0) {
      $this->buscarFecha = Carbon::now('America/Santiago');
      $this->month = $this->buscarFecha->format('m');
      $this->year = $this->buscarFecha->format('Y');
      $this->dia = $this->buscarFecha->format('d');
      $this->hoy = $this->buscarFecha->format('d');
      $this->reloadStatus = 1;
    }

    if ($this->hoy != $this->dia) {
      $this->estadoEliminar = 1;
    } else {
      $this->estadoEliminar = 0;
    }

    if ($this->dia == 0) {
      $this->buscarFecha =  $this->year . '-' . $this->month . '-%';
    } else {

      $this->buscarFecha =  $this->year . '-' . $this->month . '-' . $this->dia . ' 00:00:00';
    }

    if ($this->selPaciente != 0) {

      $this->applyItems = ApplyItem::with('application', 'patient', 'doctor')
        ->where('patient_id', $this->selPaciente)
        ->where('doctor_id', $this->kine->id)
        ->where('fecha_atencion', 'like', $this->buscarFecha)
        ->orderBy('fecha_atencion', 'asc')->get();
    } else {
      $this->applyItems = ApplyItem::with('application', 'patient', 'doctor')->orWhere('doctor_id', $this->kine->id)->where('fecha_atencion', 'like', $this->buscarFecha)->orderBy('fecha_atencion', 'asc')->get();
    }


    $this->kineValues = ApplicationTypeUser::where('user_id', $this->kine->id)->get();

    $this->totalPacientes = 0;
    $this->totalKine = 0;

    foreach ($this->applyItems as $applyItem) {
      $this->totalPacientes += $applyItem->price;

      foreach ($this->kineValues as $kineValue)
        if ($kineValue->application_type_id == $applyItem->application_type_id) {
          $this->totalKine += $kineValue->price;
        }
    }

    $pacientes = PacienteKine::where('doctor_id', auth()->user()->doctor->id)->get();


    return view('livewire.kinesiologos.resumenes', compact('pacientes'));
  }

  public function clear()
  {
    $this->resetValidation();
    $this->resetErrorBag();
    $this->reset(['atencionSelected', 'atencionValor', 'kine', 'totalClientes', 'totalKine']);
  }

  public function openModal()
  {
    $this->isOpen = true;
  }

  public function closeModal()
  {
    $this->isOpen = false;
  }
}
