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
        }], 'assign')->where('fecha_atencion', 'like', $buscarFecha . '%')->where('status', 1)->where('doctor_id', $kine)->orderByDesc(function ($query) {
            $query->from('patients')
                ->whereColumn('patients.id', '=', 'apply_items.patient_id')
                ->select('name')
                ->limit(1);
        })->orderBy('fecha_atencion', 'asc')->get();


        $nameUser = $applyItems[0]->doctor->name . ' ' . $applyItems[0]->doctor->last_name;
        $total = $applyItems[0]->sum('price');
        $fechaString = Carbon::parse($applyItems[0]->fecha_atencion);
        $fecha = $fechaString->format('m-Y');
        //dd($nameUser);


        $kineValues = ApplicationTypeUser::where('user_id', $kine)->get();

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


        $kines = User::where('user_type', 'Kine')->get();
        $pacientes = User::where('user_type', 'Paciente')->get();

        //Kines
        foreach ($kines as $kine) {
            $findKine = Doctor::where('user_id', $kine->id)->first();
            if (!$findKine) {
                Doctor::create([
                    'user_id' => $kine->id,
                    'name' => $kine->name,
                    'last_name' => $kine->last_name,
                    'avatar' => $kine->avatar,
                    'rut'  => $kine->rut,
                    'birth'  => $kine->birth,
                    'phone'  => $kine->phone,
                    'address_id'  => $kine->address_id,
                    'status'  => $kine->status,
                ]);
            }

            $newKine = Doctor::where('user_id', $kine->id)->first();
            if ($newKine) {
                $findApplyItems = ApplyItem::where('user_id', $kine->id)->get();
                if (count($findApplyItems) > 0) {
                    foreach ($findApplyItems as $findApplyItem) {
                        $findApplyItem->doctor_id = $newKine->id;
                        $findApplyItem->save();
                    }
                }

                $findApplicationTypeUsers = ApplicationTypeUser::where('user_id', $kine->id)->get();
                if (count($findApplicationTypeUsers) > 0) {
                    foreach ($findApplicationTypeUsers as $typeUser) {
                        $typeUser->doctor_id = $newKine->id;
                        $typeUser->save();
                    }
                }

                $findAAssigns = Assign::where('user_id', $kine->id)->get();
                if (count($findAAssigns) > 0) {
                    foreach ($findAAssigns as $findAAssign) {
                        $findAAssign->doctor_id = $newKine->id;
                        $findAAssign->save();
                    }
                }
            }
        }


        //Pacientes
        foreach ($pacientes as $paciente) {
            $findPaciente = Patient::where('user_id', $paciente->id)->first();
            if (!$findPaciente) {
                Patient::create([
                    'user_id' => $paciente->id,
                    'name' => $paciente->name,
                    'last_name' => $paciente->last_name,
                    'avatar' => $paciente->avatar,
                    'rut'  => $paciente->rut,
                    'birth'  => $paciente->birth,
                    'phone'  => $paciente->phone,
                    'address_id'  => $paciente->address_id,
                    'status'  => $paciente->status,
                    'payment_status'  => $paciente->payment_status,
                    'orden' => 0
                ]);
            }

            $newPaciente = Patient::where('user_id', $paciente->id)->first();

            if ($newPaciente) {

                $findPatientAnswers = Answer::where('user_id', $paciente->id)->get();
                if (count($findPatientAnswers) > 0) {
                    foreach ($findPatientAnswers as $findPatientAnswer) {
                        $findPatientAnswer->patient_id = $newPaciente->id;
                        $findPatientAnswer->save();
                    }
                }

                $findPatientApplications = Application::where('user_id', $paciente->id)->get();
                if (count($findPatientApplications) > 0) {
                    foreach ($findPatientApplications as $findPatientApplication) {
                        $findPatientApplication->patient_id = $newPaciente->id;
                        $findPatientApplication->save();
                        foreach ($findPatientApplication->items as $item) {
                            $item->patient_id = $newPaciente->id;
                            $item->save();
                        }
                    }
                }

                $findKeepers = Keeper::where('user_id', $paciente->id)->get();
                if (count($findKeepers) > 0) {
                    foreach ($findKeepers as $findKeeper) {
                        $findKeeper->patient_id = $newPaciente->id;
                        $findKeeper->save();
                    }
                }
            }
        }

        $newKines = Doctor::all();
        $newPacientes = Patient::all();

        dd($pacientes, $newPacientes, $kines, $newKines);
    }
}
