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
        $applyItems = ApplyItem::where('application_type_id','<>', null)->get();
        $assigns = Assign::all();

        dd($applyItems);

        foreach($kines as $kine){

            $kineSearch1 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type_id',1)->first();
            if(!$kineSearch1){
                ApplicationTypeUser::create([
                    'user_id' => $kine->id,
                    'application_type_id' => 1,
                    'price' => 0,
                ]);
            }

            $kineSearch2 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type_id',2)->first();
            if(!$kineSearch2){
                ApplicationTypeUser::create([
                    'user_id' => $kine->id,
                    'application_type_id' => 2,
                    'price' => 0,
                ]);
            }
            
            
            $kineSearch3 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type_id',3)->first();
            if(!$kineSearch3){
                ApplicationTypeUser::create([
                    'user_id' => $kine->id,
                    'application_type_id' => 3,
                    'price' => 0,
                ]);
            }
            
            $kineSearch4 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type_id',4)->first();
            if(!$kineSearch4){
                ApplicationTypeUser::create([
                    'user_id' => $kine->id,
                    'application_type_id' => 4,
                    'price' => 0,
                ]);
            }

            $kineSearch5 = ApplicationTypeUser::where('user_id',$kine->id)->where('application_type_id',5)->first();
            if(!$kineSearch5){
                ApplicationTypeUser::create([
                    'user_id' => $kine->id,
                    'application_type_id' => 5,
                    'price' => 0,
                ]);
            }

            
            
        }

         $secondkines = User::where('user_type','Kine')->get();

        foreach($applyItems as $applyItem){
            $findAssigns = ApplicationTypeUser::where('user_id',$applyItem->user_id)->get();
            dd($applyItem, $applyItem->applicationTypeUser);
        }

        dd($kines);
    }
}
