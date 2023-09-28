<?php

namespace App\Http\Livewire\Paciente\Pagos;

use App\Models\Application;
use App\Models\Patient;
use App\Models\PaymentIncome;
use Livewire\Component;
use Livewire\WithPagination;

class ModalPagoMensual extends Component
{
    use WithPagination;

    public $openModalPago = 'hidden';
    public $paciente,
           $mensaje,
           $findSaldo,
           $fecha_pago,
           $valor,
           $application;

    protected $rules = [
        'valor' => 'required|min:4|max:99999',
        'fecha_pago' => 'required|date',
        'mensaje' => 'string'
    ];

    public function mount(Patient $paciente){
        
        $this->paciente = $paciente;

        $this->application = Application::where('patient_id',$this->paciente->id)->where('status',1)->first();

        $this->findSaldo = PaymentIncome::where('application_id',$this->application->id)->where('type',2)->first(); 

        if(!$this->findSaldo){
           $this->findSaldo = PaymentIncome::create([
                'pay' => 0,
                'application_id' => $this->application->id,
                'apply_item_id' => 0,
                'status' => 2,
                'type' => 2,
            ]);
        }
 
    }

    public function render()
    {
        $payments = PaymentIncome::where('application_id',$this->application->id)->where('type',1)->orderBy('fecha_pago','desc')->paginate(10);
        return view('livewire.paciente.pagos.modal-pago-mensual',[
            'payments' => $payments
        ]);
    }


    public function savePay(){

        $this->validate();

        PaymentIncome::create([
            'pay' => $this->valor,
            'application_id' => $this->application->id,
            'apply_item_id' => 0,
            'fecha_pago' => $this->fecha_pago,
            'status' => 2,
            'type' => 1,
            'mensaje' => $this->mensaje
        ]);

        $this->findSaldo->saldo += $this->valor;
        $this->findSaldo->save();

        $this->reset(['valor','fecha_pago','mensaje']);
        $this->resetErrorBag();
        $this->resetValidation();
        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');
    }

    public function deletePay($payment){
        $this->findSaldo->saldo -= $payment['pay'];
        $this->findSaldo->save();
        $selPay = PaymentIncome::find($payment['id']);
        $selPay->delete();
        $this->resetErrorBag();
        $this->resetValidation();
        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');

    }

}
