<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dossier extends Model
{
    protected $fillable = [
        'reference',
        'type',
        'status',
        'client_id',
        'client2_id',
        'adoul_id',
        'amount_due',
        'amount_paid',
        'notes_ar',
        'notes_fr',
        'act_date',
        'signing_date',
        'qadi_validation_date',
        'qadi_reference',
        'details',
        'documents',
    ];

    protected function casts(): array
    {
        return [
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'act_date' => 'date',
            'signing_date' => 'date',
            'qadi_validation_date' => 'date',
            'details' => 'array',
            'documents' => 'array',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function client2(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client2_id');
    }

    public function adoul(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adoul_id');
    }

    public function actLogs(): HasMany
    {
        return $this->hasMany(ActLog::class, 'dossier_id')->latest();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'dossier_id');
    }

    public static function generateReference(): string
    {
        $year = date('Y');
        $count = static::whereYear('created_at', $year)->count() + 1;
        $sequence = str_pad((string) $count, 5, '0', STR_PAD_LEFT);

        return "DOS-{$year}-{$sequence}";
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('reference', 'LIKE', "%{$term}%")
                ->orWhere('type', 'LIKE', "%{$term}%")
                ->orWhere('notes_ar', 'LIKE', "%{$term}%")
                ->orWhere('notes_fr', 'LIKE', "%{$term}%")
                ->orWhereHas('client', function ($clientQ) use ($term) {
                    $clientQ->where('name_ar', 'LIKE', "%{$term}%")
                        ->orWhere('name_fr', 'LIKE', "%{$term}%")
                        ->orWhere('cin', 'LIKE', "%{$term}%");
                });
        });
    }

    public function logAction(string $action, ?int $userId = null, array $details = []): ActLog
    {
        return $this->actLogs()->create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'details' => $details,
        ]);
    }
}
