<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Convention;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConventionController extends Controller
{
    public function index(): Response
    {
        // Auto-seed official Moroccan conventions if table is empty
        if (Convention::count() === 0) {
            $this->seedDefaultConventions();
        }

        $conventions = Convention::latest('issued_date')->latest()->paginate(12)->withQueryString();

        return Inertia::render('tenant/conventions/index', [
            'conventions' => $conventions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title_ar' => ['required', 'string', 'max:255'],
            'title_fr' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'category' => ['required', 'string', 'max:50'],
            'description_ar' => ['nullable', 'string'],
            'description_fr' => ['nullable', 'string'],
            'issued_date' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:20480'],
        ]);

        $filePath = '/documents/conventions/circulaire_officielle_'.time().'.pdf';

        if ($request->hasFile('file')) {
            $uploadedPath = $request->file('file')->store('conventions', 'public');
            $filePath = '/storage/'.$uploadedPath;
        }

        $convention = Convention::create([
            'title_ar' => trim($validated['title_ar']),
            'title_fr' => ! empty($validated['title_fr']) ? trim($validated['title_fr']) : trim($validated['title_ar']),
            'reference_number' => $validated['reference_number'] ? trim($validated['reference_number']) : null,
            'category' => trim($validated['category']),
            'description_ar' => $validated['description_ar'] ?? null,
            'description_fr' => $validated['description_fr'] ?? null,
            'issued_date' => $validated['issued_date'] ?? now()->toDateString(),
            'file_path' => $filePath,
        ]);

        return back()->with('success', "تمت إضافة ونشر الدورية الرسمية [{$convention->title_ar}] بنجاح.");
    }

    public function destroy(Convention $convention): RedirectResponse
    {
        $title = $convention->title_ar;
        $convention->delete();

        return back()->with('success', "تم حذف الدورية [{$title}] بنجاح.");
    }

    private function seedDefaultConventions(): void
    {
        $defaultDocs = [
            [
                'reference_number' => 'منشور-وزارة-العدل-2026/04',
                'title_ar' => 'دورية وزارة العدل حول التبادل الرقمي وتأشير قضاة التوثيق على الرسوم العدلية',
                'title_fr' => 'Circulaire du Ministère de la Justice sur l’échange numérique et l’homologation des actes',
                'description_ar' => 'الإطار المرجعي المنظم للإيداع الإلكتروني للمحررات والعقود الرسمية ومخاطبة السادة قضاة التوثيق بالمحاكم الابتدائية بالمملكة.',
                'description_fr' => 'Cadre de référence pour le dépôt dématérialisé des actes et l’homologation judiciaire auprès des tribunaux de première instance.',
                'file_path' => '/documents/conventions/circulaire_ministere_justice_2026.pdf',
                'category' => 'ministry',
                'issued_date' => now()->subDays(15)->toDateString(),
            ],
            [
                'reference_number' => 'دورية-ANCFCC-2026/418',
                'title_ar' => 'دورية المحافظ العام للوكالة الوطنية للمحافظة العقارية بشأن تقييد الرسوم والبيوع العدلية',
                'title_fr' => 'Circulaire du Conservateur Général (ANCFCC) sur l’inscription des actes adoulaires',
                'description_ar' => 'المعايير المعتمدة لتقييد عقود البيع، القسمة، والرهون الرسمية المنجزة من طرف السادة العدول لدى المحافظات العقارية والمسح العقاري.',
                'description_fr' => 'Normes et procédures d’immatriculation foncière des ventes, partages et hypothèques établis par les adoul.',
                'file_path' => '/documents/conventions/circulaire_ancfcc_adoul_2026.pdf',
                'category' => 'ancfcc',
                'issued_date' => now()->subMonths(1)->toDateString(),
            ],
            [
                'reference_number' => 'منشور-DGI-2026/735',
                'title_ar' => 'دورية المديرية العامة للضرائب حول إجراءات التسجيل والأداء الإلكتروني لرسوم العقود',
                'title_fr' => 'Note circulaire de la DGI relative à l’enregistrement électronique des actes notariés',
                'description_ar' => 'تفصيل مقتضيات قانون المالية والإعفاءات والواجبات النسبية والثابتة المطبقة على عقود التفويتات العقارية والتبرعات والإراثة.',
                'description_fr' => 'Dispositions de la loi de finances relatives aux droits d’enregistrement des mutations immobilières et successions.',
                'file_path' => '/documents/conventions/circulaire_dgi_enregistrement_2026.pdf',
                'category' => 'taxes',
                'issued_date' => now()->subMonths(2)->toDateString(),
            ],
            [
                'reference_number' => 'ميثاق-الهيئة-الوطنية-2026/01',
                'title_ar' => 'ميثاق الشرف والسر المهني الصادر عن الهيئة الوطنية لعدول المغرب',
                'title_fr' => 'Code de déontologie et de secret professionnel de l’Ordre National des Adoul',
                'description_ar' => 'القواعد الأخلاقية والمهنية الملزمة لمكاتب التوثيق العدلي لحماية أسرار الموكلين وضمان الأمان التوثيقي ومصالح الأطراف المتعاقدة.',
                'description_fr' => 'Règles déontologiques obligatoires pour les études adoulaires garantissant la sécurité contractuelle et le secret professionnel.',
                'file_path' => '/documents/conventions/charte_deontologie_adoul_2026.pdf',
                'category' => 'order',
                'issued_date' => now()->subMonths(3)->toDateString(),
            ],
            [
                'reference_number' => 'دورية-النيابة-العامة-2026/19',
                'title_ar' => 'دورية رئاسة النيابة العامة حول مساطر الإذن بالزواج ومقتضيات مدونة الأسرة',
                'title_fr' => 'Circulaire du Ministère Public relative aux autorisations de mariage et code de la famille',
                'description_ar' => 'التوجيهات الرسمية المشتركة في شأن تدقيق الوثائق الثبوتية والشهادات الإدارية قبل إبرام إشهادات الزواج الشرعي.',
                'description_fr' => 'Orientations officielles pour le contrôle documentaire et les autorisations judiciaires préalables au mariage.',
                'file_path' => '/documents/conventions/circulaire_ministere_public_mariage.pdf',
                'category' => 'judiciary',
                'issued_date' => now()->subMonths(4)->toDateString(),
            ],
            [
                'reference_number' => 'اتفاقية-CDG-2026/02',
                'title_ar' => 'اتفاقية التعاون مع صندوق الإيداع والتدبير (CDG) لحفظ ودائع المعاملات العقارية',
                'title_fr' => 'Convention de partenariat avec la CDG pour la sécurisation des dépôts des actes',
                'description_ar' => 'آليات فتح الحسابات المهنية وإيداع مبالغ البيوع والضمانات البنكية الخاصة بالمحررات التوثيقية لضمان حقوق المشترين والبائعين.',
                'description_fr' => 'Dispositif de séquestre et sécurisation financière des transactions immobilières instrumentées par les adoul.',
                'file_path' => '/documents/conventions/convention_cdg_adoul_2026.pdf',
                'category' => 'finance',
                'issued_date' => now()->subMonths(5)->toDateString(),
            ],
        ];

        foreach ($defaultDocs as $doc) {
            Convention::updateOrCreate(
                ['reference_number' => $doc['reference_number']],
                $doc
            );
        }
    }
}
