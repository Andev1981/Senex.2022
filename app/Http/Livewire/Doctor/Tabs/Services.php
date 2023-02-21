<?php

namespace App\Http\Livewire\Doctor\Tabs;

use App\Models\Price;

use App\Models\Doctor;
use Livewire\Component;

use App\Models\Solicitud;
use App\Models\SolicitudType;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Request;

class Services extends Component
{
    public $fecha;
    public $doctor;
    public $services;
    public $open = '';
    public $openEdit = '';
    public $open2 = '';
    public $service = '';
    public $name;
    public $description;
    public $price;
    public $errores;
    public $precio;
    public $mensaje = '';
    


    public $selectedOrder = [];
 

    public function mount($doctor){


        $this->fecha = Carbon::now();
        $this->doctor = Doctor::find($doctor->id);
        $this->services = SolicitudType::all();
        
     
       
    }

    public function render()
    {
        return view('livewire.doctor.tabs.services');
    }

    public function abrir(){
        $this->open = true;
    }
    public function abrirAsignar(){
        $this->open2 = true;
    }

    public function cerrar(){
        
        $this->open = "";
        $this->open2 = "";
        $this->fecha = Carbon::now();
        $this->name = "";
        $this->description = "";
        $this->price = "";
        $this->openEdit = '';
        $this->errores = '';
        $this->service = '';
    }

    public function show($id){

        
        
        $this->openEdit = true;
        $this->price = Price::find($id);
        $this->name = $this->price->solicitudType->name;
        $this->description = $this->price->solicitudType->description;
        $this->precio = $this->price->precio;
        
    }

    public function update(){

        $this->price->precio = $this->precio;
        $this->price->save();
        $this->cerrar();
        $this->mount($this->doctor);
    }

    public function save(){
       $solicitud = SolicitudType::create([
                'name' => $this->name,
                'description' => $this->description,
            ]);
        $this->mount($this->doctor);
        $this->cerrar();
    
    }


    public function asignar(){
       
      

        $valor = $this->doctor->prices()->where('solicitud_type_id',$this->service)->first();
        if($valor){
           $this->mensaje = 'Servicio ya esta asignado al doctor' ;
           return ;
        }
        Price::create([
            'precio' => $this->precio,
            'doctor_id' => $this->doctor->id,
            'solicitud_type_id' => $this->service
         ]);
         $this->mount($this->doctor);
         $this->cerrar();
     
     }


       

}
