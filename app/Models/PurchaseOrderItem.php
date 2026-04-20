<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'description',
        'quantity',
        'unit_price_clp',
        'total_price_clp',
    ];

    protected $casts = [
        'unit_price_clp' => 'integer',
        'total_price_clp' => 'integer',
        'quantity' => 'integer',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
