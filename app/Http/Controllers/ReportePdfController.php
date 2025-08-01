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
        $applyItems = ApplyItem::with(['patient', 'assign', 'doctor'])
            ->where('fecha_atencion', 'like', $buscarFecha . '-%')
            ->where('status', 1)
            ->where('doctor_id', $kine)
            ->orderBy('fecha_atencion', 'asc')
            ->get();

        $kineFinded = Doctor::find($kine);
        $nameUser = $kineFinded ? ($kineFinded->name . ' ' . $kineFinded->last_name) : '--';

        //$total = $applyItems->sum('price');
        $fecha = Carbon::parse($applyItems->first()->fecha_atencion ?? now())->format('m-Y');

        $kineValues = ApplicationTypeUser::where('user_id', $kine)->get();
        $kineValuesMap = $kineValues->pluck('price', 'application_type_id');

        $this->totalKine = $applyItems->sum(function ($item) use ($kineValuesMap) {
            return $kineValuesMap[$item->application_type_id] ?? 0;
        });

        $pdf = Pdf::loadView('pdf.reporte', [
            'applyItems' => $applyItems,
            'nameUser' => $nameUser,
            'fecha' => $fecha,
            'totalKine' => $this->totalKine,
            'kineValues' => $kineValues
        ]);

        $this->totalKine = 0;

        return $pdf->download(rand(1, 1000) . '-Reporte-Mensual-Atenciones.pdf');
    }

    public $totalPacientes = 0;

    public function generarReporteGeneral($buscarFecha, $selTipo)
    {

        $this->totalPacientes = 0;
        $this->totalKine = 0;

        // Relaciones con carga anticipada optimizada
        $relations = [
            'patient' => fn($q) => $q->orderBy('name', 'asc'),
            'application',
            'doctor.applyTypes'
        ];

        // Base de la consulta
        $query = ApplyItem::with($relations)
            ->where('status', 1)
            ->where('fecha_atencion', 'like', $buscarFecha . '%');

        if ($selTipo > 0) {
            $query->where('application_type_id', $selTipo);
        }

        // Evitamos subquery innecesaria en orderByDesc
        $applyItems = $query->orderBy('fecha_atencion', 'asc')->get();

        // Validación para evitar errores si está vacío
        if ($applyItems->isEmpty()) {
            return response()->json(['error' => 'No se encontraron datos para el PDF.'], 404);
        }

        // Cálculo de totales de manera eficiente
        foreach ($applyItems as $applyItem) {
            $this->totalPacientes += $applyItem->price;

            foreach ($applyItem->doctor->applyTypes as $kineValue) {
                if ($kineValue->application_type_id == $applyItem->application_type_id) {
                    $this->totalKine += $kineValue->price;
                }
            }
        }

        // Total directo desde la colección
        $total = $applyItems->sum('price');

        // Parseo seguro de la fecha
        $fecha = Carbon::parse($applyItems->first()->fecha_atencion)->format('m-Y');

        // Generación del PDF
        $pdf = Pdf::loadView('pdf.reporte-all', [
            'total' => $total,
            'applyItems' => $applyItems,
            'fecha' => $fecha,
            'totalKine' => $this->totalKine,
            'totalPacientes' => $this->totalPacientes
        ]);

        // Descargar PDF
        return $pdf->download(rand(1, 1000) . '-Reporte-Mensual-Atenciones.pdf');
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
