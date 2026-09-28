<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'dossier_id',
        'user_id',
        'action',
        'details',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
