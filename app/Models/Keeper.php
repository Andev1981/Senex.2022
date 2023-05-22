<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keeper extends Model
{
    use HasFactory;

    
    protected $fillable = [
           'name',
           'last_name',
           'email',
           'phone',
           'user_id',
           'address_id',
           'parentesco',
        ];

        public function user(){
            return $this->belongsTo(User::class);
        }

        public function address(){
            return $this->belongsTo(Address::class);
        }
}
