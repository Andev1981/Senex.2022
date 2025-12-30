<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    use HasFactory, Multitenantable;

    // Tabla consolidada
    protected $table = 'attachments';

    protected $fillable = [
        'company_id',
        'patient_id',
        'treatment_id',
        'treatment_session_id',
        'title',
        'mime_type',
        'size_bytes',
        'storage_path',
        'tags',
        'meta',
    ];

    protected $casts = [
        'tags' => 'array',
        'meta' => 'array',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute(): ?string
    {
        return $this->id ? route('attachments.stream', $this->id) : null;
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(TreatmentSession::class, 'treatment_session_id');
    }
}
