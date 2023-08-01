<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationType extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
    ];

    public function items()
    {
        return $this->hasMany(ApplyItem::class);
    }

    public function application_type_user()
    {
        return $this->hasMany(ApplicationTypeUser::class);
    }

}
