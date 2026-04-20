<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use SoftDeletes, Multitenantable;

    protected $fillable = [
        'company_id',
        'branch_id',
        'supplier_id',
        'user_id',
        'number',
        'date',
        'status',
        'net_amount_clp',
        'tax_amount_clp',
        'total_amount_clp',
        'observations',
    ];

    protected $casts = [
        'date' => 'date',
        'net_amount_clp' => 'integer',
        'tax_amount_clp' => 'integer',
        'total_amount_clp' => 'integer',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
