<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlotterController extends Controller
{
    /**
     * Display the official statutory Daily Blotter (مذكرة الحفظ اليومية - المادة 24 من القانون 16.03)
     */
    public function index(Request $request): Response
    {
        $query = Dossier::with(['client', 'client2', 'adoul']);

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('reference', 'LIKE', "%{$s}%")
                    ->orWhere('notes_ar', 'LIKE', "%{$s}%")
                    ->orWhereHas('client', function ($cq) use ($s) {
                        $cq->where('name_ar', 'LIKE', "%{$s}%")
                            ->orWhere('cin', 'LIKE', "%{$s}%");
                    })
                    ->orWhereHas('client2', function ($cq) use ($s) {
                        $cq->where('name_ar', 'LIKE', "%{$s}%")
                            ->orWhere('cin', 'LIKE', "%{$s}%");
                    });
            });
        }

        if ($request->filled('type') && $request->query('type') !== 'all') {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('act_date', '>=', $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('act_date', '<=', $request->query('date_to'));
        }

        $entries = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        $officeSetting = OfficeSetting::first();

        // Calculate blotter statistics
        $stats = [
            'total_entries' => Dossier::count(),
            'current_year_count' => Dossier::whereYear('created_at', now()->year)->count(),
            'free_acts_count' => Dossier::whereJsonContains('details->is_statutory_free', true)
                ->orWhereIn('type', ['islam_conversion', 'crescent_sighting', 'indigent_marriage'])
                ->count(),
            'court_validated_count' => Dossier::whereNotNull('qadi_reference')->count(),
        ];

        return Inertia::render('tenant/blotter/index', [
            'entries' => $entries,
            'filters' => $request->only(['search', 'type', 'date_from', 'date_to']),
            'officeSetting' => $officeSetting,
            'stats' => $stats,
        ]);
    }
}
