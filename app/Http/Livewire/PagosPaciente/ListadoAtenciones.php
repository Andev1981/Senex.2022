<?php

namespace App\Http\Livewire\PagosPaciente;

use Livewire\Component;
use App\Models\ApplyItem;
use Carbon\Carbon;
use Livewire\WithPagination;

class ListadoAtenciones extends Component
{
    use WithPagination;
    public $buscarFecha,
        $month = '',
        $year,
        $search,
        $sort = 'updated_at',
        $direction = 'desc',
        $monthName = '',
        $reloadStatus = 0;

    protected $queryString = ['search'];

    public function render()
    {
        if ($this->reloadStatus == 0) {
            $this->buscarFecha = Carbon::now();
            $this->month = $this->buscarFecha->format('m');
            $this->year = $this->buscarFecha->format('Y');
            $this->reloadStatus = 1;
        }
        $this->buscarFecha =  $this->year . '-' . $this->month . '-';

        $applyItems = ApplyItem::where('estado_pago', 1)->where('updated_at', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate('30');


        return view('livewire.pagos-paciente.listado-atenciones', compact('applyItems'));
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

    public function setMonth($month)
    {
        switch ($month) {
            case '01':
                $this->monthName = 'Enero';
                break;
            case '02':
                $this->monthName = 'Febrero';
                break;
            case '03':
                $this->monthName = 'Marzo';
                break;
            case '04':
                $this->monthName = 'Abril';
                break;
            case '05':
                $this->monthName = 'Mayo';
                break;
            case '06':
                $this->monthName = 'Junio';
                break;
            case '07':
                $this->monthName = 'Julio';
                break;
            case '08':
                $this->monthName = 'Agosto';
                break;
            case '09':
                $this->monthName = 'Septiembre';
                break;
            case '10':
                $this->monthName = 'Octubre';
                break;
            case '11':
                $this->monthName = 'Noviembre';
                break;
            case '12':
                $this->monthName = 'Diciembre';
                break;
            default:
                $this->monthName = '';
                break;
        }
    }
}
