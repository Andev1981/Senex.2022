<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizzAnswer extends Model
{
    use HasFactory;

    protected $guarded = [
        'id'
    ];


    public function quizz_question(){
        return $this->belongsTo(QuizzQuestion::class);
    }

}
