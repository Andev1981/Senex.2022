<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'sku',
        'barcode',
        'cost_price',
        'price',
        'is_exempt',
        'stock',
        'critical_stock',
        'manage_stock',
        'is_active'
    ];

    public function sellable()
    {
        // Esto permite que el ítem sea un "TreatmentSession" O un "Product"
        return $this->morphTo();
    }

    // Calculamos el Neto (para DTE) al vuelo
    public function getNetPriceAttribute()
    {
        if ($this->is_exempt) return $this->price;
        return round($this->price / 1.19);
    }
}
