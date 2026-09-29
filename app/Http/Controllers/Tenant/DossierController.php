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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            'workflowTemplates' => Dossier::getDefaultWorkflowTemplates(),
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

    /**
     * Upload and record a document file in the dossier
     */
    public function uploadDocument(Request $request, Dossier $dossier): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx'],
            'name' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:cin,birth_cert,property_title,quitus_fiscal,court_order,draft_scan,signed_minute,qadi_homologation,other'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $storedName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
        $path = $file->storeAs("dossiers/{$dossier->id}", $storedName, 'public');

        $docName = $request->input('name') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        $documents = $dossier->documents ?? [];
        $newDoc = [
            'id' => (string) Str::uuid(),
            'name' => $docName,
            'category' => $request->input('category', 'other'),
            'path' => "/storage/{$path}",
            'filename' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => strtolower($extension),
            'notes' => $request->input('notes'),
            'uploaded_at' => now()->toIso8601String(),
            'uploaded_by' => auth()->user()->name ?? 'مستخدم المكتب',
        ];

        $documents[] = $newDoc;
        $dossier->update(['documents' => $documents]);

        $dossier->logAction('document_uploaded', auth()->id(), [
            'note' => "تم إرفاق وتسجيل وثيقة جديدة: [{$docName}] ضمن تصنيف [{$newDoc['category']}]",
            'document_id' => $newDoc['id'],
            'file_name' => $file->getClientOriginalName(),
        ]);

        return back()->with('success', "تم تسجيل وإرفاق وثيقة [{$docName}] بنجاح.");
    }

    /**
     * Delete an attached document from the dossier
     */
    public function deleteDocument(Request $request, Dossier $dossier, string $documentId): RedirectResponse
    {
        $documents = $dossier->documents ?? [];
        $docName = 'وثيقة';

        $updated = array_values(array_filter($documents, function ($doc) use ($documentId, &$docName) {
            if (($doc['id'] ?? '') === $documentId) {
                $docName = $doc['name'] ?? 'وثيقة';
                if (! empty($doc['path'])) {
                    $relative = str_replace('/storage/', '', $doc['path']);
                    Storage::disk('public')->delete($relative);
                }
                return false;
            }
            return true;
        }));

        $dossier->update(['documents' => $updated]);

        $dossier->logAction('document_deleted', auth()->id(), [
            'note' => "تم حذف وثيقة مرفقة: [{$docName}]",
            'document_id' => $documentId,
        ]);

        return back()->with('success', "تم حذف وثيقة [{$docName}] بنجاح.");
    }

    /**
     * Update procedural workflow step for tracking (complete, reopen, or skip)
     */
    public function updateWorkflowStep(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'step_key' => ['required', 'string', 'max:100'],
            'is_completed' => ['required', 'boolean'],
            'is_skipped' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'reference' => ['nullable', 'string', 'max:255'],
            'completed_at' => ['nullable', 'date'],
        ]);

        $details = $dossier->details ?? [];
        $workflowSteps = $details['workflow_steps'] ?? [];

        $stepKey = $validated['step_key'];
        $isCompleted = (bool) $validated['is_completed'];
        $isSkipped = ! empty($validated['is_skipped']);

        $workflowSteps[$stepKey] = [
            'is_completed' => $isCompleted,
            'is_skipped' => $isSkipped,
            'completed_at' => $isCompleted ? ($validated['completed_at'] ?? now()->toIso8601String()) : null,
            'completed_by' => auth()->user()->name ?? 'مستخدم المكتب',
            'notes' => $validated['notes'] ?? '',
            'reference' => $validated['reference'] ?? '',
        ];

        $details['workflow_steps'] = $workflowSteps;

        $updates = ['details' => $details];
        if (str_contains($stepKey, 'signing') && $isCompleted && ! $dossier->signing_date) {
            $updates['signing_date'] = now();
            if ($dossier->status === 'draft') {
                $updates['status'] = 'signed';
            }
        } elseif (str_contains($stepKey, 'qadi') && $isCompleted) {
            if (! empty($validated['reference'])) {
                $updates['qadi_reference'] = $validated['reference'];
            }
            $updates['qadi_validation_date'] = now();
        } elseif (str_contains($stepKey, 'tax') && $isCompleted && ! empty($validated['reference'])) {
            $details['dgi_number'] = $validated['reference'];
            $details['dgi_date'] = now()->format('Y-m-d');
            $updates['details'] = $details;
        } elseif (str_contains($stepKey, 'delivery') && $isCompleted) {
            $updates['status'] = 'archived';
        }

        $dossier->update($updates);

        $statusMsg = $isSkipped 
            ? 'تم تحديد المرحلة كـ [معفاة / غير مطلوبة لهذا الملف]' 
            : ($isCompleted ? 'مكتملة بنجاح ✓' : 'إعادة فتح المرحلة قيد المعالجة');

        $dossier->logAction('workflow_step_updated', auth()->id(), [
            'note' => "تحديث مرحلة سير الإجراء [{$stepKey}]: {$statusMsg}",
            'step_key' => $stepKey,
            'is_completed' => $isCompleted,
            'is_skipped' => $isSkipped,
            'reference' => $validated['reference'] ?? null,
        ]);

        return back()->with('success', "تم تحديث المرحلة: {$statusMsg}");
    }

    /**
     * Configure / Customize procedural workflow steps for this dossier or office
     */
    public function configureWorkflow(Request $request, Dossier $dossier): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:save_steps,reset_template,add_step,delete_step,toggle_step'],
            'steps' => ['nullable', 'array'],
            'template_type' => ['nullable', 'string', 'in:family,property,lafif,inheritance,general'],
            'template_key' => ['nullable', 'string', 'in:family,property,lafif,inheritance,general'],
            'step_key' => ['nullable', 'string', 'max:100'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'title_fr' => ['nullable', 'string', 'max:255'],
            'desc_ar' => ['nullable', 'string', 'max:500'],
        ]);

        $details = $dossier->details ?? [];
        $action = $validated['action'];

        if ($action === 'reset_template') {
            $templateType = $validated['template_type'] ?? $validated['template_key'] ?? null;
            $templates = Dossier::getDefaultWorkflowTemplates();
            $newSteps = $templateType && isset($templates[$templateType]) 
                ? $templates[$templateType] 
                : Dossier::getDefaultWorkflowTemplates($dossier->type);

            $details['custom_workflow_steps'] = $newSteps;
            $details['workflow_template_key'] = $templateType;
            $dossier->update(['details' => $details]);

            $dossier->logAction('workflow_configured', auth()->id(), [
                'note' => 'تمت إعادة ضبط مراحل العمل التوثيقي إلى المسار النموذجي المعتمد',
            ]);

            return back()->with('success', 'تمت إعادة ضبط مراحل العمل بنجاح وفق المسار النموذجي.');
        }

        if ($action === 'save_steps') {
            $steps = $validated['steps'] ?? [];
            $formattedSteps = [];
            foreach ($steps as $idx => $st) {
                if (empty($st['title_ar'])) {
                    continue;
                }
                $formattedSteps[] = [
                    'key' => ! empty($st['key']) ? $st['key'] : 'custom_step_' . ($idx + 1),
                    'order' => $idx + 1,
                    'title_ar' => $st['title_ar'],
                    'title_fr' => $st['title_fr'] ?? '',
                    'desc_ar' => $st['desc_ar'] ?? '',
                    'icon' => $st['icon'] ?? 'CheckCircle',
                    'is_enabled' => $st['is_enabled'] ?? true,
                ];
            }

            $details['custom_workflow_steps'] = $formattedSteps;
            $dossier->update(['details' => $details]);

            $dossier->logAction('workflow_configured', auth()->id(), [
                'note' => 'تم حفظ وتخصيص مراحل العمل التوثيقي لهذا الملف بنجاح',
            ]);

            return back()->with('success', 'تم حفظ وتخصيص مراحل المعاملة بنجاح.');
        }

        if ($action === 'add_step') {
            $customSteps = $details['custom_workflow_steps'] ?? Dossier::getDefaultWorkflowTemplates($dossier->type);
            $newKey = 'step_' . time();
            $newOrder = count($customSteps) + 1;

            $titleAr = ! empty($validated['title_ar']) ? $validated['title_ar'] : 'مرحلة إجرائية جديدة';
            $titleFr = ! empty($validated['title_fr']) ? $validated['title_fr'] : 'Nouvelle Étape';
            $descAr = ! empty($validated['desc_ar']) ? $validated['desc_ar'] : 'إجراء مخصص من قبل عدل المكتب';

            $customSteps[] = [
                'key' => $newKey,
                'order' => $newOrder,
                'title_ar' => $titleAr,
                'title_fr' => $titleFr,
                'desc_ar' => $descAr,
                'icon' => 'Clock',
                'is_enabled' => true,
            ];

            $details['custom_workflow_steps'] = array_values($customSteps);
            $dossier->update(['details' => $details]);

            return back()->with('success', "تمت إضافة مرحلة [{$titleAr}] بنجاح.");
        }

        if ($action === 'delete_step') {
            $keyToDelete = $validated['step_key'] ?? '';
            $customSteps = $details['custom_workflow_steps'] ?? Dossier::getDefaultWorkflowTemplates($dossier->type);

            $filtered = array_values(array_filter($customSteps, fn ($s) => ($s['key'] ?? '') !== $keyToDelete));
            foreach ($filtered as $i => &$s) {
                $s['order'] = $i + 1;
            }

            $details['custom_workflow_steps'] = $filtered;
            $dossier->update(['details' => $details]);

            return back()->with('success', 'تم حذف المرحلة بنجاح من مسار الملف.');
        }

        return back();
    }

    /**
     * 1-Click quick advance to complete the current active workflow step
     */
    public function quickAdvanceWorkflow(Request $request, Dossier $dossier): RedirectResponse
    {
        $workflow = $dossier->workflow_progress;
        $currentKey = $workflow['current_step_key'] ?? null;

        if (! $currentKey) {
            return back()->with('info', 'جميع مراحل المعاملة مكتملة بالفعل.');
        }

        // Find step details
        $currentStep = collect($workflow['steps'])->firstWhere('key', $currentKey);
        $stepTitle = $currentStep['title_ar'] ?? $currentKey;

        $request->merge([
            'step_key' => $currentKey,
            'is_completed' => true,
            'completed_at' => now()->format('Y-m-d'),
            'notes' => 'تم التأشير على إكمال المرحلة بنجاح عبر الإجراء السريع (1-Click Advance)',
        ]);

        $this->updateWorkflowStep($request, $dossier);

        return back()->with('success', "تهانينا! تم إنجاز مرحلة [{$stepTitle}] والانتقال إلى المرحلة الموالية.");
    }
}
