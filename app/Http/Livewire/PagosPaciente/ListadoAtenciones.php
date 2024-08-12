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
        $direction = 'desc';

    protected $queryString = ['search'];

    public function render()
    {
        $this->buscarFecha = Carbon::now();
        $this->month = $this->buscarFecha->format('m');
        $this->year = $this->buscarFecha->format('Y');
        $this->buscarFecha =  $this->year . '-' . $this->month . '-';

        $applyItems = ApplyItem::where('status', 1)->where('updated_at', 'like', $this->buscarFecha . '%')->orderBy($this->sort, $this->direction)->paginate('10');


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
}
