<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentTemplate extends Model
{
    protected $fillable = [
        'type',
        'name_ar',
        'name_fr',
        'content_ar',
        'content_fr',
        'content_ber',
        'variables',
        'is_active',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
            'version' => 'integer',
        ];
    }
}
