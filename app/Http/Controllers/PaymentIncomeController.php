<?php

namespace App\Http\Controllers;

use App\Models\PaymentIncome;
use App\Http\Requests\StorePaymentIncomeRequest;
use App\Http\Requests\UpdatePaymentIncomeRequest;
use App\Models\ApplyItem;
use App\Models\Patient;
use Carbon\Carbon;

class PaymentIncomeController extends Controller
{

    public function verifyPayment()
    {

        $fechaActual = Carbon::now();
        $fechaBuscar = $fechaActual->format('Y-m');

        $allPacientes = Patient::with('applyItems')->where('status', 1)->get();


        foreach ($allPacientes as $paciente) {

            $buscarAplication = $paciente->applications->first();

            if ($buscarAplication->type_payment == 0) {
                //Por Sesión
                $applyItems = ApplyItem::where('patient_id', $paciente->id)->where('status', 1)->get();
                if ($applyItems->count() > 0) {
                    foreach ($applyItems as $applyItem) {
                        if ($applyItem->payment) {
                            if ($applyItem->payment->status == 1) {
                                $paciente->payment_status  = 1;
                                $paciente->save();
                                return redirect('pagos');
                            } else {
                                $paciente->payment_status  = 2;
                                $paciente->save();
                            }
                        }
                    }
                    return redirect('pagos');
                } else {

                    $paciente->payment_status = 0;
                    $paciente->save();
                    return redirect('pagos');
                }
            } else if ($buscarAplication->type_payment == 1) {
                //Pago Mensual
                $applyItems = ApplyItem::where('patient_id', 2)->where('status', 1)->where('fecha_atencion', '<', $fechaBuscar . '-05  00:00:00')->get();

                if ($applyItems->count() > 0) {
                    foreach ($applyItems as $applyItem) {
                        if ($applyItem->payment) {
                            if ($applyItem->payment->status == 1) {

                                $paciente->payment_status = 1;
                                $paciente->save();
                                return redirect('pagos');
                            } else {

                                $paciente->payment_status = 2;
                                $paciente->save();
                            }
                        }
                    }
                    return redirect('pagos');
                } else {

                    $paciente->payment_status = 0;
                    $paciente->save();
                    return redirect('pagos');
                }
            } else if ($buscarAplication->type_payment == 2) {
                //Mensual por Sesiones
                $applyItems = ApplyItem::where('patient_id', $paciente->id)->where('status', 1)->where('fecha_atencion', '<', $fechaBuscar . '-05 00:00:00')->get();

                if ($applyItems->count() > 0) {
                    foreach ($applyItems as $applyItem) {
                        if ($applyItem->payment) {
                            if ($applyItem->payment->status == 1) {
                                $paciente->payment_status = 1;
                                $paciente->save();
                                return redirect('pagos');
                            } else {
                                $paciente->payment_status = 2;
                                $paciente->save();
                            }
                        }
                    }
                    return redirect('pagos');
                } else {
                    $paciente->payment_status = 0;
                    $paciente->save();
                    return redirect('pagos');
                }
            } else if ($buscarAplication->type_payment == 3) {
                //Por Adelantado
            }


            /* 		foreach ($applyItems as $applyItem) {

				if ($applyItem->payment) {

					if ($pendiente == 0) {

						$payment = $applyItem->payment;

						if ($payment->status == 1 && $payment->type == 0) {

							$pendiente = 1;
						}
					}
				}
			} */



            /* $paciente->save();
			$pendiente = 0; */
            return redirect('pagos');
        }

        return redirect('pagos');
    }
}
