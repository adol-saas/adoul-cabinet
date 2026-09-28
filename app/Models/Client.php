<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'cin',
        'name_ar',
        'name_fr',
        'name_ber',
        'birth_date',
        'birth_city',
        'address',
        'phone',
        'email',
        'gender',
        'marital_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function dossiers(): HasMany
    {
        return $this->hasMany(Dossier::class, 'client_id');
    }

    public function secondaryDossiers(): HasMany
    {
        return $this->hasMany(Dossier::class, 'client2_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'client_id');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('cin', 'LIKE', "%{$term}%")
                ->orWhere('name_ar', 'LIKE', "%{$term}%")
                ->orWhere('name_fr', 'LIKE', "%{$term}%")
                ->orWhere('phone', 'LIKE', "%{$term}%")
                ->orWhere('email', 'LIKE', "%{$term}%");
        });
    }

    public static function isValidMoroccanCin(string $cin): bool
    {
        return (bool) preg_match('/^[A-Z]{1,2}[0-9]{5,8}$/i', trim($cin));
    }
}
