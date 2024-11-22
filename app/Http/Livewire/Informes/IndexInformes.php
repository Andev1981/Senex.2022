<?php

namespace App\Http\Livewire\Informes;

use App\Models\ApplicationTypeUser;
use App\Models\ApplyItem;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Livewire\Component;

class IndexInformes extends Component
{
    public $isOpen = false;
    public $kine;
    public $user;
    public $year;
    public $month;
    public $statusFindView = -1;
    public $statusFind = [0, 1, 2, 3];
    public $status = 0;
    public $file_path;
    public $applyItems = [];
    public $buscarFecha;
    public $buscarFechaIn;
    public $kineValues;
    public $totalPacientes = 0;
    public $totalKine = 0;
    public $pacientes = [];
    public $selPaciente;

    public function render()
    {
        return view('livewire.informes.index-informes');
    }

    public function mount(Doctor $doctor)
    {

        $this->kine = $doctor;
        if ($this->kine->id) {
            $this->status = 1;
        }

        $this->pacientes = Patient::where('status', 1)->orderBy('name', 'asc')->get();
        $this->buscarFecha = Carbon::now();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');
        $this->searchByItems();
    }

    public function searchByItems()
    {

        $this->totalKine = 0;
        $this->totalPacientes = 0;

        $this->buscarFecha =  $this->year . '-' . $this->month;

        if ($this->selPaciente != 0) {
            $this->applyItems = ApplyItem::with(['patient' => function ($query) {
                $query->orderBy('name', 'asc');
            }], 'application', 'doctor')
                /*     ->where('doctor_id', $this->kine->id)
                ->where('patient_id', $this->selPaciente) */
                ->where('status', 1)
                ->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderByDesc(function ($query) {
                    $query->from('patients')
                        /* ->whereColumn('patients.id', '=', 'apply_items.patient_id') */
                        ->select('name')
                        ->limit(1);
                })->orderBy('fecha_atencion', 'asc')->get();
        } else {
            $this->applyItems = ApplyItem::with(['patient' => function ($query) {
                $query->orderBy('name', 'asc');
            }], 'application', 'doctor')
                /*     ->where('doctor_id', $this->kine->id) */
                ->where('status', 1)
                ->where('fecha_atencion', 'like', $this->buscarFecha . '%')->orderByDesc(function ($query) {
                    $query->from('patients')
                        /* ->whereColumn('patients.id', '=', 'apply_items.patient_id') */
                        ->select('name')
                        ->limit(1);
                })->orderBy('fecha_atencion', 'asc')->get();
        }



        $this->kineValues = ApplicationTypeUser::where('user_id', $this->kine->id)->get();

        foreach ($this->applyItems as $applyItem) {
            $this->totalPacientes += $applyItem->price;

            foreach ($applyItem->doctor->applyTypes as $kineValue)
                if ($kineValue->application_type_id == $applyItem->application_type_id) {
                    $this->totalKine += $kineValue->price;
                }
        }
    }
}
