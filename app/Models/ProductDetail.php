<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'barcode',
        'cost_price',
        'stock',
        'critical_stock',
        'manage_stock',
    ];

    protected $casts = [
        'cost_price' => 'integer',
        'manage_stock' => 'boolean',
        'stock' => 'integer',
        'critical_stock' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
