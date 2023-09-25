<?php

namespace App\Http\Livewire\Paciente\Show;

use App\Models\Answer;
use App\Models\Patient;
use App\Models\Question;
use App\Models\User;
use Livewire\Component;

class Preguntas extends Component
{
    public Patient $paciente;
    public Question $question;
    public $answers;
    public $answer;


    protected $rules = [
        'answer.name' => 'required',
    ];

    public function mount(Patient $paciente, Question $question)
    {
        $this->paciente = $paciente;
        $user = $paciente;
        $this->question = $question;
        $this->answer = Answer::with(['question:id,name'])->whereBelongsTo($user)->where('question_id', $question->id)->first();

        if(!$this->answer){
            $this->answer = Answer::create(['user_id' => $this->paciente->id,'patient_id' => $this->paciente->id,'question_id' => $this->question->id]);
        }

       /*  dd($this->answer); */

    }

    public function render()
    {
        return view('livewire.paciente.show.preguntas');
    }

    public function guardar()
    {
        $this->validate();
        $this->answer->save();
    }
}
