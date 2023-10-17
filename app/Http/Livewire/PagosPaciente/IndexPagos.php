<?php

namespace App\Http\Livewire\PagosPaciente;

use App\Models\ApplyItem;
use App\Models\Patient;
use Barryvdh\Debugbar\Twig\Extension\Dump;
use Livewire\Component;
use Livewire\WithPagination;

class IndexPagos extends Component
{
    use WithPagination;
    public $selectedPaciente;
    public $search;
    protected $listeners = ['success' => 'render','success-paciente' => 'render'];
    protected $queryString = ['search'];
    public $sort = 'payment_status';
    public $direction = 'asc';
    public $openDelPaciente = 'hidden';
    public $quantity = 10;

    public function updatingSearch()
    {
        $this->resetPage();
    }


    public function render()
    {

        $allPacientes = Patient::with('applyItems')->get();

        foreach($allPacientes as $paciente){
             $applyItems = ApplyItem::where('patient_id',$paciente->id)->where('status',1)->get();
            $pendiente = 0;
            foreach($applyItems as $applyItem){

                if(auth()->user()->email == "javt1981@gmail.com"){
                    if($paciente->id == 51){

                        dump('Payment => '.$applyItem->payment);
                    }
                }
                
                if( $applyItem->payment ){
                
                    if($pendiente == 0){
                
                        $payment = $applyItem->payment;

                        if($payment->status == 1){

                            $pendiente = 1;
                        }
                    }
                }
            }
       
            
            if(count($applyItems) > 0){
                if($pendiente == 1){
                    $paciente->payment_status = 1;
                }else{
                    $paciente->payment_status = 2;
                }
            }else{
                    $paciente->payment_status = 3;
            }
            
            $paciente->save();
            $pendiente = 0;
        }
            

      

        $pacientes = Patient::where(function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')->orWhere('last_name', 'like', '%' . $this->search . '%');
            })->orderBy($this->sort, $this->direction)->paginate($this->quantity);

        return view('livewire.pagos-paciente.index-pagos', compact('pacientes'));
    }

    public function order($sort)
    {
        if ($this->sort === $sort) {

            if ($this->direction === 'desc') {
                $this->direction = 'asc';
            } else {
                $this->direction = 'desc';
            }
        } else {
            $this->sort = $sort;
        }
    }

    public function openDeleteModal($paciente){
        $this->selectedPaciente ='';
        $this->selectedPaciente = $paciente;
        $this->openDelPaciente = '';
    }

    public function deletePaciente(){
        $pacienteDel = Patient::find($this->selectedPaciente['id']);
        $pacienteDel->delete();
        $this->openDelPaciente = 'hidden';
    }
}
