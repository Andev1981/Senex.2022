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
  

    public function mount(ApplyItem $item){
        $this->item = $item;
        $this->user = $item->application->user;
        $this->type = $item->application->type_payment;
        $this->items = ApplyItem::where('application_id',$item->application->id)->orderBy('fecha_atencion','desc')->get(); 
    }

    public function render()
    {
        return view('livewire.paciente.pagos.modal-pago');
    }

    public function selectItem($id){
        $singleItem = ApplyItem::find($id);
        $payment = PaymentIncome::where('apply_item_id',$id)->first();
        if(!$payment){
            PaymentIncome::create([
                'pay' => $singleItem->price,
                'application_id' => $singleItem->application_id,
                'apply_item_id' => $singleItem->id,
            ]);
        }else{
            $payment->delete();
        }
        
        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');
        $this->item = $singleItem;

    }
}
