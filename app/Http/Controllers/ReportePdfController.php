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

    public function arreglo(){

        $kines = User::where('user_type','Kine')->get();
        $applicationTypeUsers = ApplicationTypeUser::all();
        $applicationTypes = ApplicationType::all();
        $applyItems = ApplyItem::all();
        $assigns = Assign::all();

        dd($kines, $applicationTypeUsers,$applicationTypes,$applyItems,$assigns[0]);

        foreach($kines as $kine){
            $kineSearch1 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type',1)->first();

            if(!$kineSearch1){
                ApplicationTypeUser::create([

                ]);
            }

            $kineSearch2 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type',2)->first();
            $kineSearch3 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type',3)->first();
            $kineSearch4 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type',4)->first();
            $kineSearch5 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type',5)->first();
            
        }

        dd($kines);
    }
}
