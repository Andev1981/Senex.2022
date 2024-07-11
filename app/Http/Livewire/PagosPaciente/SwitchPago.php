<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\Wallet;
use Livewire\Component;

class SwitchPago extends Component
{

    public ApplyItem $item;
    public $items = [];
    public $openItem = 'hidden';
    public $user;
    public $type;
    public $pay = 0;
    public $status;
    public $findSaldo;
    public $payment;
    public $application;
    public $wallet;
    public $newOrden;

    public function mount(ApplyItem $item)
    {
        $this->item = $item;
        $this->application = $item->application;
        $this->wallet = Wallet::where('patient_id', $this->application->patient_id)->first();
        $allPacientes = Patient::with('applyItems')->where('status', 1)->orderBy('updated_at', 'asc')->get();
        $this->newOrden = $allPacientes->max('orden');
        $this->statusPaciente();
    }

    public function render()
    {
        return view('livewire.pagos-paciente.switch-pago');
    }


    public function selectItem($id)
    {
        $item = ApplyItem::find($id);
        $item->estado_pago = $this->item->estado_pago == 0 ? 1 : 0;
        $item->save();

        if ($this->wallet->balance > 0) {
            $tipo = $this->item->estado_pago == 0 ? 1 : 0;

            if ($tipo === 1 && $this->wallet->balance >= $item->price) {
                $this->wallet->balance = $this->wallet->balance - $item->price;
            }

            $this->wallet->save();
        }

        $this->statusPaciente();

        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');
        $this->mount($item);
        $this->render();
    }

    public function statusPaciente()
    {
        $res = ApplyItem::where('patient_id', $this->application->patient_id)->where('status', 1)->where('estado_pago', 0)->get();

        if (count($res) === 0) {
            $paciente = Patient::find($this->application->patient_id);
            $paciente->payment_status = 2;
            $paciente->orden = $this->newOrden++;
            $paciente->save();
        } else {
            $paciente = Patient::find($this->application->patient_id);
            $paciente->payment_status = 1;
            $paciente->orden = $this->newOrden++;
            $paciente->save();
        }
    }
}
