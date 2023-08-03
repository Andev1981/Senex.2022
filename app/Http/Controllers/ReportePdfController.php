<?php

namespace App\Http\Controllers;

use App\Models\ApplyItem;
use Illuminate\Http\Request;
use Dompdf\Dompdf;

class ReportePdfController extends Controller
{
     public function generarReporte($buscarFecha, $kine)
    {

         // Crear una instancia de DOMPDF
        $dompdf = new Dompdf();

        // Obtener los datos
        $applyItems = ApplyItem::with('assign')
                    ->where('fecha_atencion', 'like', $buscarFecha.'%')
                    ->where('status',1)->where('user_id', $kine)
                    ->latest('id')
                    ->get();
       

        // Renderizar la vista y obtener su contenido
        $html = view('reporte-pdf')->with('applyItems',$applyItems)->render();

        // Cargar el contenido HTML en DOMPDF
        $dompdf->loadHtml($html);

   /*      // Configurar DOMPDF
        $dompdf->setPaper('A4', 'portrait'); */

        // Generar el archivo PDF y enviarlo al navegador
        $dompdf->stream('reporte-pdf.pdf');
    }
}
