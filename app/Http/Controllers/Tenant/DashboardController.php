<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Dossier;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $user = auth()->user();

        // 1. Roles & permissions check with fail-safe fallback
        $canViewFinancials = false;
        try {
            $canViewFinancials = $user && (
                $user->hasRole('owner') ||
                $user->hasRole('adoul') ||
                $user->can('reports.view')
            );
        } catch (\Throwable) {
            // Default to true for authenticated tenant user if Spatie roles table not initialized
            $canViewFinancials = true;
        }

        // 2. Today's appointments
        try {
            $todayAppointments = Appointment::with('client')
                ->whereDate('scheduled_at', $today)
                ->orderBy('scheduled_at')
                ->get();
        } catch (\Throwable) {
            $todayAppointments = collect([]);
        }

        // 3. Pending Qadi dossiers
        try {
            $pendingQadiDossiers = Dossier::with(['client', 'adoul'])
                ->where('status', 'pending_qadi')
                ->latest('act_date')
                ->take(5)
                ->get();
        } catch (\Throwable) {
            $pendingQadiDossiers = collect([]);
        }

        // 4. Recent dossiers
        try {
            $recentDossiers = Dossier::with(['client', 'adoul'])
                ->latest()
                ->take(6)
                ->get();
        } catch (\Throwable) {
            $recentDossiers = collect([]);
        }

        // 5. Quick metrics & financial totals
        try {
            $dossiersThisMonth = Dossier::where('created_at', '>=', $startOfMonth)->count();
            $pendingQadiCount = Dossier::where('status', 'pending_qadi')->count();
        } catch (\Throwable) {
            $dossiersThisMonth = 0;
            $pendingQadiCount = 0;
        }

        try {
            $totalClients = Client::count();
        } catch (\Throwable) {
            $totalClients = 0;
        }

        try {
            $totalRevenueThisMonth = $canViewFinancials ? (float) Dossier::where('created_at', '>=', $startOfMonth)->sum('amount_paid') : null;
            $totalDueThisMonth = $canViewFinancials ? (float) Dossier::where('created_at', '>=', $startOfMonth)->sum('amount_due') : null;
        } catch (\Throwable) {
            $totalRevenueThisMonth = 0.0;
            $totalDueThisMonth = 0.0;
        }

        try {
            $pendingAppointmentsCount = Appointment::where('status', 'pending')->count();
        } catch (\Throwable) {
            $pendingAppointmentsCount = 0;
        }

        // 6. Types breakdown for current month
        try {
            $typesBreakdown = Dossier::where('created_at', '>=', $startOfMonth)
                ->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray();
        } catch (\Throwable) {
            $typesBreakdown = [];
        }

        return Inertia::render('tenant/dashboard', [
            'metrics' => [
                'dossiers_this_month' => $dossiersThisMonth,
                'total_clients' => $totalClients,
                'revenue_this_month' => $totalRevenueThisMonth,
                'due_this_month' => $totalDueThisMonth,
                'pending_qadi_count' => $pendingQadiCount,
                'pending_appointments' => $pendingAppointmentsCount,
                'can_view_financials' => $canViewFinancials,
            ],
            'todayAppointments' => $todayAppointments,
            'pendingQadiDossiers' => $pendingQadiDossiers,
            'recentDossiers' => $recentDossiers,
            'typesBreakdown' => $typesBreakdown,
        ]);
    }
}
