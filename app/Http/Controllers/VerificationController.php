<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\OfficeSetting;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function show(string $reference): Response
    {
        $d = Dossier::where('reference', $reference)->first();
        $setting = OfficeSetting::first();

        $officeFound = [
            'id' => 'cabinet',
            'name_ar' => $setting?->office_name_ar ?? 'مكتب العدل',
            'name_fr' => $setting?->office_name_fr ?? 'Cabinet Adoul',
            'city' => $setting?->city ?? 'المملكة المغربية',
            'qadi_name' => $setting?->qadi_name ?? 'قاضي التوثيق بالمحكمة الابتدائية المختصة',
        ];

        $dossierFound = null;
        if ($d) {
            $dossierFound = [
                'reference' => $d->reference,
                'type' => $d->type,
                'status' => $d->status,
                'act_date' => $d->act_date ? $d->act_date->format('Y-m-d') : null,
                'signing_date' => $d->signing_date ? $d->signing_date->format('Y-m-d') : null,
                'qadi_validation_date' => $d->qadi_validation_date ? $d->qadi_validation_date->format('Y-m-d') : null,
                'qadi_reference' => $d->qadi_reference,
                'is_authentic' => in_array($d->status, ['signed', 'archived'], true),
            ];
        }

        return Inertia::render('verify', [
            'reference' => $reference,
            'dossier' => $dossierFound,
            'office' => $officeFound,
        ]);
    }
}
