<?php

namespace App\Http\Livewire\Sesiones;

use App\Models\ApplyItem;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Livewire\Component;
use Livewire\WithPagination;

class ListadoSesiones extends Component
{
    use WithPagination;
    public $buscarFecha;
    public $year;
    public $month;
    public $pacientes = [];
    public $selPaciente;
    public $kines = [];
    public $selKine;
    protected $listeners = ['success-item-single' => 'render', 'success' => 'render', 'success-item' => 'render', 'success-atencion' => 'render'];
    public $sort = 'created_at';
    public $direction = 'desc';
    public $reloadStatus = 0;
    public $quantity = 10;
    public $dias = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    public $dia = 0;

    public function render()
    {
        if ($this->reloadStatus == 0) {
            $this->buscarFecha = Carbon::now();

            $this->pacientes = Patient::select('id', 'name', 'last_name')
                ->orderBy('name', 'asc')
                ->get();

            $this->kines = Doctor::select('id', 'name', 'last_name')
                ->where('status', 1)
                ->orderBy('name', 'asc')
                ->get();

            $this->month = $this->buscarFecha->format('m');
            $this->year = $this->buscarFecha->format('Y');
            $this->reloadStatus = 1;
        }

        // Fecha base según el filtro
        $fechaBase = Carbon::createFromDate($this->year, $this->month, $this->dia ?: 1);

        // Construcción del query
        $query = ApplyItem::select(
            'apply_items.id',
            'apply_items.status',
            'apply_items.created_at',
            'patients.name as patient_name',
            'patients.last_name as patient_last_name',
            'doctors.name as doctor_name',
            'doctors.last_name as doctor_last_name',
            'application_types.name as type_name',
            'apply_items.price',
            'apply_items.fecha_atencion',
            'apply_items.numero_sesion',
        )
            ->join('patients', 'patients.id', '=', 'apply_items.patient_id')
            ->join('doctors', 'doctors.id', '=', 'apply_items.doctor_id')
            ->join('applications', 'applications.id', '=', 'apply_items.application_id')
            ->join('application_types', 'application_types.id', '=', 'apply_items.application_type_id')
            ->where('apply_items.status', 1);

        // Filtro de paciente
        if ($this->selPaciente) {
            $query->where('apply_items.patient_id', $this->selPaciente);
        }

        // Filtro de kinesiólogo
        if ($this->selKine) {
            $query->where('apply_items.doctor_id', $this->selKine);
        }

        // Filtro de fecha_atencion
        if ($this->dia == 0) {
            // Mes completo
            $query->whereBetween('apply_items.fecha_atencion', [
                $fechaBase->copy()->startOfMonth()->toDateString(),
                $fechaBase->copy()->endOfMonth()->toDateString()
            ]);
        } else {
            // Día exacto
            $query->whereDate('apply_items.fecha_atencion', $fechaBase->toDateString());
        }

        // Orden y paginación
        $applyItems = $query->orderBy($this->sort, $this->direction)
            ->paginate($this->quantity);

        dd($applyItems[100]);

        return view('livewire.sesiones.listado-sesiones', compact('applyItems'));
    }
}

/* JBRAVO@UDD.CL */
/*  19610462 */