<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentIncome;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class DetallePagos extends Component
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
        $applyItemsCount = 0,
        $countSumaAplication = 0,
        $saldoAFavor = 0,
        $file_path,
        $saldo,
        $setSaldo,
        $applyItems,
        $fechaApplyItems,
        $fechaBuscar = '';

    protected $queryString = ['search'];
    protected $listeners = ['update-payment' => 'render'];


    public function mount(Patient $paciente)
    {
        $fechaActual = Carbon::now();
        $this->fechaBuscar = $fechaActual->format('Y-m');

        $this->applyItems = ApplyItem::where('patient_id', $paciente->id)->where('status', 1)->where('estado_pago', 0)->get();
        $this->fechaApplyItems = ApplyItem::where('patient_id', 2)->where('status', 1)->where('estado_pago', 0)->where('created_at', '<', $this->fechaBuscar . '-01  00:00:00')->get();
        $this->paciente = $paciente;
    }
    public function render()
    {

        if ($this->reloadStatus == 0) {
            $this->buscarFecha = Carbon::now();
            $this->month = $this->buscarFecha->format('m');
            $this->year = $this->buscarFecha->format('Y');
            $this->reloadStatus = 1;
        }

        $this->buscarFecha =  $this->year . '-' . $this->month . '-';

        $this->valorTotalAtenciones = 0;
        $this->valorTotalAtendidas = 0;
        $this->applyItemsCount = 0;
        $this->countSuma = 0;
        $this->itemsSuma = 0;
        $this->itemSumaPendiente = 0;
        $this->saldoAFavor = 0;

        //Obtengo el tipo de Pago
        $typePayment = Application::where('patient_id', $this->paciente->id)->take(1)->first();

        /*Obtengo el listado de sesiones*/
        $applyItemsSum = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderBy('fecha_atencion', 'desc')->get();

        /*Asigno valor a la variable que almacena el valor total de las atenciones*/
        $this->valorTotalAtenciones = $applyItemsSum->sum('price');


        $applyItems = ApplyItem::where('status', 1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id', $this->paciente->id)->get();

        $saldoAFavor = PaymentIncome::where('application_id', $typePayment->id)->where('type', 2)->first();

        if (!$saldoAFavor) {
            $saldoAFavor = PaymentIncome::create([
                'pay' => 0,
                'saldo' => 0,
                'application_id' => $typePayment->id,
                'apply_item_id' => 0,
                'status' => 2,
                'type' => 2,
            ]);
        }

        $this->setSaldo = $saldoAFavor;

        if ($saldoAFavor->saldo < 0) {
            $saldoAFavor->saldo = 0;
            $saldoAFavor->save();
        }

        if ($saldoAFavor) {
            $this->saldoAFavor = $saldoAFavor->saldo;
            $this->saldo = $this->saldoAFavor;
        } else {
            $this->saldo = 0;
        }

        if (count($applyItems) > 0) {
            $this->applyItemsCount = $applyItems->count();
            $this->applyItem = $applyItems[0];

            $this->countSumaAplication = ApplyItem::where('application_id', $typePayment->id)->where('estado_pago', 1)->count();
        }

        $this->valorTotalAtendidas = ApplyItem::where('application_id', $typePayment->id)->where('estado_pago', 1)->sum("price");

        $this->setMonth($this->month);

        return view('livewire.pagos-paciente.detalle-pagos', [
            'applyItems' => $applyItems,
            'typePayment' => $typePayment
        ]);
    }

    public function setMonth($month)
    {
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

    public function paymentState()
    {
    }

    public function setSaldo()
    {
        $this->setSaldo->saldo = 0;
        $this->setSaldo->save();
    }
}
