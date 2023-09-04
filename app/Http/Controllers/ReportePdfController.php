<?php
namespace App\Http\Controllers;

use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportePdfController extends Controller
{
    public $totalKine = 0;
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
        $fecha = $fechaString->format('F Y');
        //dd($nameUser);
       

        $kineValues = ApplicationTypeUser::where('user_id',$kine)->get();

            foreach($applyItems as $applyItem){

                foreach ($kineValues as $kineValue)
                        if($kineValue->application_type_id == $applyItem->application_type_id){
                            $this->totalKine += $kineValue->price;
                        }
            }    
       $pdf = Pdf::loadView('pdf.reporte',['applyItems' => $applyItems,'total' => $total,'nameUser' => $nameUser,'fecha' => $fecha,'totalKine' => $this->totalKine,'kineValues' => $kineValues]);

       return $pdf->download(rand(1,1000) .'-reporte-' . $nameUser . '.pdf');

    }

    public function arreglo(){

      
    }
}
