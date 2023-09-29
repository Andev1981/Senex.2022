<?php

namespace App\Http\Livewire\Paciente\Pagos;

use App\Models\ApplyItem;
use App\Models\PaymentIncome;
use Livewire\Component;

class ModalPago extends Component
{
    public ApplyItem $item;
    public $items = [];
    public $openItem = 'hidden';
    public $user;
    public $type;
    public $pay = 0;
    public $status;
    public $findSaldo;
  
    public function mount(ApplyItem $item){

        if(!$item->payment){
          $item =  PaymentIncome::create([
                'pay' => $item->price,
                'application_id' => $item->application_id,
                'apply_item_id' => $item->id,
                'status' => 2,
                'type' => 0,
            ]);
        }

        $this->item = $item;

        $this->findSaldo = PaymentIncome::where('application_id',$this->item->application_id)->where('type',2)->first();


    }

    public function render()
    {
        return view('livewire.paciente.pagos.modal-pago');
    }

    public function selectItem($id){

        $payment = PaymentIncome::find($id);
        
        if(!$payment){
           $payment = PaymentIncome::create([
                'pay' => $this->item->price,
                'application_id' => $this->item->application_id,
                'apply_item_id' => $this->item->id,
                'status' => 2
            ]);
        }

        if($this->findSaldo->saldo < 0){
            $this->findSaldo->saldo = 0;
            $this->findSaldo->save();
        }
        
        
        
        if($payment->status == 1 || $payment->status == 0){
            
            $payment->status = 2;
            $payment->save();
            
        }elseif($payment->status == 2){
            $payment->status = 1;
            $payment->save();
        }
        

        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');
        $item = ApplyItem::find($this->item->id);
        $this->mount($item);
        $this->render();
    }
}
