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
        'branch_id',
        'user_id',
        'type',
        'category_id',
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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeProducts($query)
    {
        return $query->where('type', 'product');
    }

    public function scopeServices($query)
    {
        return $query->where('type', 'service');
    }

    public function invoiceItems()
    {
        return $this->morphMany(InvoiceItem::class, 'sellable');
    }

    // Calculamos el Neto (para DTE) al vuelo
    public function getNetPriceAttribute()
    {
        if ($this->is_exempt) return $this->price;
        return round($this->price / 1.19);
    }
}
