<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Application;
use App\Models\ApplicationType;
use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Assign;
use App\Models\Doctor;
use App\Models\Keeper;
use App\Models\Patient;
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
        $applyItems = ApplyItem::with(['patient' => function ($query) {
            $query->orderBy('name', 'asc');
        }], 'assign')->where('fecha_atencion', 'like', $buscarFecha . '-%')->where('status', 1)->where('doctor_id', $kine)->orderByDesc(function ($query) {
            $query->from('patients')
                ->whereColumn('patients.id', '=', 'apply_items.patient_id')
                ->select('name')
                ->limit(1);
        })->orderBy('fecha_atencion', 'asc')->get();

        $kine = User::find($kine);

        if ($kine != null) {

            $nameUser = $applyItems[0]->doctor->name . ' ' . $applyItems[0]->doctor->last_name;
        } else {

            $nameUser = "--";
        }
        $total = $applyItems[0]->sum('price');
        $fechaString = Carbon::parse($applyItems[0]->fecha_atencion);
        $fecha = $fechaString->format('m-Y');
        //dd($nameUser);


        $kineValues = ApplicationTypeUser::where('user_id', $kine->id)->get();

        foreach ($applyItems as $applyItem) {

            foreach ($kineValues as $kineValue)
                if ($kineValue->application_type_id == $applyItem->application_type_id) {
                    $this->totalKine += $kineValue->price;
                }
        }
        $pdf = Pdf::loadView('pdf.reporte', ['applyItems' => $applyItems, 'nameUser' => $nameUser, 'fecha' => $fecha, 'totalKine' => $this->totalKine, 'kineValues' => $kineValues]);

        $this->totalKine = 0;

        return $pdf->download(rand(1, 1000) . '-Reporte-Mensual-Atenciones' . $nameUser . '.pdf');
    }





    public function arreglo()
    {

        $applyItem = ApplyItem::all();

        //Kines
        foreach ($applyItem as $kine) {

            $kine->doctor_id = $kine->user_id;
            $kine->save();
        }


        dd('Tarea Completada');
    }
}
