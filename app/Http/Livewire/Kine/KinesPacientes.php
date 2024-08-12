<?php

namespace App\Http\Livewire\Kine;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PacienteKine;
use Livewire\Component;
use Livewire\WithFileUploads;

class KinesPacientes extends Component
{
    use WithFileUploads;

    public $doctor, $user;
    public $isOpen = false;
    public $file_path;
    public $status = 0;
    public $phoneLength = 0;
    public $pass;
    public $pacientes = [];
    public $selPaciente;
    public $misPacientes = [];
    public $search = '';
    public $error = "";

    protected $listeners = ['success-value' => 'searchByItems'];

    public function render()
    {
        $this->pacientes = Patient::where('status', 1)->where('name', 'like', '%' . $this->search . '%')
            ->orWhere('email', 'like', '%' . $this->search . '%')
            ->get();
        if ($this->search === "") {
            $this->pacientes = [];
        }

        $this->misPacientes = PacienteKine::where('doctor_id', $this->doctor->id)->get();


        return view('livewire.kine.kines-pacientes');
    }

    public function mount(Doctor $doctor)
    {

        if ($doctor) {
            $this->doctor = $doctor;
            $this->user = $doctor->user;
            if ($this->doctor->id) {
                $this->status = 1;
            }
        }
    }

    public function guardarPaciente($id)
    {
        $findPacKIne = PacienteKine::where('doctor_id', $this->doctor->id)->where('patient_id', $id)->first();

        if ($findPacKIne) {
            $this->error = "El paciente ya se encuentra en la lista";
            return;
        } else {
            $this->error = "";
        }

        PacienteKine::create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $id
        ]);
        $this->clear();
    }

    public function quitarPaciente($id)
    {
        $pacKine = PacienteKine::find($id);
        $pacKine->delete();
        $this->clear();
    }

    public function clear()
    {
        $this->search = "";
        $this->error = "";
        $this->pacientes = [];
        $this->dispatchBrowserEvent('swal-success');
    }

    public function openModal()
    {
        $this->isOpen = true;
    }

    public function closeModal()
    {
        $this->isOpen = false;
    }
}
