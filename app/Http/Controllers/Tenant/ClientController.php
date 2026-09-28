<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $clients = Client::search($search)
            ->withCount('dossiers')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('tenant/clients/index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Client $client): Response
    {
        $client->load([
            'dossiers' => fn ($q) => $q->latest(),
            'secondaryDossiers' => fn ($q) => $q->latest(),
            'appointments' => fn ($q) => $q->latest('scheduled_at'),
        ]);

        return Inertia::render('tenant/clients/show', [
            'client' => $client,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cin' => ['required', 'string', 'max:15'],
            'name_ar' => ['required', 'string', 'max:255'],
            'name_fr' => ['required', 'string', 'max:255'],
            'name_ber' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'birth_city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'marital_status' => ['required', 'in:single,married,divorced,widowed'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $cin = strtoupper(trim($validated['cin']));
        if (! Client::isValidMoroccanCin($cin)) {
            throw ValidationException::withMessages([
                'cin' => 'صيغة رقم البطاقة الوطنية غير صحيحة (Ex: AB123456 ou A123456).',
            ]);
        }

        $validated['cin'] = $cin;

        $client = Client::create($validated);

        return back()->with('success', "تم تسجيل المتعاقد [{$client->name_ar}] بنجاح في السجل.");
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'cin' => ['required', 'string', 'max:15'],
            'name_ar' => ['required', 'string', 'max:255'],
            'name_fr' => ['required', 'string', 'max:255'],
            'name_ber' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'birth_city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'marital_status' => ['required', 'in:single,married,divorced,widowed'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $cin = strtoupper(trim($validated['cin']));
        if (! Client::isValidMoroccanCin($cin)) {
            throw ValidationException::withMessages([
                'cin' => 'صيغة رقم البطاقة الوطنية غير صحيحة.',
            ]);
        }

        $validated['cin'] = $cin;
        $client->update($validated);

        return back()->with('success', "تم تحديث بيانات المتعاقد [{$client->name_ar}] بنجاح.");
    }

    public function destroy(Client $client): RedirectResponse
    {
        $name = $client->name_ar;
        $client->delete();

        return redirect()->route('tenant.clients.index')
            ->with('success', "تم حذف المتعاقد [{$name}] من السجل.");
    }
}
