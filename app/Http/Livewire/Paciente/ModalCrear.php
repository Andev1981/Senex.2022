<?php

namespace App\Http\Livewire\Paciente;

use App\Models\Address;
use App\Models\Answer;
use App\Models\Comuna;
use App\Models\Patient;
use App\Models\Region;
use App\Models\User;
use Livewire\Component;
use Livewire\WithFileUploads;

class ModalCrear extends Component
{
    use WithFileUploads;

    public $open = 'hidden';
    public $name = "";
    public $last_name = "";
    public $telefono = "";
    public $correo = "";
    public $rut = "";
    public $fecha_nacimiento;
    public $file_path,
    $paises = [],
           $pais = "",
           $region = 1,
           $comuna,
           $calle = "",
           $numero,
           $detalle_direccion = "";


    protected $rules = [
        'name' => 'required|min:3|max:50',
        'last_name' => 'required|min:3|max:50',
        'telefono' => 'required|min:9|max:9',
        'correo' => 'required|email|unique:users,email|min:10|max:200',
        'calle' => 'required|max:150',
        'fecha_nacimiento' => 'required|date',
        'rut' => 'required|max:10|min:9',
        'numero' => 'required|integer',
        'detalle_direccion' => 'required|max:150',
        'comuna' => 'required',
    ];

    public function render()
    {
        $regiones = Region::where('id',1)->get();
        $comunas = Comuna::where('region_id',1)->get();
        
        return view('livewire.paciente.modal-crear', compact('regiones','comunas'));
    }


    public function save(){

             $this->validate();

            
            $address = Address::create([
                'street' => $this->calle,
                'number' => $this->numero,
                'address' => $this->detalle_direccion,
                'comuna_id' => $this->comuna,
            ]);

             $patient = Patient::create([
                'user_id' => 0,
                'name' => $this->name ,
                'last_name' => $this->last_name,
                'email' => $this->correo,
                'phone' => $this->telefono,
                'birth' => $this->fecha_nacimiento,
                'rut' => $this->rut,
                'address_id' => $address->id,
                'status' => 1,
                'payment_status' => 3,
             ]);

            $this->cargaRespuestasBase($patient);

             $this->emit('success');
             $this->dispatchBrowserEvent('swal-success');

             $this->clear();
             $this->open = 'hidden';

         }

         public function clear(){
             $this->resetValidation();
             $this->resetErrorBag();
             $this->reset(['name','last_name','correo','telefono','fecha_nacimiento','rut']);
         }


         public function cargaRespuestasBase($patient){
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 1]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 2]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 3]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 4]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 5]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 6]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 7]
            );
            Answer::create([
                'user_id' => 0,
                'patient_id' => $patient-> id,
                'question_id' => 8]
            );
         }
        

}
