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
        'estado'
    ];

    public function items()
    {
        return $this->hasMany(ApplyItem::class, 'application_type_id', 'id');
    }

    public function application_type_user()
    {
        return $this->hasMany(ApplicationTypeUser::class);
    }
}
