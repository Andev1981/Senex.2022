<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PlanItem extends Pivot
{
    protected $table = 'plan_items';

    protected $fillable = [
        'plan_id',
        'item_id',
        'max_sessions',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
