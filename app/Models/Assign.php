<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assign extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', //Usuario Kine
        'application_id',
        'apply_item_id',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function application(){
        return $this->belongsTo(Application::class);
    }

    public function applyItem(){
        return $this->belongsTo(ApplyItem::class);
    }
    
}
