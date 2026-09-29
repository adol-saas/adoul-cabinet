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
                'category' => 'family',
                'title_ar' => 'توثيق عقود الزواج الشرعي',
                'title_fr' => 'Actes de Mariage Authentifiés',
                'desc_ar' => 'تحرير رسمي وموثق لعقد الزواج وفق مقتضيات مدونة الأسرة المغربية مع الإشهاد الشرعي لعدلين وتضمين الرسم ومخاطبة السيد قاضي الأسرة المكلف بالزواج.',
                'delay_ar' => 'خلال 24 إلى 48 ساعة من استيفاء الوثائق',
                'badge_ar' => 'الأكثر طلباً',
                'required_docs_ar' => [
                    'نسخة كاملة من رسم الولادة لكلا الخطيبين (أقل من 3 أشهر)',
                    'نسخة من بطاقة التعريف الوطنية الإلكترونية لكلا الطرفين والشاهدين',
                    'الشهادة الإدارية للخطوبة أو العزوبة (تسلم من السلطة المحلية)',
                    'الشهادة الطبية الخاصة بالزواج لكل من الخاطب والمخطوبة',
                    'إذن القاضي في حالات زواج القاصر، التعدد، أو زواج الأجانب',
                ],
            ],
            [
                'type' => 'property_sale',
                'category' => 'property',
                'title_ar' => 'المعاملات والبيوع العقارية',
                'title_fr' => 'Transactions Immobilières & Ventes',
                'desc_ar' => 'توثيق بيوع العقارات المحفظة وغير المحفظة، الشقق، الأراضي الفلاحية، والتصرفات العينية مع استيفاء واجبات إدارة الضرائب (DGI) والتسجيل بالمحافظة العقارية (ANCFCC).',
                'delay_ar' => 'حسب جاهزية الإبراء الجبائي والشهادة العقارية',
                'badge_ar' => 'ضمانة قانونية',
                'required_docs_ar' => [
                    'بطائق التعريف الوطنية للبائع والمشتري',
                    'أصل الملكية أو الشهادة العقارية المحينة من المحافظة',
                    'شهادة الإبراء الضريبي (Quitus fiscal) من قباضة الضرائب',
                    'التصاميم الهندسية أو رخصة البناء والتجزئة (إن وجدت)',
                ],
            ],
            [
                'type' => 'will',
                'category' => 'inheritance',
                'title_ar' => 'رسوم الإراثة والفرائض الشرعية والوصايا',
                'title_fr' => 'Successions, Farida & Testaments',
                'desc_ar' => 'حصر الورثة وإحصاء المتروكات وحساب الفريضة الشرعية الشرطية طبقاً لأحكام الميراث الشرعي في الفقه المالكي ومدونة الأسرة مع الخطاب القضائي.',
                'delay_ar' => '24 إلى 72 ساعة',
                'badge_ar' => 'دقة حسابية',
                'required_docs_ar' => [
                    'شهادة الوفاة الأصلية للمورث',
                    'عقود ولادة الورثة وعقد زواج الأرمل/الأرملة أو الحالة المدنية',
                    'بطائق التعريف الوطنية للورثة أو وكالاتهم الرسمية',
                    'شهادة شهود العرف (إذا تطلب الأمر إثبات عدم وجود ورثة آخرين)',
                ],
            ],
            [
                'type' => 'mulkiya_lafif',
                'category' => 'lafif',
                'title_ar' => 'شهادات الملكية واللفيف الشرعي (12 شاهداً)',
                'title_fr' => ' رسم استمرار الملك وشهادة اللفيف الشرعي',
                'desc_ar' => 'إثبات أصل التملك، الحيازة والتصرف في العقارات غير المحفظة بسماع شهادة 12 شاهداً عارفين بالملك والحدود والجوار ومخاطبة قاضي التوثيق.',
                'delay_ar' => 'تحدد بناء على حضور الشهود والمعاينة',
                'badge_ar' => 'إثبات الملكية',
                'required_docs_ar' => [
                    'بطاقة تعريف طالب الشهادة',
                    'لائحة وأسماء الـ 12 شاهداً مع أرقام بطائقهم الوطنية وعناوينهم',
                    'التحديد الطبوغرافي أو الحدود الأربعة والمساحة التقديرية للعقار',
                    'شهادة إدارية بعدم الصبغة الجماعية أو الأحباس أو ملك الدولة',
                ],
            ],
            [
                'type' => 'poa',
                'category' => 'powers',
                'title_ar' => 'الوكالات القانونية والتفويضات الرسمية',
                'title_fr' => 'Procurations Notariées & Mandats',
                'desc_ar' => 'إعداد وصياغة التوكيلات العامة والخاصة لتدبير العقارات، سحب الوثائق، البيع والشراء، والتمثيل القانوني أمام المحاكم والإدارات العمومية والبنوك.',
                'delay_ar' => 'نفس اليوم (خلال ساعات الدوام)',
                'badge_ar' => 'تسليم فوري',
                'required_docs_ar' => [
                    'بطاقة التعريف الوطنية للموكّل والوكيل (أو صورها المؤكدة)',
                    'تحديد صلاحيات الوكالة وموضوعها بدقة وحصر مراجع الأملاك',
                ],
            ],
            [
                'type' => 'divorce',
                'category' => 'family',
                'title_ar' => 'إشهادات الطلاق والخلع والرجعة الشرعية',
                'title_fr' => 'Actes de Divorce, Khoul & Rajâa',
                'desc_ar' => 'توثيق مقررات المحكمة وقسم قضاء الأسرة في الطلاق الاتفاقي، التطليق، الخلع الرضائي، وإشهادات الرجعة خلال فترة العدة القانونية.',
                'delay_ar' => 'حسب تاريخ الجلسة والإذن القضائي',
                'badge_ar' => 'إشراف قضائي',
                'required_docs_ar' => [
                    'إذن المحكمة بالإشهاد على الطلاق أو نسخة الحكم النهائي',
                    'بطائق التعريف الوطنية للزوجين والحاضرين',
                    'عقد الزواج الأصلي موضوع الطلاق أو الرجعة',
                ],
            ],
            [
                'type' => 'donation',
                'category' => 'property',
                'title_ar' => 'عقود الهبة والصدقة والتبرعات',
                'title_fr' => 'Donations, Aumônes & Démembrements',
                'desc_ar' => 'توثيق هبات العقارات والأموال بين الأقارب والأصول والفروع مع تنظيم شروط الحوز وحق الانتفاع والمنافع وفق مدونة الحقوق العينية.',
                'delay_ar' => 'خلال يومين إلى 3 أيام عمل',
                'badge_ar' => 'تنظيم أملاك الأسرة',
                'required_docs_ar' => [
                    'بطائق التعريف الوطنية للواهب والموهوب له',
                    'أصل الملكية أو الشهادة العقارية المحينة',
                    'وثائق إثبات القرابة (رسم الولادة أو الحالة المدنية)',
                ],
            ],
            [
                'type' => 'tarakah_qisma',
                'category' => 'inheritance',
                'title_ar' => 'القسمة الرضائية وتصفية التركات',
                'title_fr' => 'Partage Successoral Amiable',
                'desc_ar' => 'إبرام عقود القسمة الرضائية وتصفية المتروكات العقارية والمنقولة بين الورثة أو الشركاء على الشياع مع احترام الفريضة الشرعية ومبادلات الأنصبة.',
                'delay_ar' => 'حسب توافق الشركاء ومعاينة التركة',
                'badge_ar' => 'حل ودي وتوافقي',
                'required_docs_ar' => [
                    'رسم الإراثة المخاطب عليه شرعاً',
                    'أصول تملك العقارات والمنقولات موضوع القسمة',
                    'حضور كافة الشركاء أو من ينوب عنهم بوكالة رسمية مفصلة',
                ],
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
