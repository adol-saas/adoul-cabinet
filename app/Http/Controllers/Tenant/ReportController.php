<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Dossier;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        // 1. Monthly dossiers by type for the last 6 months
        $monthlyByType = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthKey = $monthDate->format('Y-m');
            $monthLabel = $monthDate->translatedFormat('F Y');

            $count = Dossier::whereYear('created_at', $monthDate->year)
                ->whereMonth('created_at', $monthDate->month)
                ->count();

            $revenue = (float) Dossier::whereYear('created_at', $monthDate->year)
                ->whereMonth('created_at', $monthDate->month)
                ->sum('amount_paid');

            $monthlyByType[] = [
                'month' => $monthKey,
                'label' => $monthLabel,
                'count' => $count,
                'revenue' => $revenue,
            ];
        }

        // 2. Dossiers breakdown by type (all time)
        $dossiersByType = Dossier::selectRaw('type, count(*) as count, sum(amount_paid) as total_paid')
            ->groupBy('type')
            ->get()
            ->map(function ($row) {
                return [
                    'type' => $row->type,
                    'count' => (int) $row->count,
                    'total_paid' => (float) $row->total_paid,
                ];
            });

        // 3. Top clients by dossier count
        $topClients = Client::withCount('dossiers')
            ->orderBy('dossiers_count', 'desc')
            ->take(5)
            ->get(['id', 'cin', 'name_ar', 'name_fr', 'phone']);

        // 4. Totals
        $financialSummary = [
            'total_revenue' => (float) Dossier::sum('amount_paid'),
            'total_due' => (float) Dossier::sum('amount_due'),
            'total_unpaid' => (float) (Dossier::sum('amount_due') - Dossier::sum('amount_paid')),
            'average_fee_per_act' => Dossier::count() > 0 ? round((float) Dossier::avg('amount_due'), 2) : 0,
        ];

        return Inertia::render('tenant/reports/index', [
            'monthlyTrends' => $monthlyByType,
            'dossiersByType' => $dossiersByType,
            'topClients' => $topClients,
            'financialSummary' => $financialSummary,
        ]);
    }
}
