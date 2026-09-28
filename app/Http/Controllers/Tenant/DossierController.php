<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DossierController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $type = $request->query('type');
        $status = $request->query('status');

        $query = Dossier::with(['client', 'client2', 'adoul']);

        if ($search) {
            $query->search($search);
        }

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $dossiers = $query->latest('act_date')->latest()->paginate(15)->withQueryString();

        return Inertia::render('tenant/dossiers/index', [
            'dossiers' => $dossiers,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
            ],
            'stats' => [
                'total' => Dossier::count(),
                'draft' => Dossier::where('status', 'draft')->count(),
                'pending_qadi' => Dossier::where('status', 'pending_qadi')->count(),
                'signed' => Dossier::where('status', 'signed')->count(),
                'archived' => Dossier::where('status', 'archived')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $clients = Client::orderBy('name_ar')->get();
        $adoulUsers = User::orderBy('name')->get(['id', 'name', 'job_title']);
        $templates = DocumentTemplate::where('is_active', true)->get();

        return Inertia::render('tenant/dossiers/create', [
            'clients' => $clients,
            'adoulUsers' => $adoulUsers,
            'templates' => $templates,
            'initialType' => $request->query('type', 'marriage'),
            'canUseAllTypes' => true,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = tenant();
        $features = $tenant?->plan?->features_config ?? [];

        $validated = $request->validate([
            'type' => ['required', 'in:marriage,divorce,raj3a,thobout_zawjia,hadana_nafaka,nasab_iqrar,inheritance,will,tarakah_qisma,tarakah_ihsa,property_sale,property_promise,mortgage,mainlevee,donation,sadaqa,mulkiya_lafif,conversion_islam,poa,debt_recognition,certificate,other'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'client2_id' => ['nullable', 'exists:clients,id'],
            // Manual Party 1 Fields (to avoid client entry typos)
            'party1_name_ar' => ['nullable', 'string', 'max:255'],
            'party1_name_fr' => ['nullable', 'string', 'max:255'],
            'party1_cin' => ['nullable', 'string', 'max:50'],
            'party1_phone' => ['nullable', 'string', 'max:50'],
            'party1_birth_date' => ['nullable', 'date'],
            'party1_birth_city' => ['nullable', 'string', 'max:255'],
            'party1_address' => ['nullable', 'string', 'max:500'],
            'party1_gender' => ['nullable', 'in:male,female'],
            // Manual Party 2 Fields
            'party2_name_ar' => ['nullable', 'string', 'max:255'],
            'party2_name_fr' => ['nullable', 'string', 'max:255'],
            'party2_cin' => ['nullable', 'string', 'max:50'],
            'party2_phone' => ['nullable', 'string', 'max:50'],
            'party2_birth_date' => ['nullable', 'date'],
            'party2_birth_city' => ['nullable', 'string', 'max:255'],
            'party2_address' => ['nullable', 'string', 'max:500'],
            'party2_gender' => ['nullable', 'in:male,female'],
            'adoul_id' => ['nullable', 'exists:users,id'],
            'amount_due' => ['required', 'numeric', 'min:0'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'act_date' => ['required', 'date'],
            'notes_ar' => ['nullable', 'string', 'max:3000'],
            'notes_fr' => ['nullable', 'string', 'max:3000'],
            'details' => ['nullable', 'array'],
        ]);

        // Resolve Party 1 manually to prevent typo errors
        $clientId = $validated['client_id'] ?? null;
        if (! empty($validated['party1_name_ar']) && ! empty($validated['party1_cin'])) {
            $cin = trim(strtoupper($validated['party1_cin']));
            $clientData = [
                'name_ar' => trim($validated['party1_name_ar']),
                'name_fr' => ! empty($validated['party1_name_fr']) ? trim($validated['party1_name_fr']) : trim($validated['party1_name_ar']),
                'phone' => $validated['party1_phone'] ?? null,
                'birth_date' => $validated['party1_birth_date'] ?? null,
                'birth_city' => $validated['party1_birth_city'] ?? null,
                'address' => $validated['party1_address'] ?? null,
                'gender' => $validated['party1_gender'] ?? 'male',
            ];

            $client1 = Client::updateOrCreate(['cin' => $cin], $clientData);
            $clientId = $client1->id;
        }

        if (! $clientId) {
            return back()->withErrors(['party1_name_ar' => 'يرجى إدخال اسم ورقم بطاقة الطرف الأول أو اختياره من القائمة']);
        }

        // Resolve Party 2 (optional depending on act type)
        $client2Id = $validated['client2_id'] ?? null;
        if (! empty($validated['party2_name_ar']) && ! empty($validated['party2_cin'])) {
            $cin2 = trim(strtoupper($validated['party2_cin']));
            $client2Data = [
                'name_ar' => trim($validated['party2_name_ar']),
                'name_fr' => ! empty($validated['party2_name_fr']) ? trim($validated['party2_name_fr']) : trim($validated['party2_name_ar']),
                'phone' => $validated['party2_phone'] ?? null,
                'birth_date' => $validated['party2_birth_date'] ?? null,
                'birth_city' => $validated['party2_birth_city'] ?? null,
                'address' => $validated['party2_address'] ?? null,
                'gender' => $validated['party2_gender'] ?? 'female',
            ];

            $client2 = Client::updateOrCreate(['cin' => $cin2], $client2Data);
            $client2Id = $client2->id;
        }

        $reference = Dossier::generateReference();

        $dossier = Dossier::create([
            'type' => $validated['type'],
            'client_id' => $clientId,
            'client2_id' => $client2Id,
            'adoul_id' => $validated['adoul_id'] ?? auth()->id(),
            'amount_due' => $validated['amount_due'],
            'amount_paid' => $validated['amount_paid'],
            'act_date' => $validated['act_date'],
            'notes_ar' => $validated['notes_ar'] ?? null,
            'notes_fr' => $validated['notes_fr'] ?? null,
            'details' => $validated['details'] ?? [],
            'reference' => $reference,
            'status' => 'draft',
        ]);

        $dossier->logAction('created', auth()->id(), [
            'reference' => $reference,
            'type' => $dossier->type,
            'note' => 'تم إنشاء وتوثيق الملف مبدئياً بصيغة مسودة بالتحقق اليدوي للأطراف',
        ]);

        return redirect()->route('dossiers.show', $dossier->id)
            ->with('success', "تم فتح وتوثيق الملف العدلي بنجاح برقم المرجع: [{$reference}].");
    }

    public function show(Dossier $dossier): Response
    {
        $dossier->load([
            'client',
            'client2',
            'adoul',
            'actLogs.user',
            'appointments',
        ]);

        $officeSetting = OfficeSetting::first();
        $template = DocumentTemplate::where('type', $dossier->type)->where('is_active', true)->first();
        $adoulUsers = User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'job_title']);

        $verifyUrl = url("/verify/{$dossier->reference}");

        return Inertia::render('tenant/dossiers/show', [
            'dossier' => $dossier,
            'officeSetting' => $officeSetting,
            'template' => $template,
            'adoulUsers' => $adoulUsers,
            'verifyUrl' => $verifyUrl,
        ]);
    }

    public function updateStatus(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:draft,court_deposit,pending_qadi,signed,dgi_registered,ancfcc_registered,archived,cancelled'],
            'qadi_reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $oldStatus = $dossier->status;
        $newStatus = $validated['status'];

        $updates = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'signed' && ! $dossier->signing_date) {
            $updates['signing_date'] = now();
            $updates['qadi_validation_date'] = now();
            if (! empty($validated['qadi_reference'])) {
                $updates['qadi_reference'] = $validated['qadi_reference'];
            }
        }

        $dossier->update($updates);

        $dossier->logAction("status_changed_to_{$newStatus}", auth()->id(), [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'note' => $validated['note'] ?? 'تحديث مرحلة الرسم العدلي',
            'qadi_reference' => $validated['qadi_reference'] ?? null,
        ]);

        return back()->with('success', "تم تغيير حالة الملف إلى: [{$newStatus}] بنجاح.");
    }

    /**
     * Update Judicial Circuit, Qadi Visa, DGI & ANCFCC Details
     */
    public function updateCircuit(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'court_name' => ['nullable', 'string', 'max:255'],
            'deposit_date' => ['nullable', 'date'],
            'deposit_receipt' => ['nullable', 'string', 'max:100'],
            'tadmine_number' => ['nullable', 'string', 'max:50'],
            'kunnash_number' => ['nullable', 'string', 'max:50'],
            'page_number' => ['nullable', 'string', 'max:50'],
            'qadi_reference' => ['nullable', 'string', 'max:150'],
            'qadi_validation_date' => ['nullable', 'date'],
            'dgi_number' => ['nullable', 'string', 'max:100'],
            'dgi_date' => ['nullable', 'date'],
            'dgi_amount' => ['nullable', 'numeric', 'min:0'],
            'ancfcc_title_number' => ['nullable', 'string', 'max:100'],
            'ancfcc_deposit_number' => ['nullable', 'string', 'max:100'],
            'second_adoul_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $details = $dossier->details ?? [];
        foreach ([
            'court_name', 'deposit_date', 'deposit_receipt', 'tadmine_number',
            'kunnash_number', 'page_number', 'dgi_number', 'dgi_date', 'dgi_amount',
            'ancfcc_title_number', 'ancfcc_deposit_number', 'second_adoul_id'
        ] as $field) {
            if (array_key_exists($field, $validated)) {
                $details[$field] = $validated[$field];
            }
        }

        if (! empty($validated['second_adoul_id'])) {
            $secondAdoul = User::find($validated['second_adoul_id']);
            if ($secondAdoul) {
                $details['second_adoul_name'] = $secondAdoul->name;
            }
        }

        $dossierUpdates = ['details' => $details];

        if (! empty($validated['qadi_reference'])) {
            $dossierUpdates['qadi_reference'] = $validated['qadi_reference'];
        }
        if (! empty($validated['qadi_validation_date'])) {
            $dossierUpdates['qadi_validation_date'] = $validated['qadi_validation_date'];
        }
        if (! empty($validated['status'])) {
            $dossierUpdates['status'] = $validated['status'];
        }

        $dossier->update($dossierUpdates);

        $dossier->logAction('circuit_updated', auth()->id(), [
            'note' => 'تم تحديث مراجع المسار القضائي والتسجيل الجبائي والعقاري',
            'qadi_reference' => $dossier->qadi_reference,
            'dgi_number' => $details['dgi_number'] ?? null,
        ]);

        return back()->with('success', 'تم حفظ وتحديث بيانات المسار القضائي (الخطاب والتضمين) والضرائب بنجاح.');
    }

    /**
     * Update Lafif 12-Witnesses for Mulkiya / Lafif Acts
     */
    public function updateLafif(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'witnesses' => ['required', 'array'],
            'witnesses.*.num' => ['required', 'integer'],
            'witnesses.*.name' => ['required', 'string', 'max:255'],
            'witnesses.*.cin' => ['nullable', 'string', 'max:50'],
            'witnesses.*.age' => ['nullable', 'numeric'],
            'witnesses.*.profession' => ['nullable', 'string', 'max:255'],
            'witnesses.*.address' => ['nullable', 'string', 'max:500'],
            'witnesses.*.bias_free' => ['nullable', 'boolean'],
            'witnesses.*.testimony' => ['nullable', 'string'],
        ]);

        $details = $dossier->details ?? [];
        $details['lafif_witnesses'] = $validated['witnesses'];

        $dossier->update(['details' => $details]);

        $dossier->logAction('lafif_witnesses_updated', auth()->id(), [
            'note' => 'تم تحديث قائمة شهود اللفيف الاثنا عشر (12 شاهداً)',
            'count' => count($validated['witnesses']),
        ]);

        return back()->with('success', 'تم حفظ واعتماد قائمة شهود اللفيف (12 شاهداً) بنجاح.');
    }

    public function update(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'amount_due' => ['required', 'numeric', 'min:0'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'notes_ar' => ['nullable', 'string', 'max:15000'],
            'notes_fr' => ['nullable', 'string', 'max:15000'],
            'details' => ['nullable', 'array'],
        ]);

        $dossier->update($validated);

        $dossier->logAction('updated', auth()->id(), [
            'note' => 'تم تعديل بنود ومستحقات الملف',
        ]);

        return back()->with('success', 'تم تحديث بيانات ومحرر الملف بنجاح.');
    }

    public function destroy(Dossier $dossier): RedirectResponse
    {
        // Spatie role protection: only owner can delete dossiers
        $isOwner = rescue(fn () => auth()->user()?->hasRole('owner'), false, false);
        if (! $isOwner) {
            return back()->with('error', 'حذف الملفات العدلية صلاحية حصرية لعدل المكتب الرئيسي (Owner).');
        }

        $ref = $dossier->reference;
        $dossier->delete();

        return redirect()->route('dossiers.index')
            ->with('success', "تم حذف الملف [{$ref}] نهائياً.");
    }
}
