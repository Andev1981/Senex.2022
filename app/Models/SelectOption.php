<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelectOption extends Model
{
    use HasFactory;
    protected $fillable = [
        'sort_order',
        'name',
        'model_type'
    ];
}
