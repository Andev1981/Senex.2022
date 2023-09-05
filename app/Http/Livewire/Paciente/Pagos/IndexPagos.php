<?php

namespace App\Http\Livewire\Paciente\Pagos;

use App\Models\Application;
use App\Models\ApplyItem;
use App\Models\PaymentIncome;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class IndexPagos extends Component
{
    use WithPagination;
    public User $paciente;
    public $search;
    protected $queryString = ['search'];
    public $sort = 'updated_at';
    public $direction = 'desc';
    public $totalAtenciones = 0;
    public $countSuma = 0;
    public $totalAtendidas = 0;
    public $type = 1;
    public $itemsSuma = 0;

    protected $listeners = ['update-payment' => 'render'];

    public function mount(User $paciente){
        $this->paciente = $paciente;
        
    }

    public function render()
    {
         $applications = Application::where('user_id', $this->paciente->id)->orderBy($this->sort, $this->direction)->paginate(5);
        $this->totalAtenciones = 0;
        $this->totalAtendidas = 0;
        $this->countSuma = 0;
        $this->itemsSuma = 0;
        foreach($applications as $application){
            $countSuma = ApplyItem::where('application_id',$application->id)->where('status',1)->get();
            $this->countSuma += count($countSuma);
            $itemsSuma = PaymentIncome::where('application_id',$application->id)->get();
            $this->itemsSuma += count($itemsSuma);
            foreach($itemsSuma as $suma){
               $this->totalAtenciones += $suma->pay;
            }
            foreach($countSuma as $suma){
               $this->totalAtendidas += $suma->price;
            }
        }
        return view('livewire.paciente.pagos.index-pagos',['applications' => $applications, 'totalAtenciones' => $this->totalAtenciones]);
    }
}
