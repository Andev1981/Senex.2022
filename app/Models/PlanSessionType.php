<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PlanSessionType extends Pivot
{
    protected $table = 'plan_session_type';

    protected $fillable = [
        'plan_id',
        'session_type_id',
        'max_sessions',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function sessionType()
    {
        return $this->belongsTo(SessionType::class);
    }
}
