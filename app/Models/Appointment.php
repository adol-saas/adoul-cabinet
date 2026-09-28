<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'client_id',
        'dossier_id',
        'client_name',
        'client_phone',
        'client_email',
        'type',
        'scheduled_at',
        'duration_minutes',
        'status',
        'notes',
        'reminder_sent',
        'is_citizen_request',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'reminder_sent' => 'boolean',
            'is_citizen_request' => 'boolean',
            'duration_minutes' => 'integer',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }
}
