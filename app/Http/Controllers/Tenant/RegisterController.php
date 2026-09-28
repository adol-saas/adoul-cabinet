<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function index(Request $request): Response
    {
        $registerType = $request->query('register', 'all');
        $search = $request->query('search');
        $year = $request->query('year', (string) now()->year);

        $registerTypeMap = [
            'family' => ['marriage', 'divorce', 'raj3a', 'thobout_zawjia', 'hadana_nafaka', 'nasab_iqrar'],
            'property' => ['property_sale', 'property_promise', 'mortgage', 'mainlevee', 'mulkiya_lafif'],
            'inheritance' => ['inheritance', 'will', 'tarakah_qisma', 'tarakah_ihsa'],
            'donations' => ['donation', 'sadaqa'],
            'general' => ['poa', 'debt_recognition', 'conversion_islam', 'certificate', 'other'],
        ];

        $query = Dossier::with(['client', 'client2', 'adoul']);

        if ($registerType !== 'all' && isset($registerTypeMap[$registerType])) {
            $query->whereIn('type', $registerTypeMap[$registerType]);
        }

        if ($search) {
            $query->search($search);
        }

        if ($year && $year !== 'all') {
            $query->whereYear('act_date', $year);
        }

        $dossiers = $query->latest('act_date')->latest()->paginate(20)->withQueryString();

        $stats = [
            'total_all' => Dossier::count(),
            'family_count' => Dossier::whereIn('type', $registerTypeMap['family'])->count(),
            'property_count' => Dossier::whereIn('type', $registerTypeMap['property'])->count(),
            'inheritance_count' => Dossier::whereIn('type', $registerTypeMap['inheritance'])->count(),
            'donations_count' => Dossier::whereIn('type', $registerTypeMap['donations'])->count(),
            'general_count' => Dossier::whereIn('type', $registerTypeMap['general'])->count(),
            'homologated_count' => Dossier::whereNotNull('qadi_validation_date')->count(),
            'pending_qadi_count' => Dossier::where('status', 'pending_qadi')->count(),
        ];

        $officeSetting = OfficeSetting::first();

        return Inertia::render('tenant/registers/index', [
            'dossiers' => $dossiers,
            'filters' => [
                'register' => $registerType,
                'search' => $search,
                'year' => $year,
            ],
            'stats' => $stats,
            'officeSetting' => $officeSetting,
        ]);
    }

    public function updateInclusion(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'inclusion_number' => ['nullable', 'string', 'max:50'],
            'inclusion_book' => ['nullable', 'string', 'max:50'],
            'inclusion_page' => ['nullable', 'string', 'max:50'],
            'inclusion_year' => ['nullable', 'string', 'max:10'],
            'qadi_reference' => ['nullable', 'string', 'max:100'],
            'qadi_validation_date' => ['nullable', 'date'],
            'registration_receipt' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:draft,pending_qadi,signed,archived,cancelled'],
        ]);

        $details = $dossier->details ?? [];
        $details['inclusion_number'] = $validated['inclusion_number'] ?? ($details['inclusion_number'] ?? null);
        $details['inclusion_book'] = $validated['inclusion_book'] ?? ($details['inclusion_book'] ?? null);
        $details['inclusion_page'] = $validated['inclusion_page'] ?? ($details['inclusion_page'] ?? null);
        $details['inclusion_year'] = $validated['inclusion_year'] ?? ($details['inclusion_year'] ?? date('Y'));
        $details['registration_receipt'] = $validated['registration_receipt'] ?? ($details['registration_receipt'] ?? null);

        $updates = [
            'details' => $details,
        ];

        if (! empty($validated['qadi_reference'])) {
            $updates['qadi_reference'] = $validated['qadi_reference'];
        }

        if (! empty($validated['qadi_validation_date'])) {
            $updates['qadi_validation_date'] = $validated['qadi_validation_date'];
            $updates['status'] = 'signed';
        } elseif (! empty($validated['status'])) {
            $updates['status'] = $validated['status'];
        }

        $dossier->update($updates);

        $dossier->logAction('updated_inclusion', auth()->id(), [
            'inclusion_number' => $details['inclusion_number'],
            'inclusion_book' => $details['inclusion_book'],
            'inclusion_page' => $details['inclusion_page'],
            'note' => 'تم تحيين بيانات التضمين ومخاطبة قاضي التوثيق',
        ]);

        return back()->with('success', "تم تحيين بيانات التضمين بسجل المحكمة للرسم [{$dossier->reference}].");
    }
}
