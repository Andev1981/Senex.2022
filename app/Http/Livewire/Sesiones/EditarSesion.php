<?php

namespace App\Http\Livewire\Sesiones;

use App\Models\Activity;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplyItem;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class EditarSesion extends Component
{

    public ApplyItem $applyItem;
    public  $patient,
        $types = [],
        $kines = [],
        $openItem = 'hidden',
        $openDelItem = 'hidden',
        $selectedKine,
        $selectedStatus,
        $selectedType,
        $application,
        $countApplies,
        $applypaciente,
        $fecha_atencion,
        $comments = '',
        $price,
        $numero_sesion,
        $errorNumSesion = false,
        $wallet;
    public $newOrden;

    protected $rules = [
        'selectedKine' => 'required',
        'selectedStatus' => 'required',
        'fecha_atencion' => 'required',
        'comments' => 'max:255',
        'selectedType' => 'required',
        'price' => 'required',
        'numero_sesion' => 'required',
    ];

    public function render()
    {
        return view('livewire.sesiones.editar-sesion');
    }

    public function mount(ApplyItem $applyItem)
    {

        $this->applyItem = $applyItem;
        $this->application = $applyItem->application;
        $this->patient = $this->applyItem->patient;
        if ($applyItem->doctor) {
            $this->selectedKine = $applyItem->doctor->id;
        } else {
            $this->selectedKine = 1;
        }
        $this->selectedStatus = $applyItem->status;
        if ($applyItem->fecha_atencion) {
            $this->fecha_atencion = Carbon::parse(strtotime($applyItem->fecha_atencion))->format('Y-m-d');
        }
        $this->comments = $applyItem->comments;
        $this->selectedType = $applyItem->application_type_id;
        $this->price = $applyItem->price;
        $this->numero_sesion = $applyItem->numero_sesion;
        $this->countApplies = ApplyItem::where('application_id', $this->application->id)->count();
        $this->kines = Doctor::where('status', 1)->orderBy('name', 'ASC')->get();
        $this->types = ApplicationType::where('estado', 1)->get();
        $this->wallet = Wallet::where('patient_id', $this->patient->id)->first();
        $allPacientes = Patient::with('applyItems')->where('status', 1)->orderBy('updated_at', 'asc')->get();

        $this->newOrden = $allPacientes->max('orden');
    }

    public function save()
    {

        $this->validate();

        $this->applyItem->user_id = $this->selectedKine;
        $this->applyItem->doctor_id = $this->selectedKine;
        $this->applyItem->status = $this->selectedStatus;

        if ($this->fecha_atencion) {
            $this->applyItem->fecha_atencion = $this->fecha_atencion;
        }

        $this->applyItem->comments = $this->comments;
        $this->applyItem->application_type_id = $this->selectedType;
        $this->applyItem->price = $this->price;
        $this->applyItem->numero_sesion = $this->numero_sesion;
        $this->applyItem->save();
        $this->clear();

        if ($this->selectedStatus === 1 && $this->wallet->balance >= $this->valor) {
            $this->wallet->balance = $this->wallet->balance - $this->valor;
            $this->wallet->save();
        }

        $this->statusPaciente();
    }

    public function delete()
    {
        $this->applyItem->delete();
        $this->clear();
    }

    public function clear()
    {
        $this->resetValidation();
        $this->resetErrorBag();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-item');
        $this->openItem = 'hidden';
        $this->openDelItem = 'hidden';
        $this->errorNumSesion = false;
    }

    public function statusPaciente()
    {
        $res = ApplyItem::where('patient_id', $this->application->patient_id)->where('status', 1)->where('estado_pago', 0)->get();
        if (count($res) === 0) {
            $paciente = Patient::find($this->patient);
            $paciente->payment_status = 2;
            $paciente->orden = $this->newOrden++;
            $paciente->save();
        } else {
            $paciente = Patient::find($this->patient);
            $paciente->payment_status = 1;
            $paciente->orden = $this->newOrden++;
            $paciente->save();
        }
    }
}
