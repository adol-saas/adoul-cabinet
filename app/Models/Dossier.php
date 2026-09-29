<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dossier extends Model
{
    protected $fillable = [
        'reference',
        'type',
        'status',
        'client_id',
        'client2_id',
        'adoul_id',
        'amount_due',
        'amount_paid',
        'notes_ar',
        'notes_fr',
        'act_date',
        'signing_date',
        'qadi_validation_date',
        'qadi_reference',
        'details',
        'documents',
    ];

    protected function casts(): array
    {
        return [
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'act_date' => 'date',
            'signing_date' => 'date',
            'qadi_validation_date' => 'date',
            'details' => 'array',
            'documents' => 'array',
        ];
    }

    protected $appends = [
        'dgi_status',
        'circuit_stage',
        'workflow_progress',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function client2(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client2_id');
    }

    public function adoul(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adoul_id');
    }

    public function secondAdoul(): ?User
    {
        $id = $this->details['second_adoul_id'] ?? null;
        return $id ? User::find($id) : null;
    }

    public function actLogs(): HasMany
    {
        return $this->hasMany(ActLog::class, 'dossier_id')->latest();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'dossier_id');
    }

    /**
     * Compute DGI 30-day legal registration deadline according to CGI Art. 128
     */
    public function getDgiStatusAttribute(): array
    {
        $details = $this->details ?? [];
        $isRegistered = ! empty($details['dgi_number']);
        $refDate = $this->act_date ?? $this->created_at;

        if ($isRegistered) {
            return [
                'is_registered' => true,
                'dgi_number' => $details['dgi_number'],
                'dgi_date' => $details['dgi_date'] ?? null,
                'dgi_amount' => $details['dgi_amount'] ?? 0,
                'status_label' => 'مسجل بإدارة الضرائب SIMPL-Adoul',
                'badge_variant' => 'emerald',
                'days_remaining' => 0,
                'is_overdue' => false,
            ];
        }

        if (! $refDate) {
            return [
                'is_registered' => false,
                'status_label' => 'قيد الانتظار',
                'badge_variant' => 'outline',
                'days_remaining' => 30,
                'is_overdue' => false,
            ];
        }

        $deadline = \Carbon\Carbon::parse($refDate)->addDays(30);
        $daysRemaining = (int) now()->diffInDays($deadline, false);
        $isOverdue = $daysRemaining < 0;

        return [
            'is_registered' => false,
            'dgi_number' => null,
            'deadline_date' => $deadline->format('Y-m-d'),
            'days_remaining' => max(0, $daysRemaining),
            'is_overdue' => $isOverdue,
            'status_label' => $isOverdue 
                ? 'متأخر عن أجل 30 يوماً القانوني (تخضع لذعيرة 15%)' 
                : ($daysRemaining <= 7 ? "أجل وشيك: متبقي {$daysRemaining} أيام للتسجيل" : "متبقي {$daysRemaining} يوماً للتسجيل الجبائي"),
            'badge_variant' => $isOverdue ? 'destructive' : ($daysRemaining <= 7 ? 'gold' : 'outline'),
        ];
    }

    /**
     * Get Judicial Circuit Stage progression
     */
    public function getCircuitStageAttribute(): string
    {
        $details = $this->details ?? [];
        if (! empty($details['dgi_number']) && ! empty($this->qadi_reference)) {
            return 'dgi_registered';
        }
        if (! empty($this->qadi_reference) || ! empty($this->qadi_validation_date)) {
            return 'khotiba';
        }
        if ($this->status === 'pending_qadi') {
            return 'court_deposit';
        }
        if ($this->signing_date || $this->status === 'signed') {
            return 'signed_adoul';
        }

        return 'draft';
    }

    /**
     * Official Moroccan Adoul workflow templates categorized by act nature
     */
    public static function getDefaultWorkflowTemplates(?string $type = null): array
    {
        $templates = [
            // 1. Family & Personal Status (زواج، طلاق، رجعة، ثبوت زوجية، حضانة)
            'family' => [
                [
                    'key' => 'intake',
                    'order' => 1,
                    'title_ar' => 'تلقي الإشهاد والاستقبال',
                    'title_fr' => 'Réception & Dépôt',
                    'desc_ar' => 'تسجيل الأطراف والتحقق من الهويات والأهلية الشرعية والسن القانوني',
                    'icon' => 'UserCheck',
                ],
                [
                    'key' => 'docs_permits',
                    'order' => 2,
                    'title_ar' => 'فحص الوثائق والإذن القضائي',
                    'title_fr' => 'Instruction & Autorisations',
                    'desc_ar' => 'استيفاء رخصة الزواج/الطلاق، الفحص الطبي، شواهد العزوبة أو عدم الطلاق',
                    'icon' => 'FileCheck',
                ],
                [
                    'key' => 'drafting',
                    'order' => 3,
                    'title_ar' => 'التدوين بمذكرة الحفظ وسماع الإيجاب والقبول',
                    'title_fr' => 'Rédaction & مذكرة الحفظ',
                    'desc_ar' => 'تحرير بيانات العقد والشروط وتحديد الصداق والمهر بمذكرة الحفظ المادية',
                    'icon' => 'FileText',
                ],
                [
                    'key' => 'signing',
                    'order' => 4,
                    'title_ar' => 'الإشهاد وتوقيع الأطراف والعدلين',
                    'title_fr' => 'Signature & Clôture',
                    'desc_ar' => 'قراءة المحرر وتوقيع الزوجين والشاهدين والعدلين المتعاقدين في المذكرة',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'key' => 'court_qadi',
                    'order' => 5,
                    'title_ar' => 'إيداع المحكمة وخطاب قاضي الأسرة',
                    'title_fr' => 'Khitab du Qadi & Tadmin',
                    'desc_ar' => 'عرض العقد على قاضي الأسرة المكلف بالتوثيق للخطاب عليه وتضمينه بسجل عقود الزواج',
                    'icon' => 'Scale',
                ],
                [
                    'key' => 'civil_status',
                    'order' => 6,
                    'title_ar' => 'إشعار ضابط الحالة المدنية (المادة 68)',
                    'title_fr' => 'Avis à l\'État Civil',
                    'desc_ar' => 'توجيه ملخص العقد لضابط الحالة المدنية لمحل ولادة الزوجين داخل أجل 15 يوماً',
                    'icon' => 'Send',
                ],
                [
                    'key' => 'delivery',
                    'order' => 7,
                    'title_ar' => 'تسليم النظير للزوجة وملخص الزوج والأرشفة',
                    'title_fr' => 'Délivrance & Archivage',
                    'desc_ar' => 'تسليم النظير المختوم للزوجة والملخص للزوج وحفظ أصل المحرر في أرشيف المكتب',
                    'icon' => 'CheckCircle2',
                ],
            ],

            // 2. Real Estate & Commercial Transactions (بيع، معاوضة، هبة، رهن، قسمة عقارية)
            'property' => [
                [
                    'key' => 'intake',
                    'order' => 1,
                    'title_ar' => 'استقبال الأطراف والتحقق من الهوية والأهلية',
                    'title_fr' => 'Réception & Identité',
                    'desc_ar' => 'التحقق من هوية البائع والمشتري والأهلية المدنية وخلوهما من موانع التصرف',
                    'icon' => 'UserCheck',
                ],
                [
                    'key' => 'title_check',
                    'order' => 2,
                    'title_ar' => 'فحص صك الملكية والإبراء الجبائي والتعمير',
                    'title_fr' => 'Examen du Titre & Quitus',
                    'desc_ar' => 'مراجعة شهادة الملكية من المحافظة العقارية، الإبراء الجبائي الضريبي، ورخصة السكن/المطابقة',
                    'icon' => 'FileCheck',
                ],
                [
                    'key' => 'drafting',
                    'order' => 3,
                    'title_ar' => 'تسويد عقد المعاملة والتقييد بمذكرة الحفظ',
                    'title_fr' => 'Rédaction au Brouillard',
                    'desc_ar' => 'صياغة أركان البيع، الثمن، المشتملات، الحدود، وضمانات العيوب الخفية',
                    'icon' => 'FileText',
                ],
                [
                    'key' => 'signing',
                    'order' => 4,
                    'title_ar' => 'توقيع الأطراف والعدلين في مذكرة الحفظ',
                    'title_fr' => 'Signature des Parties & Adouls',
                    'desc_ar' => 'تلاوة العقد، أداء الثمن أو إيداعه، وتوقيع المتعاقدين والعدلين مع البصمة',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'key' => 'tax_dgi',
                    'order' => 5,
                    'title_ar' => 'التسجيل الجبائي لدى إدارة الضرائب (DGI)',
                    'title_fr' => 'Enregistrement Fiscal SIMPL',
                    'desc_ar' => 'التصريح وأداء واجبات التسجيل والتمبر عبر بوابة SIMPL-Adoul خلال أجل 30 يوماً',
                    'icon' => 'Receipt',
                ],
                [
                    'key' => 'court_qadi',
                    'order' => 6,
                    'title_ar' => 'إيداع المحكمة وخطاب قاضي التوثيق والتضمين',
                    'title_fr' => 'Khitab du Qadi & Tadmin',
                    'desc_ar' => 'تأشير قاضي التوثيق المشرف والتضمين بسجلات المحكمة الابتدائية المختصة',
                    'icon' => 'Scale',
                ],
                [
                    'key' => 'ancfcc',
                    'order' => 7,
                    'title_ar' => 'التقييد بالمحافظة العقارية (ANCFCC)',
                    'title_fr' => 'Inscription Conservation Foncière',
                    'desc_ar' => 'إيداع الملف بالوكالة الوطنية للمحافظة العقارية ونقل ملكية الصك العقاري للمشتري',
                    'icon' => 'Building2',
                ],
                [
                    'key' => 'delivery',
                    'order' => 8,
                    'title_ar' => 'تسليم النظير وشهادة الملكية المحينة والأرشفة',
                    'title_fr' => 'Délivrance & Archivage',
                    'desc_ar' => 'تسليم النظير المخاطب عليه ونظير الرسم العقاري للأطراف وأرشفة الملف رقمياً',
                    'icon' => 'CheckCircle2',
                ],
            ],

            // 3. Lafif (شهادة اللفيف الشرعي - 12 شاهداً)
            'lafif' => [
                [
                    'key' => 'intake',
                    'order' => 1,
                    'title_ar' => 'تلقي الطلب وتحديد موضوع الشهادة ومحلها',
                    'title_fr' => 'Réception de la Demande',
                    'desc_ar' => 'استقبال طالب الشهادة وتحديد موضوع إثبات الملكية أو الحيازة أو التصرف المعتبر',
                    'icon' => 'UserCheck',
                ],
                [
                    'key' => 'preliminary_inquiry',
                    'order' => 2,
                    'title_ar' => 'فحص الوثائق وتحديد الحدود والمجاورين',
                    'title_fr' => 'Instruction & Délimitation',
                    'desc_ar' => 'التأكد من خلو العقار من النزاعات القضائية ومراجعة الحدود والمساحة والشهادات الإدارية',
                    'icon' => 'FileCheck',
                ],
                [
                    'key' => 'lafif_witnesses',
                    'order' => 3,
                    'title_ar' => 'استدعاء وسماع شهادة الـ 12 شاهداً والتحقق من القوادح',
                    'title_fr' => 'Audition des 12 Témoins',
                    'desc_ar' => 'حضور الشهود الاثنا عشر وسماع شهادتهم فرادى أو جماعة والتأكد من أهليتهم وسلامتهم من القوادح',
                    'icon' => 'Users',
                ],
                [
                    'key' => 'drafting_signing',
                    'order' => 4,
                    'title_ar' => 'تدوين شهادة اللفيف بمذكرة الحفظ وتوقيع الشهود والعدلين',
                    'title_fr' => 'Rédaction & Signatures',
                    'desc_ar' => 'تحرير نص شهادة اللفيف بالتفصيل وتوقيع الشهود الـ 12 وتوقيع العدلين المنتصبين للإشهاد',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'key' => 'court_qadi',
                    'order' => 5,
                    'title_ar' => 'إيداع المحكمة وخطاب قاضي التوثيق والتضمين',
                    'title_fr' => 'Khitab du Qadi & Tadmin',
                    'desc_ar' => 'عرض رسم اللفيف على قاضي التوثيق للخطاب عليه وتضمينه بكناش الأملاك والتضمين',
                    'icon' => 'Scale',
                ],
                [
                    'key' => 'tax_stamp',
                    'order' => 6,
                    'title_ar' => 'أداء الرسوم القضائية والجبائية الثابتة',
                    'title_fr' => 'Taxes & Droits Fixes',
                    'desc_ar' => 'استخلاص رسم التمبر وأداء الرسوم الواجبة بصندوق المحكمة والقباضة',
                    'icon' => 'Receipt',
                ],
                [
                    'key' => 'delivery',
                    'order' => 7,
                    'title_ar' => 'تسليم النسخة الرسمية للمشهود له والأرشفة',
                    'title_fr' => 'Délivrance de l\'Expédition',
                    'desc_ar' => 'تسليم النظير المخاطب عليه لطالب الشهادة وحفظ المحضر وأسماء الشهود بالأرشيف',
                    'icon' => 'CheckCircle2',
                ],
            ],

            // 4. Inheritances & Estates (إراثة، فريضة شرعية، تصفية تركة)
            'inheritance' => [
                [
                    'key' => 'intake',
                    'order' => 1,
                    'title_ar' => 'تلقي إشهاد الوفاة وحصر الورثة والمتروك',
                    'title_fr' => 'Déclaration de Décès & Héritiers',
                    'desc_ar' => 'استقبال الورثة أو من ينوب عنهم وحصر قائمة ذوي الحقوق وتاريخ الوفاة',
                    'icon' => 'UserCheck',
                ],
                [
                    'key' => 'verify_records',
                    'order' => 2,
                    'title_ar' => 'فحص رسوم الولادة والوفاة وعقود الزواج',
                    'title_fr' => 'Vérification des Actes d\'État Civil',
                    'desc_ar' => 'مراجعة عقود الزواج، شهادات الوفاة، كناش الحالة المدنية لضبط النسب الشرعي',
                    'icon' => 'FileCheck',
                ],
                [
                    'key' => 'inheritance_calc',
                    'order' => 3,
                    'title_ar' => 'إنجاز الفريضة الشرعية وتحديد السهام والأنصبة',
                    'title_fr' => 'Calcul de la Farida & Quotes-parts',
                    'desc_ar' => 'تطبيق قواعد الميراث (الفروض، التعصيب، الحجب، المناسخات، الرد والعول) وتحديد أصل المسألة',
                    'icon' => 'Calculator',
                ],
                [
                    'key' => 'drafting_signing',
                    'order' => 4,
                    'title_ar' => 'تحرير رسم الإراثة بمذكرة الحفظ وتوقيع الطالبين والعدلين',
                    'title_fr' => 'Rédaction de l\'Iratha & Signatures',
                    'desc_ar' => 'صياغة وثيقة الإراثة وحصر التركة والتقييد بمذكرة الحفظ وتوقيع الحاضرين والعدلين',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'key' => 'court_qadi',
                    'order' => 5,
                    'title_ar' => 'إيداع المحكمة وخطاب قاضي التوثيق وتضمين الإراثة',
                    'title_fr' => 'Khitab du Qadi & Tadmin',
                    'desc_ar' => 'تأشير قاضي التوثيق المشرف والتضمين بسجل التركات بالمحكمة الابتدائية',
                    'icon' => 'Scale',
                ],
                [
                    'key' => 'delivery',
                    'order' => 6,
                    'title_ar' => 'تسليم النسخ التنفيذية للورثة والأرشفة',
                    'title_fr' => 'Délivrance aux Ayants Droit',
                    'desc_ar' => 'تسليم نظائر رسم الإراثة لذوي الحقوق لتقديمها للبنوك والمحافظة والإدارات المختصة',
                    'icon' => 'CheckCircle2',
                ],
            ],

            // 5. General Acts & Powers of Attorney (وكالة، إشهاد، اعتراف، وصية، أخرى)
            'general' => [
                [
                    'key' => 'intake',
                    'order' => 1,
                    'title_ar' => 'تلقي الإشهاد والاستقبال',
                    'title_fr' => 'Réception & Audition',
                    'desc_ar' => 'تسجيل الأطراف والتحقق من الهويات والأهلية الشرعية والقانونية',
                    'icon' => 'UserCheck',
                ],
                [
                    'key' => 'documents',
                    'order' => 2,
                    'title_ar' => 'فحص وتدقيق الوثائق والمستندات',
                    'title_fr' => 'Instruction & Pièces',
                    'desc_ar' => 'استيفاء الوثائق الثبوتية والشواهد الإدارية اللازمة لموضوع الإشهاد',
                    'icon' => 'FileCheck',
                ],
                [
                    'key' => 'drafting',
                    'order' => 3,
                    'title_ar' => 'تسويد العقد والتقييد بمذكرة الحفظ',
                    'title_fr' => 'Rédaction & Brouillard',
                    'desc_ar' => 'صياغة الرسم الشرعي ومطابقته للنصوص القانونية والتنظيمية المعمول بها',
                    'icon' => 'FileText',
                ],
                [
                    'key' => 'signing',
                    'order' => 4,
                    'title_ar' => 'الإشهاد والتوقيع الشرعي',
                    'title_fr' => 'Signature & Clôture',
                    'desc_ar' => 'قراءة المحرر وتوقيع الأطراف والشاهدين والعدلين المتعاقدين',
                    'icon' => 'ShieldCheck',
                ],
                [
                    'key' => 'tax_dgi',
                    'order' => 5,
                    'title_ar' => 'التسجيل الجبائي وأداء الرسوم (إن وجب)',
                    'title_fr' => 'Enregistrement Fiscal & Taxes',
                    'desc_ar' => 'أداء واجبات التسجيل والتمبر لدى إدارة الضرائب أو صندوق المحكمة',
                    'icon' => 'Receipt',
                ],
                [
                    'key' => 'court_qadi',
                    'order' => 6,
                    'title_ar' => 'إيداع المحكمة والخطاب القضائي',
                    'title_fr' => 'Khitab du Qadi & Tadmin',
                    'desc_ar' => 'تأشير قاضي التوثيق المشرف والتضمين بسجلات المحكمة الابتدائية المختصة',
                    'icon' => 'Scale',
                ],
                [
                    'key' => 'delivery',
                    'order' => 7,
                    'title_ar' => 'تسليم النسخة الرسمية والأرشفة',
                    'title_fr' => 'Délivrance & Archivage',
                    'desc_ar' => 'تسليم النظير المختوم لطالبيه وحفظ الأصل في الأرشيف الإلكتروني والورقي',
                    'icon' => 'CheckCircle2',
                ],
            ],
        ];

        if (! $type) {
            return $templates;
        }

        // Map act type to template category
        return match ($type) {
            'marriage', 'divorce', 'raj3a', 'thobout_zawjia', 'hadana_nafaka' => $templates['family'],
            'property_sale', 'donation', 'tarakah_qisma' => $templates['property'],
            'mulkiya_lafif', 'lafif_property' => $templates['lafif'],
            'inheritance', 'will' => $templates['inheritance'],
            default => $templates['general'],
        };
    }

    /**
     * Get Complete Procedural Workflow Progression tailored to the Act and Adoul adjustments
     */
    public function getWorkflowProgressAttribute(): array
    {
        $details = $this->details ?? [];
        $savedSteps = $details['workflow_steps'] ?? [];

        // Check if Adoul customized steps for this specific dossier
        if (! empty($details['custom_workflow_steps']) && is_array($details['custom_workflow_steps'])) {
            $baseSteps = $details['custom_workflow_steps'];
        } else {
            $baseSteps = static::getDefaultWorkflowTemplates($this->type);
        }

        // Sort steps by order
        usort($baseSteps, fn ($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));

        $completedCount = 0;
        $totalActiveSteps = 0;
        $processedSteps = [];
        $currentStepKey = null;

        foreach ($baseSteps as $cfg) {
            $key = $cfg['key'] ?? '';
            if (empty($key)) {
                continue;
            }

            // Is step disabled by Adoul?
            $isEnabled = $cfg['is_enabled'] ?? true;
            if ($isEnabled === false) {
                continue;
            }

            $saved = $savedSteps[$key] ?? [];
            $isCompleted = false;
            $isSkipped = ! empty($saved['is_skipped']);
            $completedAt = $saved['completed_at'] ?? null;
            $notes = $saved['notes'] ?? '';
            $reference = $saved['reference'] ?? '';

            if (isset($saved['is_completed'])) {
                $isCompleted = (bool) $saved['is_completed'];
            } else {
                if ($this->status === 'archived') {
                    $isCompleted = true;
                } elseif ($key === 'intake') {
                    $isCompleted = true;
                } elseif ($key === 'docs_permits' || $key === 'documents' || $key === 'title_check' || $key === 'verify_records') {
                    $isCompleted = ! empty($this->documents) || (bool) $this->signing_date || in_array($this->status, ['signed', 'court_deposit', 'pending_qadi', 'archived']);
                } elseif ($key === 'drafting' || $key === 'inheritance_calc') {
                    $isCompleted = (bool) $this->signing_date || in_array($this->status, ['signed', 'court_deposit', 'pending_qadi', 'archived']);
                } elseif ($key === 'signing' || $key === 'drafting_signing') {
                    $isCompleted = (bool) $this->signing_date || in_array($this->status, ['signed', 'court_deposit', 'pending_qadi', 'archived']);
                } elseif ($key === 'tax_dgi' || $key === 'tax_stamp') {
                    $isCompleted = ! empty($details['dgi_number']) || $this->status === 'archived';
                } elseif ($key === 'court_qadi') {
                    $isCompleted = ! empty($this->qadi_reference) || ! empty($this->qadi_validation_date) || $this->status === 'archived';
                } elseif ($key === 'civil_status') {
                    $isCompleted = ! empty($details['civil_status_notified']) || $this->status === 'archived';
                } elseif ($key === 'ancfcc') {
                    $isCompleted = ! empty($details['ancfcc_title_number']) || ! empty($details['ancfcc_deposit_number']) || $this->status === 'archived';
                } elseif ($key === 'delivery') {
                    $isCompleted = $this->status === 'archived';
                }
            }

            if (! $isSkipped) {
                $totalActiveSteps++;
                if ($isCompleted) {
                    $completedCount++;
                } elseif ($currentStepKey === null) {
                    $currentStepKey = $key;
                }
            }

            $processedSteps[] = array_merge($cfg, [
                'is_completed' => $isCompleted,
                'is_skipped' => $isSkipped,
                'is_current' => false,
                'completed_at' => $completedAt,
                'notes' => $notes,
                'reference' => $reference,
            ]);
        }

        if ($currentStepKey === null && $completedCount < $totalActiveSteps) {
            foreach ($processedSteps as $p) {
                if (! $p['is_completed'] && ! $p['is_skipped']) {
                    $currentStepKey = $p['key'];
                    break;
                }
            }
        }

        foreach ($processedSteps as &$step) {
            if ($step['key'] === $currentStepKey) {
                $step['is_current'] = true;
            }
        }

        $percentage = $totalActiveSteps > 0 ? (int) round(($completedCount / $totalActiveSteps) * 100) : 0;

        return [
            'steps' => $processedSteps,
            'completed_count' => $completedCount,
            'total_steps' => $totalActiveSteps,
            'percentage' => $percentage,
            'current_step_key' => $currentStepKey,
            'is_customized' => ! empty($details['custom_workflow_steps']),
            'template_key' => $details['workflow_template_key'] ?? null,
        ];
    }

    public static function generateReference(): string
    {
        $year = date('Y');
        $count = static::whereYear('created_at', $year)->count() + 1;
        $sequence = str_pad((string) $count, 5, '0', STR_PAD_LEFT);

        return "DOS-{$year}-{$sequence}";
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('reference', 'LIKE', "%{$term}%")
                ->orWhere('type', 'LIKE', "%{$term}%")
                ->orWhere('notes_ar', 'LIKE', "%{$term}%")
                ->orWhere('notes_fr', 'LIKE', "%{$term}%")
                ->orWhereHas('client', function ($clientQ) use ($term) {
                    $clientQ->where('name_ar', 'LIKE', "%{$term}%")
                        ->orWhere('name_fr', 'LIKE', "%{$term}%")
                        ->orWhere('cin', 'LIKE', "%{$term}%");
                });
        });
    }

    public function logAction(string $action, ?int $userId = null, array $details = []): ActLog
    {
        return $this->actLogs()->create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'details' => $details,
        ]);
    }
}
