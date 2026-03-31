<?php

namespace App\Http\Livewire\Informes;

use App\Models\ApplicationType;
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
    public $status = 0;

    public $file_path;
    public $applyItems = [];
    public $buscarFecha;
    public $kineValues = [];

    public $totalPacientes = 0;
    public $totalKine = 0;

    public $pacientes = [];
    public $selPaciente;
    public $tipos = [];
    public $selTipo = 0;

    public function mount(Doctor $doctor)
    {
        $this->kine = $doctor;
        $this->status = $this->kine->id ? 1 : 0;

        $this->tipos = ApplicationType::all();
        $this->pacientes = Patient::active()->orderBy('name')->get(); // scopeActive()
        $this->buscarFecha = Carbon::now();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');

        $this->searchByItems();
    }

    public function render()
    {
        return view('livewire.informes.index-informes');
    }

    public function searchByItems()
    {
        $this->buscarFecha = $this->year . '-' . $this->month;

        // Base query
        $query = ApplyItem::with(['patient:id,name,last_name', 'applicationType:id,name', 'doctor:id,name,last_name', 'doctor.applyTypes'])
            ->where('status', 1)
            ->where('fecha_atencion', 'like', $this->buscarFecha . '%');

        // Filtro por tipo si aplica
        if ($this->selTipo > 0) {
            $query->where('application_type_id', $this->selTipo);
        }

        $this->applyItems = $query
            ->orderBy('fecha_atencion', 'asc')
            ->get();

        // Traer precios de kinesiólogo
        $this->kineValues = ApplicationTypeUser::where('user_id', $this->kine->id)->get()->keyBy('application_type_id');

        // Calcular totales sin doble foreach
        $applyItemsCollection = collect($this->applyItems);
        $this->totalPacientes = $applyItemsCollection->sum('price');

        $this->totalKine = $applyItemsCollection->reduce(function ($carry, $item) {
            $kinePrice = $item->doctor->applyTypes->firstWhere('application_type_id', $item->application_type_id)?->price ?? 0;
            return $carry + $kinePrice;
        }, 0);
    }
}
