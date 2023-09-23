<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentIncome extends Model
{
    use HasFactory;

    protected $fillable = [
        'pay',
        'application_id',
        'apply_item_id',
        'fecha_pago'
    ];

    public function application(){
        return $this->belongsTo(Application::class);
    }

    public function item(){
        return $this->belongsTo(ApplyItem::class);
    }
}
