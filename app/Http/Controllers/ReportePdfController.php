<?php

namespace App\Http\Controllers;

use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Doctor;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use ZipArchive;

class ReportePdfController extends Controller
{
    public $totalKine = 0;

    public function generarReporte($buscarFecha, $kine)
    {

        // Obtener los datos
        /*  $applyItems = ApplyItem::with(['patient', 'assign', 'doctor'])
            ->where('fecha_atencion', 'like', $buscarFecha . '-%')
            ->where('status', 1)
            ->where('doctor_id', $kine)
            ->orderBy('fecha_atencion', 'asc')
            ->get(); */

        $applyItems = ApplyItem::with(['patient', 'assign', 'doctor' => function ($q) {
            $q->orderBy('name', 'asc')->orderBy('last_name', 'asc');
        }])
            ->where('fecha_atencion', 'like', $buscarFecha . '-%')
            ->where('status', 1)
            ->where('doctor_id', $kine)
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

        $relations = [
            'patient' => fn($q) => $q->orderBy('name', 'asc'),
            'applicationType',
            'doctor.applyTypes'
        ];

        $query = ApplyItem::with($relations)
            ->where('status', 1)
            ->where('fecha_atencion', 'like', $buscarFecha . '%');

        if ($selTipo > 0) {
            $query->where('application_type_id', $selTipo);
        }

        $applyItems = $query->orderBy('fecha_atencion', 'asc')->get();

        if ($applyItems->isEmpty()) {
            return response()->json(['error' => 'No se encontraron datos.'], 404);
        }

        // Base64 del logo
        $logoPath = public_path('img/logo-cabecera.png');
        $logo = file_exists($logoPath) ? base64_encode(file_get_contents($logoPath)) : null;

        // Preparar carpeta temporal
        $tempDir = storage_path('app/pdf_chunks');
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        // Dividir en partes de 100
        $chunks = $applyItems->chunk(350);
        $chunkIndex = 1;
        $pdfFiles = [];

        foreach ($chunks as $chunk) {
            $totalPacientes = 0;
            $totalKine = 0;

            foreach ($chunk as $item) {
                $kinePrice = 0;
                foreach ($item->doctor->applyTypes as $kineValue) {
                    if ($kineValue->application_type_id == $item->application_type_id) {
                        $kinePrice = $kineValue->price;
                        break;
                    }
                }
                $item->kine_price = $kinePrice;
                $item->saldo_senex = $item->price - $kinePrice;

                $totalPacientes += $item->price;
                $totalKine += $kinePrice;
            }

            $fecha = Carbon::parse($chunk->first()->fecha_atencion)->format('m-Y');

            $pdf = Pdf::loadView('pdf.reporte-all', [
                'applyItems' => $chunk,
                'fecha' => $fecha,
                'totalPacientes' => $totalPacientes,
                'totalKine' => $totalKine,
                'total' => $chunk->sum('price'),
                'logo' => $logo
            ]);

            $filename = "reporte-parte-{$chunkIndex}.pdf";
            $filePath = $tempDir . '/' . $filename;
            $pdf->save($filePath);
            $pdfFiles[] = $filePath;
            $chunkIndex++;
        }

        // Crear ZIP
        $zipFileName = 'reporte-atenciones-' . now()->format('Ymd_His') . '.zip';
        $zipPath = storage_path("app/{$zipFileName}");
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
            foreach ($pdfFiles as $file) {
                $zip->addFile($file, basename($file));
            }
            $zip->close();
        }

        // Limpiar PDFs temporales
        File::deleteDirectory($tempDir);

        return response()->download($zipPath)->deleteFileAfterSend(true);
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
