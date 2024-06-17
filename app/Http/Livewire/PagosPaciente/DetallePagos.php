<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\Patient;
use App\Models\Wallet;
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
        $items,
        $itemsFechas,
        $itemsApllys = [], $verSaldo = false, $wallet;

    protected $queryString = ['search'];
    protected $listeners = ['update-payment' => 'render'];

    public function mount(Patient $paciente)
    {
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

        /*Fechas Items totales*/
        $this->items = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('estado_pago', 0)->get();

        /*Fechas Items*/
        $this->itemsFechas = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('estado_pago', 0)->where('fecha_atencion', '<', $this->buscarFecha . '-01  00:00:00')->get();

        /*Asigno valor a la variable que almacena el valor total de las atenciones*/
        $this->valorTotalAtenciones = $applyItemsSum->sum('price');

        $applyItems = ApplyItem::where('status', 1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('patient_id', $this->paciente->id)->orderBy('numero_sesion', 'asc')->get();

        if (count($applyItems) > 0) {
            $this->applyItemsCount = $applyItems->count();
            $this->applyItem = $applyItems[0];

            $this->countSumaAplication = ApplyItem::where('application_id', $typePayment->id)->where('estado_pago', 1)->count();
        }

        $this->valorTotalAtendidas = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('fecha_atencion', 'like', $this->buscarFecha . '%')->where('estado_pago', 1)->sum("price");

        $this->setMonth($this->month);

        /*   $this->verificarPagos(); */

        $wallet = Wallet::where('patient_id', $this->paciente->id)->first();

        if ($wallet == null) {
            $this->wallet = Wallet::create([
                'patient_id' => $this->paciente->id,
                'balance' => 0,
            ]);
        } else {
            $this->wallet = $wallet;
        }

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

    public function inputSaldo()
    {
        if ($this->verSaldo == true) {
            $this->verSaldo = false;
            $this->saldo = 0;
        } else {
            $this->verSaldo = true;
        }
    }

    public function saveSaldo()
    {
        $wallet = Wallet::where('patient_id', $this->paciente->id)->first();
        $wallet->balance = $this->wallet->balance + $this->saldo;
        $wallet->save();
        $this->inputSaldo();
        $this->render();
    }

    public function verificarPagos()
    {

        $buscarAplication = $this->paciente->applications->first();

        if ($buscarAplication) {
            /* 0: Por sesion, 1: Por Tratamiento, 2: Mensual por sesión, 3: Por Adelantado */
            if ($buscarAplication->type_payment == 0) {
                //Por Sesión
                $applyItems = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('estado_pago', 0)->get();
                $this->itemsApllys = $applyItems;
                if ($applyItems->count() > 0) {
                    $paciente = Patient::find($this->paciente->id);
                    $paciente->payment_status = 1;/* Pagos Pendientes */
                    $paciente->save();
                    return;
                } else {
                    $paciente = Patient::find($this->paciente->id);
                    $paciente->payment_status = 2; /* Pagos al dia */
                    $paciente->save();
                    return;
                }
            } else if ($buscarAplication->type_payment == 1) {
            } else if ($buscarAplication->type_payment == 2) {
                //Mensual por Sesiones
                $applyItems = ApplyItem::where('patient_id',  $this->paciente->id)->where('status', 1)->where('estado_pago', 0)->where('fecha_atencion', '<', $this->buscarFecha . '-01  00:00:00')->get();

                $this->itemsApllys = $applyItems;
                if ($applyItems->count() > 0) {
                    $paciente = Patient::find($this->paciente->id);
                    $paciente->payment_status = 1;/* Pagos Pendientes */
                    $paciente->save();
                } else {
                    $paciente = Patient::find($this->paciente->id);
                    $paciente->payment_status = 2; /* Pagos al dia */
                    $paciente->save();
                }
            } else if ($buscarAplication->type_payment == 3) {
                //Por Adelantado
                $applyItems = ApplyItem::where('patient_id', $this->paciente->id)->where('status', 1)->where('estado_pago', 0)->get();

                if ($applyItems->count() > 0) {

                    foreach ($applyItems as $item) {
                        if ($this->wallet->balance >= $item->price) {
                            $item->estado_pago = 1;
                            $item->save();
                            $wallet = Wallet::where('patient_id', $this->paciente->id)->first();
                            $wallet->balance = $wallet->balance - $item->price;
                            $wallet->save();
                        }
                    }
                }
            }
        }

        return redirect($this->paciente->id . '/pagos/');
        /* $this->wallet = Wallet::where('patient_id', $this->paciente->id)->first();
        $this->emit('update-payment');
        $this->dispatchBrowserEvent('swal-success');
        $this->mount($this->paciente);
        $this->render(); */
    }
}
