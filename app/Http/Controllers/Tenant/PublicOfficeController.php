<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicOfficeController extends Controller
{
    public function show(): Response
    {
        $setting = OfficeSetting::first();
        $officeSetting = $setting ? $setting->toArray() : [
            'office_name_ar' => 'مكتب الأستاذ - عدل محلف',
            'office_name_fr' => 'Cabinet de Notariat Traditionnel (Adoul)',
            'city' => 'المملكة المغربية',
            'phone' => '+212 500 000 000',
            'email' => 'contact@adoul.ma',
            'address' => 'شارع الحسن الثاني، عمارة التوثيق',
            'qadi_name' => 'قاضي التوثيق بالمحكمة الابتدائية المختصة',
            'color_primary' => '#0d5f47',
            'theme_color' => 'emerald',
        ];

        $services = [
            [
                'type' => 'marriage',
                'title_ar' => 'توثيق عقود الزواج',
                'title_fr' => 'Actes de mariage',
                'desc_ar' => 'تحرير رسمي لعقد الزواج وفق مقتضيات مدونة الأسرة مع الإشهاد الشرعي والتأشير القضائي.',
            ],
            [
                'type' => 'property_sale',
                'title_ar' => 'المعاملات العقارية والبيوع',
                'title_fr' => 'Transactions immobilières',
                'desc_ar' => 'توثيق بيوع العقارات غير المحفظة والمطالب، والقسمة الرضائية والهبات والرهون الحيازية.',
            ],
            [
                'type' => 'poa',
                'title_ar' => 'الوكالات القانونية الرسمية',
                'title_fr' => 'Procurations notariées',
                'desc_ar' => 'إعداد التوكيلات العامة والخاصة لإدارة الأملاك وسحب الوثائق والتمثيل أمام الإدارات.',
            ],
            [
                'type' => 'will',
                'title_ar' => 'الوصايا والإراثة الشرعية',
                'title_fr' => 'Successions et testaments',
                'desc_ar' => 'إحصاء المتروكات ورسوم الإراثة وحصر الورثة والوصية في حدود الثلث الشرعي.',
            ],
            [
                'type' => 'divorce',
                'title_ar' => 'إشهادات الطلاق والخلع والرجعة',
                'title_fr' => 'Divorces et révocations',
                'desc_ar' => 'توثيق مقررات المحكمة في الطلاق الاتفاقي والخلع والرجعة الزوجية بمحضر الشهود.',
            ],
        ];

        return Inertia::render('tenant/public-profile', [
            'tenant' => [
                'id' => 'cabinet',
                'name' => $officeSetting['office_name_ar'],
                'city' => $officeSetting['city'],
                'phone' => $officeSetting['phone'] ?? '',
                'email' => $officeSetting['email'] ?? '',
            ],
            'officeSetting' => $officeSetting,
            'services' => $services,
        ]);
    }

    public function requestAppointment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_name' => ['required', 'string', 'max:255'],
            'client_phone' => ['required', 'string', 'max:30'],
            'client_email' => ['nullable', 'email', 'max:255'],
            'type' => ['required', 'string'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Appointment::create([
            'client_id' => null,
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'],
            'client_email' => $validated['client_email'] ?? null,
            'type' => $validated['type'],
            'scheduled_at' => $validated['preferred_date'].' 10:00:00',
            'duration_minutes' => 30,
            'status' => 'pending',
            'is_citizen_request' => true,
            'notes' => $validated['notes'] ? 'طلب عبر البوابة: '.$validated['notes'] : 'طلب موعد مواطن عبر البوابة',
        ]);

        return back()->with('success', 'شكراً لكم! تم إرسال طلب الموعد بنجاح إلى مكتب العدل. سيقوم كاتب المكتب بالاتصال بكم عبر الهاتف لتأكيد الموعد النهائي.');
    }

    public function requestCopy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'applicant_name' => ['required', 'string', 'max:255'],
            'applicant_cin' => ['required', 'string', 'max:50'],
            'applicant_phone' => ['required', 'string', 'max:50'],
            'applicant_email' => ['nullable', 'email', 'max:255'],
            'act_type' => ['required', 'string'],
            'act_year' => ['nullable', 'string', 'max:10'],
            'parties_names' => ['required', 'string', 'max:500'],
            'delivery_mode' => ['required', 'string', 'in:pickup,postal_mre,email_scan'],
            'country_city' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $modeText = match ($validated['delivery_mode']) {
            'postal_mre' => 'إرسال بريدي / إرسالية دولية (MRE)',
            'email_scan' => 'نسخة إلكترونية أولية عبر البريد الإلكتروني',
            default => 'سحب واستلام مباشر من مكتب العدل',
        };

        $notesFormatted = "【طلب استخراج نظير أو نسخة رسمية من رسم عدلي قديم】\n"
            . "• صاحب الطلب: {$validated['applicant_name']} (ب.ت.و/جواز: {$validated['applicant_cin']})\n"
            . "• نوع المحرر المطلوب: {$validated['act_type']}\n"
            . "• السنة أو التاريخ التقريبي للإبرام: " . ($validated['act_year'] ?: 'غير محدد') . "\n"
            . "• أسماء المعنيين بالرسم (الأطراف): {$validated['parties_names']}\n"
            . "• وجهة أو طريقة الاستلام: {$modeText}\n"
            . ($validated['country_city'] ? "• بلد / مدينة الإقامة: {$validated['country_city']}\n" : "")
            . ($validated['notes'] ? "• ملاحظات إضافية: {$validated['notes']}" : "");

        Appointment::create([
            'client_id' => null,
            'client_name' => $validated['applicant_name'],
            'client_phone' => $validated['applicant_phone'],
            'client_email' => $validated['applicant_email'] ?? null,
            'type' => 'copy_extract',
            'scheduled_at' => now()->addDays(2)->setTime(10, 0),
            'duration_minutes' => 30,
            'status' => 'pending',
            'is_citizen_request' => true,
            'notes' => $notesFormatted,
        ]);

        return back()->with('success', 'تم تسجيل طلب استخراج النظير/النسخة الرسمية بنجاح! سيقوم كاتب التوثيق بالبحث في سجلات المحفوظات والتواصل معكم لتأكيد جاهزية الوثيقة.');
    }

    public function trackDossier(Request $request): JsonResponse
    {
        $reference = trim((string) $request->input('reference', ''));
        if (empty($reference)) {
            return response()->json(['success' => false, 'message' => 'يرجى إدخال الرقم المرجعي للملف.'], 422);
        }

        $dossier = Dossier::with(['client', 'client2'])
            ->where('reference', $reference)
            ->orWhere('reference', 'LIKE', "%{$reference}%")
            ->first();

        if (! $dossier) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على أي ملف يطابق هذا الرقم المرجعي. يرجى التأكد من كتابة الرقم بدقة أو الاتصال بكتابة المكتب.',
            ], 404);
        }

        $cin = trim((string) $request->input('cin', ''));
        if ($cin !== '') {
            $client1Cin = $dossier->client?->cin;
            $client2Cin = $dossier->client2?->cin;
            if (
                ($client1Cin && strcasecmp(trim($client1Cin), $cin) !== 0) &&
                (! $client2Cin || strcasecmp(trim($client2Cin), $cin) !== 0)
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم بطاقة التعريف الوطنية غير متطابق مع أطراف هذا الملف، وذلك حماية لسرية المعاملات والبيانات الشخصية.',
                ], 403);
            }
        }

        $statusOrder = [
            'reception' => 1,
            'draft' => 1,
            'court_permission' => 2,
            'tax_payment' => 3,
            'qadi_homologation' => 4,
            'pending_qadi' => 4,
            'signed' => 4,
            'delivered' => 5,
            'archived' => 5,
            'cancelled' => 0,
        ];

        $currentStep = $statusOrder[$dossier->status] ?? 1;

        $maskName = function (?string $name) {
            if (! $name) return '***';
            $parts = explode(' ', trim($name));
            $masked = array_map(function ($part) {
                $len = mb_strlen($part, 'UTF-8');
                if ($len <= 2) return $part;
                return mb_substr($part, 0, 1, 'UTF-8') . '***';
            }, $parts);
            return implode(' ', $masked);
        };

        $typeLabels = [
            'marriage' => 'توثيق عقد زواج شرعي',
            'property_sale' => 'رسم بيع عقاري (ملك عدلي)',
            'property_gift' => 'رسم هبة وصدقة',
            'poa' => 'وكالة رسمية خاصة / عامة',
            'will' => 'رسم إراثة أو وصية شرعية',
            'divorce' => 'إشهاد طلاق أو اتفاق',
            'conversion_islam' => 'شهادة اعتناق الإسلام (مجانية)',
            'indigent_marriage' => 'عقد زواج معوزين (مجاني)',
            'commercial' => 'عقد معاملة تجارية',
            'pledge' => 'رسم رهن حيازي أو رسمي',
        ];

        $stages = [
            [
                'step' => 1,
                'name_ar' => 'تلقي الإشهاد وتدوينه بالمذكرة',
                'name_fr' => 'Réception & inscription au carnet',
                'desc_ar' => 'تم تلقي تصريحات الأطراف وتدوينها تحت أرقام مذكرة الحفظ القانونية طبقاً للمادة 24 من القانون 16.03.',
            ],
            [
                'step' => 2,
                'name_ar' => 'استيفاء الوثائق والإذن القضائي',
                'name_fr' => 'Autorisation judiciaire préalable',
                'desc_ar' => 'التحقق من الوثائق الثبوتية وشواهد الملكية أو ترخيص قاضي الأسرة بالزواج.',
            ],
            [
                'step' => 3,
                'name_ar' => 'أداء واجبات التسجيل والتمبر',
                'name_fr' => 'Paiement DGI & Enregistrement',
                'desc_ar' => 'أداء الواجبات الجبائية لدى إدارة الضرائب وقباضة التسجيل والتنبر.',
            ],
            [
                'step' => 4,
                'name_ar' => 'مخاطبة قاضي التوثيق (الخطاب)',
                'name_fr' => 'Homologation par le Juge (Khitab)',
                'desc_ar' => 'عرض الوثيقة على السيد قاضي التوثيق بالمحكمة الابتدائية للمراقبة والخطاب عليها لتكتسب الحجية الرسمية.',
            ],
            [
                'step' => 5,
                'name_ar' => 'تسليم النسخة الرسمية / النظير',
                'name_fr' => 'Délivrance de l\'expédition',
                'desc_ar' => 'الرسم جاهز للتسليم لأصحابه وحفظ الأصل في كناش التضمين ومحفوظات المحكمة.',
            ],
        ];

        $stageList = array_map(function ($s) use ($currentStep, $dossier) {
            $state = 'pending';
            if ($dossier->status === 'cancelled') {
                $state = 'cancelled';
            } elseif ($s['step'] < $currentStep) {
                $state = 'completed';
            } elseif ($s['step'] === $currentStep) {
                $state = in_array($dossier->status, ['delivered', 'archived']) ? 'completed' : 'current';
            }
            return array_merge($s, ['state' => $state]);
        }, $stages);

        $clientName = $dossier->client?->name_ar;
        $client2Name = $dossier->client2?->name_ar;
        $partiesText = $maskName($clientName) . ($client2Name ? ' مع ' . $maskName($client2Name) : '');

        $result = [
            'found' => true,
            'reference' => $dossier->reference,
            'type_key' => $dossier->type,
            'type_label' => $typeLabels[$dossier->type] ?? 'محرر توثيقي رسمي',
            'status' => $dossier->status,
            'current_step' => $currentStep,
            'parties_masked' => $partiesText,
            'act_date' => $dossier->act_date ? $dossier->act_date->format('Y-m-d') : null,
            'qadi_reference' => $dossier->qadi_reference,
            'qadi_validation_date' => $dossier->qadi_validation_date ? $dossier->qadi_validation_date->format('Y-m-d') : null,
            'stages' => $stageList,
        ];

        return response()->json([
            'success' => true,
            'dossier' => $result,
        ]);
    }
}
