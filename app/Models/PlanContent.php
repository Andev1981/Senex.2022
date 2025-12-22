<?php

// app/Models/PlanContent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PlanContent extends Pivot
{
    // 💡 IMPORTANTE: Si usaste un nombre de tabla no estándar, define la tabla.
    protected $table = 'plan_session_type'; 
    
    // Si tu modelo pivote tiene claves foráneas no estándar (ej: plan_id),
    // asegúrate de que Eloquent lo sepa.
    // Aunque en este caso, por defecto funcionaría.

    protected $fillable = [
        'plan_id',
        'session_type_id',
        'max_sessions',
    ];
    
    // Define las relaciones a los modelos principales
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function sessionType()
    {
        return $this->belongsTo(SessionType::class);
    }
}