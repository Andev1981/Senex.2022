<?php

namespace App\Http\Livewire\Paciente\Pagos;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\Patient;
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
           $totalAtenciones = 0,
           $countSuma = 0,
           $totalAtendidas = 0,
           $type = 1,
           $itemsSuma = 0,
           $userPayStatus = 0,
           $buscarFecha,
           $month,
           $year,
           $reloadStatus = 0,
           $fechaActual,
           $itemSumaPendiente = 0;

    protected $queryString = ['search','buscarFecha'];
    protected $listeners = ['update-payment' => 'render'];

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

        $typePayment = Application::where('patient_id', $this->paciente->id)->take(1)->first();
        $this->totalAtenciones = 0;
        $this->totalAtendidas = 0;
        $this->countSuma = 0;
        $this->itemsSuma = 0;
        $this->itemSumaPendiente = 0;

        
        $applyItemsSum = ApplyItem::where('status',1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id',$this->paciente->id)->get();
        $this->totalAtenciones = $applyItemsSum->sum('price');


        $applyItems = ApplyItem::where('status',1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id',$this->paciente->id)->paginate(10);


        foreach($applyItems as $applyItem){
            $itemsSuma = PaymentIncome::where('apply_item_id',$applyItem->id)->where('status',1)->first();
            $countSuma = PaymentIncome::where('apply_item_id',$applyItem->id)->where('status',2)->first();
            if(!$itemsSuma){
               $newItem =  PaymentIncome::create([
                    'pay' => $applyItem->price,
                    'application_id' => $applyItem->application_id,
                    'apply_item_id' => $applyItem->id,
                    'status' => 1
                ]);
                $itemsSuma = $newItem;
            }

            if($countSuma){
               $this->countSuma += 1; 
               $this->totalAtendidas += $countSuma->pay;
            }

            $this->itemsSuma += 1;
        }

        $this->itemSumaPendiente = $this->itemsSuma - $this->countSuma;
               
       /*  if($this->totalAtenciones == $this->totalAtendidas){
            $this->paciente->payment_status = 2;
        }elseif($this->totalAtenciones < $this->totalAtendidas){
            $this->paciente->payment_status = 1;
        }
        
        $this->paciente->save(); */


        return view('livewire.paciente.pagos.index-pagos',
                    [
                        'applyItems' => $applyItems,
                        'typePayment' => $typePayment
                    ]
                );
    }
}
