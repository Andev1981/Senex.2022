<?php

namespace App\Http\Livewire\Kinesiologos;

use App\Models\ApplyItem;
use App\Models\Patient;
use Livewire\Component;

class AtencionDetalle extends Component
{
    public $applyItem, $isOpen = false, $isOpenDelete = false;

    public function render()
    {
        return view('livewire.kinesiologos.atencion-detalle');
    }

    public function mount(ApplyItem $applyItem)
    {
        $this->applyItem = $applyItem;
    }

    public function deleteItem()
    {
        $item = ApplyItem::find($this->applyItem->id);
        $item->delete();
        $this->emitTo('kinesiologos.resumenes', 'delete-sesion');
        $this->dispatchBrowserEvent('swal-success');
        $this->isOpen = false;
        $this->isOpenDelete = false;
    }

    public function openModal()
    {
        $this->isOpen = true;
    }

    public function closeModal()
    {
        $this->isOpen = false;
    }

    public function openDeleteModal()
    {
        $this->isOpenDelete = true;
    }

    public function closeDeleteModal()
    {
        $this->isOpenDelete = false;
    }
}
