<?php

namespace App\Http\Livewire\Paciente\Pagos;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentIncome;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class IndexPagos extends Component
{
    use WithPagination;
    public Patient $paciente;
    public $search,
           $sort = 'updated_at',
           $direction = 'desc',
           $valorTotalAtenciones = 0,
           $valorTotalAtendidas = 0,
           $countSuma = 0,
           $itemsSuma = 0,
           $type = 1,
           $userPayStatus = 0,
           $buscarFecha,
           $month = '',
           $year,
           $reloadStatus = 0,
           $fechaActual,
           $itemSumaPendiente = 0,
           $openModalPago = 'hidden',
           $payments = [],
           $monthName = '',
           $valor,
           $fecha_pago,
           $applyItem,
           $applyItemsCount =0,
           $countSumaAplication =0;

    protected $queryString = ['search'];
    protected $listeners = ['update-payment' => 'render'];

     protected $rules = [
        'valor' => 'required|min:4|max:99999',
        'fecha_pago' => 'required|date',
    ];

    public function mount(Patient $paciente){
        $this->paciente = $paciente;

    }

    public function render()
    {
        if($this->reloadStatus == 0){
          $this->buscarFecha = Carbon::now();
          $this->fechaActual = Carbon::now();
          $this->month = $this->buscarFecha->format('m');
          $this->year = $this->buscarFecha->format('Y');
          $this->reloadStatus = 1;
        }
        
        $this->buscarFecha =  $this->year . '-' . $this->month .'-';

        $this->valorTotalAtenciones = 0;
        $this->valorTotalAtendidas = 0;
        $this->applyItemsCount = 0;
        $this->countSuma = 0;
        $this->itemsSuma = 0;
        $this->itemSumaPendiente = 0;

        //Obtengo el tipo de Pago
        $typePayment = Application::where('patient_id', $this->paciente->id)->take(1)->first();
        
        /*Obtengo en listado de sesiones con estado no pagada del mes seleccionado*/
        $applyItemsSum = ApplyItem::where('status',1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id',$this->paciente->id)->get();
        
        /*Asigno valor a la variable que almacena el valor total de las atenciones*/
        $this->valorTotalAtenciones = $applyItemsSum->sum('price');


        $applyItems = ApplyItem::where('status',2)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id',$this->paciente->id)->paginate(5);


        $this->applyItemsCount = $applyItems->count();
        $this->applyItem = $applyItems[0];

        $countSumaAplications = PaymentIncome::where('application_id',$applyItems[0]->application_id)->where('apply_item_id',$applyItems[0]->id)->where('status',2)->get();

        if(count($countSumaAplications) > 0){
            $this->payments = $countSumaAplications;
            $this->countSumaAplication = $countSumaAplications->sum('pay');
        }else{
            $this->countSumaAplication = 0;
        }


        foreach($applyItems as $applyItem){

            $paymentIncomePay = PaymentIncome::where('application_id',$applyItems[0]->application_id)->where('apply_item_id',$applyItem->id)->where('status',2)->first();
            
            if($paymentIncomePay){
               $this->valorTotalAtendidas += $paymentIncomePay->pay;
            }

            $this->itemsSuma += 1;
        }

 

        $this->setMonth($this->month);

        return view('livewire.paciente.pagos.index-pagos',
                    [
                        'applyItems' => $applyItems,
                        'typePayment' => $typePayment
                    ]
                );
    }

    public function setMonth($month){
        switch ($month) {
            case '01':
                $this->monthName = 'Enero';
                break;
            case '02':
                $this->monthName = 'Febrero';
                break;
            case '03':
                $this->monthName = 'Marzo';
                break;
            case '04':
                $this->monthName = 'Abril';
                break;
            case '05':
                $this->monthName = 'Mayo';
                break;
            case '06':
                $this->monthName = 'Junio';
                break;
            case '07':
                $this->monthName = 'Julio';
                break;
            case '08':
                $this->monthName = 'Agosto';
                break;
            case '09':
                $this->monthName = 'Septiembre';
                break;
            case '10':
                $this->monthName = 'Octubre';
                break;
            case '11':
                $this->monthName = 'Noviembre';
                break;
            case '12':
                $this->monthName = 'Diciembre';
                break;
            default:
                $this->monthName = '';
                break;
        }
    }

    public function savePay(){

        $this->validate();

        if($this->valor <= ($this->valorTotalAtenciones - $this->valorTotalAtendidas)){

        }

        $newPayment = PaymentIncome::create([
            'pay' => $this->valor,
            'application_id' => $this->applyItem->application_id,
            'apply_item_id' => $this->applyItem->id,
            'fecha_pago' => $this->fecha_pago,
            'status' => 2,
        ]);

        $this->mount($this->paciente);
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-success');
    }

    public function deletePay($payment){
        $selPay = PaymentIncome::find($payment['id']);
        $selPay->delete();
        $this->mount($this->paciente);
        $this->emit('success');
        $this->dispatchBrowserEvent('swal-success');

    }

   
}
