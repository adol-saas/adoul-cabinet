<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Dossier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $query = Appointment::with(['client', 'dossier']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->paginate(20)->withQueryString();
        $clients = Client::orderBy('name_ar')->get(['id', 'cin', 'name_ar', 'name_fr', 'phone']);
        $dossiers = Dossier::orderBy('reference')->get(['id', 'reference', 'type']);

        return Inertia::render('tenant/appointments/index', [
            'appointments' => $appointments,
            'clients' => $clients,
            'dossiers' => $dossiers,
            'currentStatus' => $status,
            'stats' => [
                'total' => Appointment::count(),
                'pending' => Appointment::where('status', 'pending')->count(),
                'confirmed' => Appointment::where('status', 'confirmed')->count(),
                'completed' => Appointment::where('status', 'completed')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_id' => ['nullable', 'exists:clients,id'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:30'],
            'client_email' => ['nullable', 'email'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'type' => ['required', 'string'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Appointment::create([
            ...$validated,
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'تم حجز وتأكيد الموعد بنجاح في أجندة المكتب.');
    }

    public function updateStatus(Request $request, Appointment $appointment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,completed,cancelled'],
        ]);

        $appointment->update(['status' => $validated['status']]);

        return back()->with('success', "تم تحديث حالة الموعد إلى: [{$validated['status']}].");
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $appointment->delete();

        return back()->with('success', 'تم حذف الموعد من الأجندة.');
    }
}
