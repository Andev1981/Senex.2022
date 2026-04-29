<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Multitenantable;

class Item extends Model
{
    use HasFactory, SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'branch_id',
        'user_id',
        'category_id',
        'type',
        'name',
        'description',
        'sku',
        'price',
        'is_exempt',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_exempt' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Relación con la categoría
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relación con los detalles de producto
     */
    public function productDetail()
    {
        return $this->hasOne(ProductDetail::class);
    }

    /**
     * Relación con los detalles de servicio
     */
    public function serviceDetail()
    {
        return $this->hasOne(ServiceDetail::class);
    }

    /**
     * Scope para filtrar por tipo
     */
    public function scopeProducts($query)
    {
        return $query->where('type', 'product');
    }

    public function scopeServices($query)
    {
        return $query->where('type', 'service');
    }

    // Accesor para saber si es servicio o producto de forma fácil
    public function isService(): bool
    {
        return $this->type === 'service';
    }

    public function isProduct(): bool
    {
        return $this->type === 'product';
    }
}
