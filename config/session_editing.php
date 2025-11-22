<?php

return [
        'scheduled' => [
            'editable' => true,
            'fields' => 'all',
            'requires_reason' => false,
        ],
        'completed' => [
            'editable' => true,
            'fields' => ['pain_after', 'rom_*_after', 'techniques', 'exercises', 'notes', 'homework', 'next_goals'],
            'requires_reason' => true,
            'time_limit_hours' => 24, // Solo 24 hrs después de completada
        ],
        'cancelled' => [
            'editable' => true,
            'fields' => ['notes'],
            'requires_reason' => true,
        ],
];