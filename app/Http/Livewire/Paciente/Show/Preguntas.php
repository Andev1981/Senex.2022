<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Answer;
use App\Models\Question;
use App\Models\User;
use Livewire\Component;

class Preguntas extends Component
{
    public User $paciente;
    public Question $question;
    public $answers;
    public $answer;


    protected $rules = [
        'answer.name' => '',
    ];

    public function mount(User $paciente, Question $question)
    {
        $this->paciente = $paciente;
        $user = $paciente;
        $this->question = $question;
        $this->answer = Answer::with(['question:id,name'])->whereBelongsTo($user)->where('question_id', $question->id)->first();
    }

    public function render()
    {
        return view('livewire.paciente.show.preguntas');
    }

    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function guardar()
    {
        $this->answer->save();
    }
}
