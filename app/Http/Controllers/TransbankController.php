<?php

namespace App\Http\Controllers;

use App\Models\Attention;
use Illuminate\Http\Request;
use Transbank\Webpay\WebpayPlus;
use Transbank\Webpay\WebpayPlus\Transaction;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\Solicitud;

class TransbankController extends Controller
{
    public function __construct(){

        if( app()->environment('production')){
            WebpayPlus::configureForProduction(
                env('webpay_plus_cc'),
                env('webpay_plus_api_key')
            );
        } else {
            WebpayPlus::configureForTesting();
        }
    }

    public function iniciarCompra(Request $request){

        $attention = Solicitud::find($request->attention_id);

        $nueva_compra = new Payment();
        $nueva_compra->session_id = session()->getId();
        $nueva_compra->user_id = auth()->user()->id;
        $nueva_compra->status = 0;
        /* $nueva_compra->total = $attention->solicitud_type->price; */
        $nueva_compra->total = $attention->solicitud_type->price;
        $nueva_compra->schedule_id = $request->agenda;
        $nueva_compra->save();
        $url_to_pay = self::start_web_pay_plus_transaction($nueva_compra);


        $attention->payment_id = $nueva_compra->id;
        $attention->save();

        return redirect($url_to_pay);

    }

    static function start_web_pay_plus_transaction($nueva_compra){

        $transaccion = (new Transaction)->create(
            $nueva_compra->id,
            $nueva_compra->session_id,
            $nueva_compra->total,
            route('confirmar.pago')

        );

        $url = $transaccion->getUrl().'?token_ws='.$transaccion->getToken();

        return $url;
    }

    public function confirmar_pago(Request $request){


        if($request->get('token_ws') == null){
            $idcompra = $request->get('TBK_ORDEN_COMPRA');
            $compra = Payment::find($idcompra);
            $compra->status = 3;
            $compra->update();
            return redirect()->route('pago.fallido');
        }

        $confirmacion = (new Transaction)->commit( $request->get('token_ws') );

        $compra = Payment::where('id', $confirmacion->buyOrder)->first();

        if($confirmacion->isApproved())
        {
            $agenda = Schedule::find($compra->schedule_id);
            $agenda->quantity_usage++;
            $agenda->update();

            $compra->status = 2;
            $compra->update();
            return redirect()->route('pago.ok',[$compra->id]);
        }
        else
        {
            $idcompra = $request->get('TBK_ORDEN_COMPRA');
            $compra = Payment::find($idcompra);
            $compra->status = 3;
            $compra->update();
            return redirect()->route('pago.fallido');

        }

    }


    public function pago_ok($id_transaccion)
    {
        $detalle = Payment::where('id', $id_transaccion)->first();
        //dd($detalle);

        if($detalle){
            return view('pago.ok', compact('detalle'));
        }else{
            return view('errors.403');
        }

    }

    public function pago_fallido()
    {
        return view('pago.fallido');
    }
}
