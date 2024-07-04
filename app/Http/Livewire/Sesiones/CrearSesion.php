<?php

namespace App\Http\Livewire\Sesiones;

use App\Models\Activity;
use Livewire\Component;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PaymentIncome;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;

class CrearSesion extends Component
{

    public $application,
        $tipo_atenciones = [],
        $kines = [],
        $openItemCreate = 'hidden',
        $kine = '',
        $tipo_atencion = '',
        $status = '',
        $valor = '',
        $fecha_atencion,
        $mensaje = '',
        $numero_sesion,
        $paciente,
        $countApplies,
        $errorNumSesion = false,
        $estado = 0,
        $profesional_derivacion = "",
        $lugar_derivacion = "",
        $documentos = [],
        $forma_de_pago,
        $applyUser,
        $wallet;


    protected function rules()
    {
        if ($this->estado == 1) {

            return [
                'kine' => 'required',
                'tipo_atencion' => 'required',
                'status' => 'required',
                'fecha_atencion' => 'required',
                'valor' => 'required|integer|min:1|max:999999',
                'mensaje' => 'max:255',
                'numero_sesion' => 'required',
                'profesional_derivacion' => 'string|max:100',
                'lugar_derivacion' => 'string|max:150',
                'documentos.*' => 'mimes:png,jpg,jpeg,pdf|max:1024',
            ];
        } else {
            return [
                'kine' => 'required',
                'tipo_atencion' => 'required',
                'status' => 'required',
                'fecha_atencion' => 'required',
                'valor' => 'required|integer|min:1|max:999999',
                'numero_sesion' => 'required',
                'mensaje' => 'max:255',
            ];
        }
    }


    public function render()
    {
        return view('livewire.sesiones.crear-sesion');
    }

    public function mount(Patient $patient)
    {

        $this->application = Application::where('patient_id', $patient->id)->where('status', 1)->first();
        $this->wallet = Wallet::where('patient_id', $patient->id)->first();

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

        $this->tipo_atenciones = ApplicationType::where('estado', 1)->get();
        $this->kines = Doctor::where('status', 1)->orderBy('name', 'ASC')->get();
        $this->paciente = $patient;
    }

    public function save()
    {
        $this->validate();

        if ($this->status === 1 && $this->wallet->balance >= $this->valor) {
            $this->wallet->balance = $this->wallet->balance - $this->valor;
            $this->wallet->save();
        }

        if ($this->estado == 1) {
            $this->application = Application::create([
                'derivado' => $this->profesional_derivacion,
                'desde' => $this->lugar_derivacion,
                'comments' => $this->mensaje,
                'user_id' => $this->paciente->id,
                'patient_id' => $this->paciente->id,
                'status' => 1,
                'type_payment' => 2,
            ]);
            $this->estado == 0;
        }

        $apply = ApplyItem::create([
            'user_id' => $this->kine,
            'patient_id' => $this->paciente->id,
            'doctor_id' => $this->kine,
            'application_id' => $this->application->id,
            'application_type_id' => $this->tipo_atencion,
            'application_type_user_id' => 0,
            'price' => $this->valor,
            'fecha_atencion' => $this->fecha_atencion,
            'numero_sesion' => $this->numero_sesion,
            'status' => $this->status,
        ]);

        PaymentIncome::create([
            'pay' => $this->valor,
            'application_id' => $this->application->id,
            'apply_item_id' => $apply->id,
        ]);


        $applicationTypeUser = ApplicationTypeUser::where('application_type_id', $this->tipo_atencion)->where('user_id', $this->kine)->first();

        if (!$applicationTypeUser) {
            $applicationTypeUser = ApplicationTypeUser::create([
                'user_id' => $this->kine,
                'application_type_id' => $this->tipo_atencion,
                'price' => 0
            ]);

            $res = ApplyItem::where('patient_id', $this->paciente->id)->where('estado_pago', 1)->get();

            if (count($res) === 0) {
                $paciente = Patient::find($this->paciente->id);
                $paciente->payment_status = 2;
                $paciente->save();
            }
        }

        Assign::create([
            'user_id' => $this->kine,
            'application_id' => $this->application->id,
            'apply_item_id' => $apply->id,
            'application_type_user_id' => $applicationTypeUser->id,
        ]);


        $this->clear();
    }

    public function clear()
    {
        $this->resetErrorBag();
        $this->resetValidation();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-item-single');
        $this->openItemCreate = 'hidden';
        $this->reset([
            'kine',
            'tipo_atencion',
            'status',
            'mensaje',
            'numero_sesion',
            'estado'
        ]);
        $this->errorNumSesion = false;
        $this->mount($this->paciente);
    }
}
