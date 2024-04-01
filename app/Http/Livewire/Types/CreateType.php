<?php

namespace App\Http\Livewire\Types;

use App\Models\ApplicationType;
use Livewire\Component;

class CreateType extends Component
{

    public ApplicationType $type;

    public $open = 'hidden', $status = 0;


    public function render()
    {
        return view('livewire.types.create-type');
    }

    public function mount(ApplicationType $type)
    {
        if ($type) {
            $this->type = $type;
            if ($this->type->id) {
                $this->status = 1;
            }
        }
    }

    protected $rules = [
        'type.name' => 'required|string|max:100',
        'type.description' => 'required|string|max:100',
        'type.estado' => '',
    ];

    public function save()
    {
        $this->validate();
        $this->type->save();


        $this->clear();
        $this->dispatchBrowserEvent('swal-success');
        $this->emit('success-type');
        $this->open = 'hidden';
    }

    public function clear()
    {
        $this->resetValidation();
        /*         $this->resetErrorBag(); */
        if ($this->status === 1) {
            $this->type->id = '';
        }
        $this->type->name = '';
        $this->type->description = '';
    }
}
