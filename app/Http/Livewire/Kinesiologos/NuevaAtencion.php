<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\PacienteKine;
use App\Models\ApplyItem;
use App\Models\PaymentIncome;
use App\Models\Wallet;
use Carbon\Carbon;
use Livewire\Component;

class NuevaAtencion extends Component
{
  public $applyItem, $isOpen = false, $status = 0, $fecha_atencion, $mensaje, $application, $paciente, $wallet, $valor, $countApplies, $estado, $tipo_atencion, $month;

  public function render()
  {
    $fecha = Carbon::now('America/Santiago')->subHours(4);

    $this->fecha_atencion = Carbon::parse(strtotime($fecha))->format('Y-m-d');

    $this->month = $fecha->format('m');

    $tipo_atenciones = ApplicationType::where('estado', 1)->get();

    $pacientes = PacienteKine::with('paciente')->where('doctor_id', auth()->user()->doctor->id)->get();

    return view('livewire.kinesiologos.nueva-atencion', compact('tipo_atenciones', 'pacientes'));
  }

  protected function rules()
  {
    return [
      'paciente' => 'required',
      'tipo_atencion' => 'required',
      'mensaje' => 'max:255',
    ];
  }

  public function save()
  {

    $this->validate();

    $this->application = Application::where('patient_id', $this->paciente)->where('status', 1)->first();
    $this->wallet = Wallet::where('patient_id', $this->paciente)->first();

    if (!$this->application) {
      $this->countApplies = 0;
      $this->valor = 0;
      $this->estado = 1;
    } else {
      $this->countApplies = ApplyItem::where('application_id', $this->application->id)->count();
      $valor = ApplyItem::where('application_id', $this->application->id)->orderBy('id', 'desc')->first('price');
      if ($valor) {
        $this->valor = $valor->price;
      } else {
        $this->valor = 0;
      }
    }

    if ($this->status === 1 && $this->wallet->balance >= $this->valor) {
      $this->wallet->balance = $this->wallet->balance - $this->valor;
      $this->wallet->save();
    }

    $sesion = ApplyItem::with('application', 'patient', 'doctor')
      ->where('patient_id', $this->paciente)
      ->where('doctor_id', auth()->user()->doctor->id)
      ->latest('id')->first();


    if ($sesion) {
      $fecha = Carbon::parse(strtotime($sesion->fecha_atencion))->format('m');
      if ($fecha === $this->month) {
        $numeroSesion = $sesion->numero_sesion + 1;
      } else {
        $numeroSesion = 1;
      }
    } else {
      $numeroSesion = 1;
    }

    if ($this->estado == 1) {
      $this->application = Application::create([
        'derivado' => '',
        'desde' => '',
        'comments' => $this->mensaje,
        'user_id' => $this->paciente,
        'patient_id' => $this->paciente,
        'status' => 1,
        'type_payment' => 2,
      ]);
      $this->estado == 0;
    }

    $apply = ApplyItem::create([
      'user_id' => auth()->user()->doctor->id,
      'patient_id' => $this->paciente,
      'doctor_id' => auth()->user()->doctor->id,
      'application_id' => $this->application->id,
      'application_type_id' => $this->tipo_atencion,
      'application_type_user_id' => 0,
      'price' => $this->valor,
      'fecha_atencion' => $this->fecha_atencion,
      'numero_sesion' => $numeroSesion,
      'status' => 1,
      'comments' => $this->mensaje,
    ]);

    PaymentIncome::create([
      'pay' => $this->valor,
      'application_id' => $this->application->id,
      'apply_item_id' => $apply->id,
    ]);

    /*   Assign::create([
      'user_id' => $this->kine,
      'application_id' => $this->application->id,
      'apply_item_id' => $apply->id,
      'application_type_user_id' => $applicationTypeUser->id,
    ]); */
    $this->clear();
  }

  public function clear()
  {
    $this->resetErrorBag();
    $this->resetValidation();
    $this->emitTo('kinesiologos.resumenes', 'create-sesion');
    $this->dispatchBrowserEvent('swal-success');
    $this->reset([
      'fecha_atencion',
      'tipo_atencion',
      'mensaje',
    ]);
    $this->closeModal();
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
