<?php

namespace App\Http\Livewire\Recetas\Tabs;

use Livewire\Component;
use App\Models\Prescription;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendPrescription;
use App\Models\Sesion;
use Illuminate\Support\Carbon;

class Fourth extends Component
{
    public $recetas;
    public $recetaVer;
    public $recetaEdit;
    public $solicitud;
    public $open= false;
    public $openTwo = false;
    public $crear = false;
    public $enviar = false;

    public $repetir = false;
    public $repetirEdit = false;
    public $veces;
    public $detalle;
    public $editMessage;
    public $editRepeat;
    public $editRange;
    public $editState;
    public $correoEnviar;
    public $fecha_atencion;
    public $sesion_id;
    public $pago;
    public $fecha_pago;


    protected $rules = [
        'recetaEdit.*' => 'required',
    ];


    public function mount($solicitud){

        $this->sesiones = Sesion::where('solicitud_id',$solicitud->id)->get();

        $this->solicitud = $solicitud;

    }

    public function render()
    {
        return view('livewire.recetas.tabs.fourth');
    }


    public function edit(Sesion $sesion){

        
        $this->fecha_atencion = Carbon::parse($sesion->fecha_session)->format('Y-m-d');
        //dd($this->solicitud->solicitud_type->price->precio, $this->fecha_atencion);
        $this->comentario = $sesion->comentario;
        $this->estado = $sesion->estado;
        $this->sesion_id = $sesion->id;
        $this->open = true;
        $this->openTwo = ''; 
    }

    public function visualizar(Sesion $receta){
        
        
        $this->recetaVer = $receta;
        $this->openTwo = true;
       
    }

    public function cerrar(){
        $this->open = '';
        $this->openTwo = '';
        $this->crear = '';
        $this->enviar = '';
    }

    public function create(){
        $this->crear = true;
    }

    public function update(){

        $sesion = Sesion::find($this->sesion_id);
        $sesion->comentario = $this->comentario;
        $sesion->fecha_session = $this->fecha_atencion;
        $sesion->estado = $this->estado;
       
        $success = $sesion->save();

        if($success){
            $this->dispatchBrowserEvent('toast:success',[
                'message' => 'Receta actualizada correctamente'
            ]);
        }else{
            $this->dispatchBrowserEvent('toast:error',[
                'message' => 'Problemas al intentar actualizar el registro'
            ]);
        }
         $this->cerrar();

         $this->mount($this->solicitud);
    }

    public function enviar(Prescription $receta){

        $this->emailEnviar = $this->solicitud->patient->user->email;
        $this->receta = $receta;
        $this->enviar = true;


    }

    public function enviarReceta(){


        Mail::to($this->emailEnviar)->send(new SendPrescription($this->receta));

/*         Mail::send('emails.order', $data, function ($message) use ($data, $pdf) {
            $message->to($this->emailEnviar)
            ->subject("Receta Dermalink")
                ->attachData($pdf->output(), "receta-dermalink.pdf");
        }); */

        $rec = Prescription::find($this->receta->id);
        $rec->sends++;
        $rec->save();

        $this->cerrar();
        $this->mount($this->solicitud);

    }
}
