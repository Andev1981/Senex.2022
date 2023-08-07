<?php
namespace App\Http\Controllers;

use App\Models\ApplyItem;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportePdfController extends Controller
{
   
     public function generarReporte($buscarFecha, $kine)
    {


        // Obtener los datos
        $applyItems = ApplyItem::with('assign')
                    ->where('fecha_atencion', 'like', $buscarFecha.'%')
                    ->where('status',1)->where('user_id', $kine)
                    ->latest('id')
                    ->get();
        

        $nameUser = $applyItems[0]->user->name . ' ' . $applyItems[0]->user->last_name;
        $total = $applyItems[0]->sum('price');
        $fechaString = Carbon::parse($applyItems[0]->fecha_atencion);
        $fecha = $fechaString->format('d/m/Y');
        //dd($nameUser);
       
       $pdf = Pdf::loadView('pdf.reporte',['applyItems' => $applyItems,'total' => $total,'nameUser' => $nameUser,'fecha' => $fecha]);

       return $pdf->download(rand(1,1000) .'-reporte-' . $nameUser . '.pdf');


    }
}
