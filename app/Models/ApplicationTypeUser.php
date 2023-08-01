<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationTypeUser extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'application_type_id',
        'price',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function application_type(){
        return $this->belongsTo(ApplicationType::class);
    }
}
