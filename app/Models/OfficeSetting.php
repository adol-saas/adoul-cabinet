<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeSetting extends Model
{
    protected $fillable = [
        'office_name_ar',
        'office_name_fr',
        'city',
        'region',
        'phone',
        'email',
        'address',
        'qadi_name',
        'stamp_image_path',
        'logo_path',
        'hero_image_path',
        'tagline_ar',
        'tagline_fr',
        'bio_ar',
        'bio_fr',
        'theme_color',
        'footer_text_ar',
        'footer_text_fr',
        'whatsapp_number',
        'color_primary',
        'working_hours',
    ];

    protected function casts(): array
    {
        return [
            'working_hours' => 'array',
        ];
    }
}
