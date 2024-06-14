<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\PaymentIncome;
use Carbon\Carbon;
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

    public function mount(ApplyItem $item)
    {

        $this->item = $item;
        $this->application = $item->application;

        $this->findSaldo = ApplyItem::where('application_id', $this->item->application_id)->where('estado_pago', 1)->sum("price");

        if (!$this->findSaldo == 0) {

            $this->findSaldo = 0;
        }
    }

    public function render()
    {
        return view('livewire.pagos-paciente.switch-pago');
    }


    public function selectItem($id)
    {
        if ($this->application->type_payment < 3) {
            $item = ApplyItem::find($id);
            $item->estado_pago = $this->item->estado_pago == 0 ? 1 : 0;
            $item->save();

            $this->emit('update-payment');
            $this->dispatchBrowserEvent('swal-success');
            $this->mount($item);
            $this->render();
        } else {

            $this->emit('update-payment');
            $this->dispatchBrowserEvent('swal-error');
            $this->render();
        }
    }
}
