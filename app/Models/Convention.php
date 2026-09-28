<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Convention extends Model
{
    use CentralConnection;
    protected $fillable = [
        'title_ar',
        'title_fr',
        'description_ar',
        'description_fr',
        'file_path',
        'category',
        'reference_number',
        'issued_date',
    ];

    protected function casts(): array
    {
        return [
            'issued_date' => 'date',
        ];
    }
}
