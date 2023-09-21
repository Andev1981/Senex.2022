<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assign extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', //Usuario Kine
        'doctor_id',
        'application_id',
        'apply_item_id',
        'application_type_user_id',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

     public function applicationTypeUser(){
        return $this->belongsTo(ApplicationTypeUser::class,'application_type_user_id','id');
    }

    public function application(){
        return $this->belongsTo(Application::class);
    }

    public function applyItem(){
        return $this->belongsTo(ApplyItem::class);
    }
    
}
