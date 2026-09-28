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

    protected $appends = [
        'dgi_status',
        'circuit_stage',
    ];

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

    public function secondAdoul(): ?User
    {
        $id = $this->details['second_adoul_id'] ?? null;
        return $id ? User::find($id) : null;
    }

    public function actLogs(): HasMany
    {
        return $this->hasMany(ActLog::class, 'dossier_id')->latest();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'dossier_id');
    }

    /**
     * Compute DGI 30-day legal registration deadline according to CGI Art. 128
     */
    public function getDgiStatusAttribute(): array
    {
        $details = $this->details ?? [];
        $isRegistered = ! empty($details['dgi_number']);
        $refDate = $this->act_date ?? $this->created_at;

        if ($isRegistered) {
            return [
                'is_registered' => true,
                'dgi_number' => $details['dgi_number'],
                'dgi_date' => $details['dgi_date'] ?? null,
                'dgi_amount' => $details['dgi_amount'] ?? 0,
                'status_label' => 'مسجل بإدارة الضرائب SIMPL-Adoul',
                'badge_variant' => 'emerald',
                'days_remaining' => 0,
                'is_overdue' => false,
            ];
        }

        if (! $refDate) {
            return [
                'is_registered' => false,
                'status_label' => 'قيد الانتظار',
                'badge_variant' => 'outline',
                'days_remaining' => 30,
                'is_overdue' => false,
            ];
        }

        $deadline = \Carbon\Carbon::parse($refDate)->addDays(30);
        $daysRemaining = (int) now()->diffInDays($deadline, false);
        $isOverdue = $daysRemaining < 0;

        return [
            'is_registered' => false,
            'dgi_number' => null,
            'deadline_date' => $deadline->format('Y-m-d'),
            'days_remaining' => max(0, $daysRemaining),
            'is_overdue' => $isOverdue,
            'status_label' => $isOverdue 
                ? 'متأخر عن أجل 30 يوماً القانوني (تخضع لذعيرة 15%)' 
                : ($daysRemaining <= 7 ? "أجل وشيك: متبقي {$daysRemaining} أيام للتسجيل" : "متبقي {$daysRemaining} يوماً للتسجيل الجبائي"),
            'badge_variant' => $isOverdue ? 'destructive' : ($daysRemaining <= 7 ? 'gold' : 'outline'),
        ];
    }

    /**
     * Get Judicial Circuit Stage progression
     */
    public function getCircuitStageAttribute(): string
    {
        $details = $this->details ?? [];
        if (! empty($details['dgi_number']) && ! empty($this->qadi_reference)) {
            return 'dgi_registered';
        }
        if (! empty($this->qadi_reference) || ! empty($this->qadi_validation_date)) {
            return 'khotiba';
        }
        if ($this->status === 'pending_qadi') {
            return 'court_deposit';
        }
        if ($this->signing_date || $this->status === 'signed') {
            return 'signed_adoul';
        }

        return 'draft';
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
