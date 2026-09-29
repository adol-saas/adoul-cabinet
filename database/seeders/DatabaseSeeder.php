<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ActLog;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Permissions & Roles
        $permissions = [
            'dossiers.view',
            'dossiers.create',
            'dossiers.edit',
            'dossiers.delete',
            'dossiers.sign',
            'dossiers.archive',
            'clients.view',
            'clients.create',
            'clients.edit',
            'clients.delete',
            'appointments.manage',
            'templates.manage',
            'team.manage',
            'billing.manage',
            'reports.view',
            'reports.export',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $roleOwner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $roleOwner->syncPermissions(Permission::all());

        $roleAdoul = Role::firstOrCreate(['name' => 'adoul', 'guard_name' => 'web']);
        $roleAdoul->syncPermissions([
            'dossiers.view',
            'dossiers.create',
            'dossiers.edit',
            'dossiers.sign',
            'dossiers.archive',
            'clients.view',
            'clients.create',
            'clients.edit',
            'appointments.manage',
            'templates.manage',
            'reports.view',
        ]);

        $roleKatib = Role::firstOrCreate(['name' => 'katib', 'guard_name' => 'web']);
        $roleKatib->syncPermissions([
            'clients.view',
            'clients.create',
            'clients.edit',
            'appointments.manage',
            'dossiers.view',
            'dossiers.create',
        ]);

        $roleMuhafidh = Role::firstOrCreate(['name' => 'muhafidh', 'guard_name' => 'web']);
        $roleMuhafidh->syncPermissions([
            'dossiers.view',
            'dossiers.archive',
            'reports.view',
            'reports.export',
        ]);

        // 2. Default Document Templates (Official Moroccan Adoul Templates)
        $this->seedDocumentTemplates();

        // 3. Users & Staff
        $adoulUser = User::updateOrCreate(
            ['email' => 'adoul@cabinet.ma'],
            [
                'name' => 'الأستاذ د. محمد الإدريسي',
                'password' => Hash::make('password'),
                'phone' => '+212 661 000 000',
                'job_title' => 'عدل موثق محلف - رئيس المكتب',
                'is_active' => true,
            ]
        );
        $adoulUser->syncRoles(['owner']);

        $secretaireUser = User::updateOrCreate(
            ['email' => 'secretaire@cabinet.ma'],
            [
                'name' => 'السيدة زينب التازي',
                'password' => Hash::make('password'),
                'phone' => '+212 663 333 444',
                'job_title' => 'كتابة المكتب وسكرتارية التوثيق',
                'is_active' => true,
            ]
        );
        $secretaireUser->syncRoles(['katib']);

        $secondAdoulUser = User::updateOrCreate(
            ['email' => 'adoul2@cabinet.ma'],
            [
                'name' => 'الأستاذة ذة. فاطمة الزهراء بنجلون',
                'password' => Hash::make('password'),
                'phone' => '+212 662 111 222',
                'job_title' => 'عدل موثقة محلفة - الشريك في التلقي',
                'is_active' => true,
            ]
        );
        $secondAdoulUser->syncRoles(['adoul']);

        // 4. Office Settings
        $cityName = 'الرباط';
        $cityFr = 'Rabat';
        $officeNameAr = 'مكتب الأستاذين د. محمد الإدريسي وفاطمة بنجلون - عدول محلفون';
        $officeNameFr = 'Cabinet Notarial Adoulaire - Maîtres M. Drissi & F. Benjelloun';
        $qadiName = 'السيد قاضي التوثيق بالمحكمة الابتدائية بالرباط';

        OfficeSetting::updateOrCreate(
            ['id' => 1],
            [
                'office_name_ar' => $officeNameAr,
                'office_name_fr' => $officeNameFr,
                'adoul_name' => 'الأستاذ د. محمد الإدريسي',
                'second_adoul_name' => 'الأستاذة ذة. فاطمة الزهراء بنجلون',
                'court_name' => 'المحكمة الابتدائية بالرباط - قسم قضاء الأسرة',
                'license_number' => 'قرار وزاري رقم 2018/142',
                'city' => $cityName,
                'region' => 'جهة الرباط سلا القنيطرة',
                'phone' => '+212 537 778 899',
                'whatsapp_number' => '+212 661 000 000',
                'email' => 'adoul@cabinet.ma',
                'address' => 'شارع محمد الخامس، عمارة التوثيق، الطابق 2، رقم 8، الرباط',
                'qadi_name' => $qadiName,
                'stamp_image_path' => null,
                'logo_path' => null,
                'color_primary' => '#0d5f47',
                'theme_color' => 'emerald',
                'tagline_ar' => 'الأصالة في التوثيق والريادة في المعاملات الرقمية المعتمدة',
                'tagline_fr' => 'Authenticité notariale et excellence juridique',
                'bio_ar' => 'مكتب توثيق عدلي معتمد يختص في تحرير كافة الرسوم والإشهادات الشرعية والمعاملات العقارية والتركات تحت إشراف قضاء التوثيق وقسم قضاء الأسرة بالمحكمة الابتدائية.',
                'bio_fr' => 'Cabinet notarial adoulaire assermenté auprès du tribunal de première instance.',
                'working_hours' => [
                    'monday' => ['open' => '08:30', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:30', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:30', 'close' => '17:00'],
                    'thursday' => ['open' => '08:30', 'close' => '17:00'],
                    'friday' => ['open' => '08:30', 'close' => '12:30', 'afternoon_open' => '15:00', 'afternoon_close' => '18:00'],
                    'saturday' => ['open' => '09:00', 'close' => '13:00'],
                    'sunday' => 'closed',
                ],
            ]
        );

        // 5. Seed Clients & Dossiers
        $this->seedClientsAndDossiers('CAB', $cityName, $cityFr, $adoulUser->id, $secondAdoulUser->id);
    }

    protected function seedDocumentTemplates(): void
    {
        $templates = [
            // 1. الأسرة والأحوال الشخصية
            [
                'type' => 'marriage',
                'name_ar' => 'عقد الزواج الشرعي النموذجي',
                'name_fr' => 'Modèle officiel acte de mariage (Code de la Famille)',
                'content_ar' => "الحمد لله وحده والصلاة والسلام على مولانا رسول الله.\n\nبمحضر العدلين الموقعين أسفله المنتصبين للإشهاد بمكتب التوثيق بدائرة قضاء التوثيق بالمحكمة الابتدائية.\nحضر كل من الزوج: {{husband_name}}، الحامل للبطاقة الوطنية رقم {{husband_cin}}، والزوجة: {{wife_name}}، الحاملة للبطاقة الوطنية رقم {{wife_cin}}.\nوبعد التحقق من أهليتهما القانونية وخلوهما من الموانع الشرعية والنظامية طبقاً لمقتضيات مدونة الأسرة المغربية، اتفقا على إبرام عقد الزواج على صداق قدره: {{mahr_amount}} درهم مغربي (الحال منه: {{mahr_paid}} والمؤجل: {{mahr_deferred}}).\nبشهادة الشاهدين العارفين بهما قدر المعرفة: {{witness1_name}} و{{witness2_name}}.\nوعلى ذلك وقع التراضي والإشهاد الشرعي بتاريخ: {{act_date}}.",
                'content_fr' => "Louange à Dieu seul.\nPar-devant les Adoul soussignés, ont comparu les époux : {{husband_name}} (CIN : {{husband_cin}}) et {{wife_name}} (CIN : {{wife_cin}}). Après vérification de la capacité légale et conformité aux dispositions du Code de la Famille marocain, ils ont conclu leur union sacrée avec une dot de {{mahr_amount}} MAD. Fait en présence de deux témoins légaux le {{act_date}}.",
                'content_ber' => 'ⵜⴰⴷⴷⴰⵔⵜ ⵏ ⵜⵉⵜⵍⵉ ⴷ ⵓⵙⵎⴽⵍ ⵙ ⵓⵙⵍⴳⴰⵏ ⴰⵎⵖⵔⵉⴱⵉ.',
                'variables' => ['husband_name', 'husband_cin', 'wife_name', 'wife_cin', 'mahr_amount', 'mahr_paid', 'mahr_deferred', 'witness1_name', 'witness2_name', 'act_date'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'divorce',
                'name_ar' => 'إشهاد بالطلاق الاتفاقي / الخلع',
                'name_fr' => 'Acte de divorce par consentement mutuel (Khoul / Ittifaqi)',
                'content_ar' => "الحمد لله وحده.\nبناء على الإذن الصادر عن السيد قاضي الأسرة المكلف بالزواج والطلاق تحت عدد {{court_permission_number}} وتاريخ {{court_permission_date}}، حضر الزوجان المتراضيان: {{husband_name}} و{{wife_name}}، وأشهدا بأنهما أنهيا العلاقة الزوجية بالتراضي دون نزاع، مع أداء مستحقات المتعة والعدة وقدرها {{compensation_amount}} درهم.",
                'content_fr' => "En vertu de l'autorisation judiciaire n° {{court_permission_number}}, les époux ont consenti à la rupture définitive du lien conjugal par accord mutuel conformément au Code de la Famille.",
                'variables' => ['court_permission_number', 'court_permission_date', 'husband_name', 'wife_name', 'compensation_amount'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'raj3a',
                'name_ar' => 'رسم الرجعة الشرعية بعد الطلاق الرجعي',
                'name_fr' => 'Acte de reprise conjugale (Rajâa légale)',
                'content_ar' => "الحمد لله وحده.\nحضر الزوج: {{husband_name}} وأشهد العدلين في فترة العدة الشرعية بأنه راجع إلى عصمته زوجته ومدخولته: {{wife_name}} على الصداق والعقد الأصلي المؤرخ في {{original_marriage_date}}، ووافقت الزوجة على الرجعة بحضور الشاهدين.",
                'content_fr' => "Par-devant les Adoul, le mari a déclaré solennellement reprendre son épouse dans les liens du mariage pendant le délai légal de viduité (Idda).",
                'variables' => ['husband_name', 'wife_name', 'original_marriage_date', 'divorce_act_reference'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'thobout_zawjia',
                'name_ar' => 'رسم إشهاد ثبوت الزوجية',
                'name_fr' => 'Acte de constatation de mariage coutumier (Thobout Zawjia)',
                'content_ar' => "الحمد لله وحده.\nبناء على الحكم القضائي الصادر عن المحكمة الابتدائية قسم قضاء الأسرة تحت ملف عدد {{judgment_number}} بتاريخ {{judgment_date}} القاضي بثبوت الزوجية بين {{husband_name}} و{{wife_name}} منذ تاريخ المعاشرة الزوجية في {{cohabitation_date}} وإثبات نسب الأبناء.",
                'content_fr' => "En exécution du jugement du Tribunal de Première Instance confirmant la relation matrimoniale établie et la filiation des enfants.",
                'variables' => ['judgment_number', 'judgment_date', 'husband_name', 'wife_name', 'cohabitation_date', 'children_names'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'hadana_nafaka',
                'name_ar' => 'إشهاد باتفاق الحضانة والنفقة وسكنى المحضون',
                'name_fr' => "Accord authentifié de garde d'enfants et pension alimentaire",
                'content_ar' => "الحمد لله وحده.\nاتفق الطرفان: الأب {{father_name}} والأم {{mother_name}} على إسناد حضانة الأبناء: {{children_names}} للأم، مع التزام الأب بأداء نفقة شهرية شاملة قدرها {{monthly_alimony}} درهم مغربي، مع واجب سكنى المحضون.",
                'content_fr' => "Convention parentale authentifiée confiant la garde des enfants à la mère avec engagement du père au versement de la pension mensuelle de {{monthly_alimony}} MAD.",
                'variables' => ['father_name', 'mother_name', 'children_names', 'monthly_alimony', 'housing_allowance'],
                'is_active' => true,
                'version' => 1,
            ],

            // 2. التركات والمواريث والوصايا
            [
                'type' => 'inheritance',
                'name_ar' => 'رسم الإراثة الشرعية وحصر الورثة والمخلف',
                'name_fr' => 'Acte de notoriété héréditaire (Hiratha et dévolution)',
                'content_ar' => "الحمد لله وحده.\nبشهادة لفيف الشهود العارفين بالهالك: {{deceased_name}} المتوفى بتاريخ {{death_date}}، بأنه توفي عن ورثة شرعيين محصورين في: {{heirs_list}}، ولا وارث له سواهم حسب علمهم، وترك تركة ومخلفاً شرعياً تؤصل فريضته على الأنصبة الشرعية المحددة بمدونة الأسرة.",
                'content_fr' => "Acte d'hérédité authentifié constatant le décès de {{deceased_name}} survenu le {{death_date}} et établissant la liste exclusive de ses héritiers légaux selon la dévolution successorale islamique.",
                'variables' => ['deceased_name', 'death_date', 'death_place', 'heirs_list', 'estate_estimated_value'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'will',
                'name_ar' => 'رسم وصية شرعية منجزة في حدود الثلث',
                'name_fr' => 'Acte de testament authentique (Wassiya légale)',
                'content_ar' => "الحمد لله وحده.\nأوصى الموصي: {{testator_name}} في صحة عقله وتمام إدراكه بما قدره ثلث ماله أو العقار المذكور لفائدة: {{beneficiary_name}} صدقة جارية لوجه الله تعالى في حدود الثلث الشرعي الجائز قانوناً.",
                'content_fr' => "Le testateur {{testator_name}} lègue authentiquement à {{beneficiary_name}} les biens spécifiés dans la limite légale du tiers réservataire conformément aux règles du droit successoral marocain.",
                'variables' => ['testator_name', 'beneficiary_name', 'bequest_details'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'tarakah_qisma',
                'name_ar' => 'رسم قسمة التركة الرضائية وتصفية المتروك',
                'name_fr' => 'Partage successoral amiable entre cohéritiers',
                'content_ar' => "الحمد لله وحده.\nحضر الورثة الشرعيون للهالك المذكورين برسم الإراثة، واتفقوا برضاهم واختيارهم على قسمة عناصر التركة المشتملة على {{estate_properties}} وتفويتها ومخارجتها وفق الأنصبة الشرعية.",
                'content_fr' => "Acte de partage définitif et amiable des biens de la succession entre l'ensemble des cohéritiers.",
                'variables' => ['deceased_name', 'inheritance_act_ref', 'heirs_list', 'estate_properties', 'equalization_payment'],
                'is_active' => true,
                'version' => 1,
            ],

            // 3. المعاملات العقارية والحقوق العينية
            [
                'type' => 'property_sale',
                'name_ar' => 'عقد بيع عقار محفظ / غير محفظ',
                'name_fr' => 'Acte de vente immobilière définitive',
                'content_ar' => "الحمد لله وحده.\nحضر لدى العدلين بمكتب التوثيق البائع: {{seller_name}} (ب.ت.و: {{seller_cin}}) والمشتري: {{buyer_name}} (ب.ت.و: {{buyer_cin}}).\nحيث صرح البائع بأنه باع وأسقط وتخلى عن كافة العقار المسمى {{property_name}} الكائن بـ {{property_location}} ذي الحدود التالية: {{property_boundaries}} ورقم الرسم العقاري إن وجد: {{title_number}} بثمن إجمالي متفق عليه قدره {{sale_price}} درهم مؤدى بالكامل نقدا أو بشيك بنكي.",
                'content_fr' => "Par-devant les Adoul, le vendeur {{seller_name}} cède et vend au profit de l'acquéreur {{buyer_name}} le bien immobilier désigné sous le nom {{property_name}}, sis à {{property_location}}, titre foncier {{title_number}}, moyennant le prix global de {{sale_price}} MAD.",
                'variables' => ['seller_name', 'seller_cin', 'buyer_name', 'buyer_cin', 'property_name', 'property_location', 'title_number', 'property_boundaries', 'sale_price'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'mulkiya_lafif',
                'name_ar' => 'رسم استمرار الملكية بشهادة اللفيف (12 شاهداً)',
                'name_fr' => 'Acte de notoriété de possession continue par Lafif (12 témoins)',
                'content_ar' => "الحمد لله وحده.\nأشهد اثنا عشر شاهداً من أهل الفضل والعدالة المعرفة بالمدخل والمخرج: {{lafif_witnesses}} بأن العقار المسمى {{property_name}} الكائن بـ {{property_location}} المحدود بالحدود الأربعة: {{property_boundaries}} هو في ملك وحيازة وتصرف المشهود له: {{owner_name}} حيازة هادئة ومستمرة تزيد عن المدة المعتبرة شرعاً وقانوناً، دون منازع ولا معارض، خالية من كل شائبة أو نزاع.",
                'content_fr' => "Constatation par acte de notoriété (Lafif de 12 témoins qualifiés) de la possession paisible, continue et non équivoque de la propriété immobilière au profit de {{owner_name}}.",
                'variables' => ['owner_name', 'owner_cin', 'property_name', 'property_location', 'property_boundaries', 'lafif_witnesses'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'donation',
                'name_ar' => 'عقد هبة عقارية مع معاينة الحوز والتسليم',
                'name_fr' => 'Acte de donation immobilière avec procès-verbal de prise de possession',
                'content_ar' => "الحمد لله وحده.\nوهب الواهب: {{donor_name}} على وجه البر والصلة لوجه الله تعالى للموهوب له: {{donee_name}} العقار المسمى {{property_name}} ذي الرسم العقاري: {{title_number}}، وأشهدا العدلين بحوز العقار وحلوله محله ومعاينة رفع يد الواهب تماماً وحيازة الموهوب له حوزاً فعلياً صحيحاً.",
                'content_fr' => "Donation authentique entre vifs avec constatation matérielle de la prise de possession effective (Hiyaza et Houz).",
                'variables' => ['donor_name', 'donor_cin', 'donee_name', 'donee_cin', 'property_name', 'title_number'],
                'is_active' => true,
                'version' => 1,
            ],

            // 4. الوكالات والإشهادات العامة
            [
                'type' => 'poa',
                'name_ar' => 'عقد وكالة رسمية خاصة / عامة',
                'name_fr' => 'Acte de procuration notariée spéciale ou générale',
                'content_ar' => "الحمد لله وحده.\nوكل الموكل: {{principal_name}} (ب.ت.و: {{principal_cin}}) الوكيل: {{agent_name}} (ب.ت.و: {{agent_cin}}) لينوب عنه ويقوم مقامه في: {{powers_granted}}، وكالة مفوضة ومقبولة منه شرعاً وقانوناً.",
                'content_fr' => "Procuration authentique spéciale conférant tous pouvoirs à {{agent_name}} pour agir au nom de {{principal_name}} aux fins indiquées.",
                'variables' => ['principal_name', 'principal_cin', 'agent_name', 'agent_cin', 'powers_granted'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'conversion_islam',
                'name_ar' => 'شهادة اعتناق الإسلام (مجانية بقوة القانون)',
                'name_fr' => "Attestation authentifiée de conversion à l'Islam (Gratuite)",
                'content_ar' => "الحمد لله وحده.\nحضر بمكتب التوثيق العدلي السيد: {{convert_name}} وصرح بطواعية واختيار بنطق الشهادتين واعتناق الدين الإسلامي الحنيف واختيار الاسم الإسلامي: {{muslim_name}}، محررة مجاناً بنص المادة 36 من القانون 16.03.",
                'content_fr' => "Attestation solennelle et gratuite constatant l'adhésion volontaire à l'Islam conformément aux dispositions de la loi 16.03.",
                'variables' => ['convert_name', 'convert_cin', 'muslim_name', 'nationality'],
                'is_active' => true,
                'version' => 1,
            ],
        ];

        foreach ($templates as $tmpl) {
            DocumentTemplate::updateOrCreate(
                ['type' => $tmpl['type']],
                $tmpl
            );
        }
    }

    protected function seedClientsAndDossiers(string $prefix, string $cityAr, string $cityFr, int $adoulId, int $secondAdoulId): void
    {
        $clientsData = [
            [
                'name_ar' => 'أحمد المنصوري',
                'name_fr' => 'Ahmed El Mansouri',
                'cin' => 'A123456',
                'phone' => '+212 661 112 233',
                'email' => 'ahmed.mansouri@example.com',
                'address' => 'حي الرياض، زنقة النخيل، رقم 12، الرباط',
                'birth_date' => '1985-04-12',
                'birth_city' => 'الرباط',
                'gender' => 'male',
                'profession' => 'مهندس دولة',
            ],
            [
                'name_ar' => 'فاطمة الزهراء العلمي',
                'name_fr' => 'Fatima Zahra El Alami',
                'cin' => 'A654321',
                'phone' => '+212 662 223 344',
                'email' => 'fz.alami@example.com',
                'address' => 'حي أكدال، شارع فرنسا، رقم 45، الرباط',
                'birth_date' => '1990-08-23',
                'birth_city' => 'فاس',
                'gender' => 'female',
                'profession' => 'أستاذة جامعية',
            ],
            [
                'name_ar' => 'يوسف التازي',
                'name_fr' => 'Youssef Tazi',
                'cin' => 'B987654',
                'phone' => '+212 663 334 455',
                'email' => 'youssef.tazi@example.com',
                'address' => 'حي حسان، زنقة ملوية، رقم 7، الرباط',
                'birth_date' => '1978-11-05',
                'birth_city' => 'الدار البيضاء',
                'gender' => 'male',
                'profession' => 'رجل أعمال',
            ],
            [
                'name_ar' => 'مريم بنجلون',
                'name_fr' => 'Meryem Benjelloun',
                'cin' => 'B456789',
                'phone' => '+212 664 445 566',
                'email' => 'meryem.b@example.com',
                'address' => 'حي السويسي، شارع الأميرات، فيلا 18، الرباط',
                'birth_date' => '1982-02-14',
                'birth_city' => 'الرباط',
                'gender' => 'female',
                'profession' => 'طبيبة صيدلانية',
            ],
            [
                'name_ar' => 'عبد العزيز الفاسي الفهري',
                'name_fr' => 'Abdelaziz El Fassi El Fihri',
                'cin' => 'C112233',
                'phone' => '+212 665 556 677',
                'email' => 'a.fassi@example.com',
                'address' => 'المدينة العتيقة، درب سيدي فاتح، رقم 22، الرباط',
                'birth_date' => '1955-09-18',
                'birth_city' => 'فاس',
                'gender' => 'male',
                'profession' => 'متقاعد',
            ],
        ];

        $createdClients = [];
        foreach ($clientsData as $cd) {
            $createdClients[] = Client::updateOrCreate(['cin' => $cd['cin']], $cd);
        }

        // Realistic Dossiers spanning key Moroccan Adoul workflows
        $dossiersData = [
            // 1. عقد الزواج الشرعي (Marriage)
            [
                'reference' => 'DOS-2026-00001',
                'type' => 'marriage',
                'status' => 'signed',
                'client_id' => $createdClients[0]->id,
                'client2_id' => $createdClients[1]->id,
                'adoul_id' => $adoulId,
                'amount_due' => 800.00,
                'amount_paid' => 800.00,
                'act_date' => '2026-02-10',
                'signing_date' => '2026-02-10',
                'qadi_validation_date' => '2026-02-12',
                'qadi_reference' => 'كناش 14 ص 45 عدد 230',
                'details' => [
                    'mahr_amount' => 50000,
                    'mahr_paid' => 50000,
                    'mahr_deferred' => 0,
                    'witness1_name' => 'الحاج محمد السلاوي',
                    'witness1_cin' => 'A102030',
                    'witness2_name' => 'السيد مصطفى البقالي',
                    'witness2_cin' => 'A405060',
                    'second_adoul_id' => $secondAdoulId,
                    'second_adoul_name' => 'الأستاذة ذة. فاطمة الزهراء بنجلون',
                    'court_name' => 'المحكمة الابتدائية بالرباط - قسم قضاء الأسرة',
                    'tadmine_number' => '230',
                    'kunnash_number' => '14',
                    'page_number' => '45',
                    'civil_status_notified' => true,
                    'civil_status_notification_date' => '2026-02-15',
                ],
            ],

            // 2. عقد بيع عقار محفظ (Property Sale)
            [
                'reference' => 'DOS-2026-00002',
                'type' => 'property_sale',
                'status' => 'signed',
                'client_id' => $createdClients[2]->id,
                'client2_id' => $createdClients[3]->id,
                'adoul_id' => $adoulId,
                'amount_due' => 6500.00,
                'amount_paid' => 6500.00,
                'act_date' => '2026-03-01',
                'signing_date' => '2026-03-02',
                'qadi_validation_date' => '2026-03-05',
                'qadi_reference' => 'كناش 08 ص 112 عدد 489',
                'details' => [
                    'property_name' => 'شقة النرجس رقم 4',
                    'property_location' => 'شارع فرنسا، عمارة الأمل، أكدال، الرباط',
                    'title_number' => 'T/145892/03',
                    'sale_price' => 1250000,
                    'declared_value' => 1250000,
                    'second_adoul_id' => $secondAdoulId,
                    'second_adoul_name' => 'الأستاذة ذة. فاطمة الزهراء بنجلون',
                    'dgi_number' => 'SIMPL-2026-RABAT-9988',
                    'dgi_date' => '2026-03-12',
                    'dgi_amount' => 50000.00,
                    'ancfcc_title_number' => '145892/03',
                    'ancfcc_deposit_number' => 'DEP-2026-04421',
                    'court_name' => 'المحكمة الابتدائية بالرباط',
                    'tadmine_number' => '489',
                    'kunnash_number' => '08',
                    'page_number' => '112',
                ],
            ],

            // 3. رسم استمرار الملكية بشهادة اللفيف - 12 شاهداً (Mulkiya Lafif)
            [
                'reference' => 'DOS-2026-00003',
                'type' => 'mulkiya_lafif',
                'status' => 'pending_qadi',
                'client_id' => $createdClients[4]->id,
                'client2_id' => null,
                'adoul_id' => $adoulId,
                'amount_due' => 2000.00,
                'amount_paid' => 1000.00,
                'act_date' => '2026-03-15',
                'signing_date' => '2026-03-16',
                'qadi_validation_date' => null,
                'qadi_reference' => 'ملف إيداع عدد 88/2026',
                'details' => [
                    'property_name' => 'القطعة الأرضية المسماة جنان الورد',
                    'property_location' => 'ضواحي تيفلت، دائرة الرماني',
                    'property_area' => 'هكتاران ونصف',
                    'property_boundaries' => 'شمالاً: ورثة الحاج قدور، جنوباً: الطريق العامة، شرقاً: ساقية الماء، غرباً: أملاك الدولة',
                    'second_adoul_id' => $secondAdoulId,
                    'second_adoul_name' => 'الأستاذة ذة. فاطمة الزهراء بنجلون',
                    'lafif_witnesses' => [
                        ['num' => 1, 'name' => 'الحاج بوشعيب الزروالي', 'cin' => 'G12345', 'age' => 68, 'profession' => 'فلاح', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 2, 'name' => 'التهامي الخمليشي', 'cin' => 'G23456', 'age' => 62, 'profession' => 'تاجر', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 3, 'name' => 'العربي بناني', 'cin' => 'G34567', 'age' => 70, 'profession' => 'متقاعد', 'address' => 'الرماني المركز', 'bias_free' => true],
                        ['num' => 4, 'name' => 'المعطي الساخي', 'cin' => 'G45678', 'age' => 59, 'profession' => 'فلاح', 'address' => 'دوار السواخي', 'bias_free' => true],
                        ['num' => 5, 'name' => 'حميد الصبيحي', 'cin' => 'G56789', 'age' => 65, 'profession' => 'فلاح', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 6, 'name' => 'عبد القادر الراجي', 'cin' => 'G67890', 'age' => 55, 'profession' => 'سائق', 'address' => 'الرماني المركز', 'bias_free' => true],
                        ['num' => 7, 'name' => 'محمد البوعناني', 'cin' => 'G78901', 'age' => 73, 'profession' => 'فلاح', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 8, 'name' => 'عبد الرحمان المراكشي', 'cin' => 'G89012', 'age' => 60, 'profession' => 'حداد', 'address' => 'الرماني', 'bias_free' => true],
                        ['num' => 9, 'name' => 'إدريس العلمي', 'cin' => 'G90123', 'age' => 58, 'profession' => 'نجار', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 10, 'name' => 'الجيلالي الوردي', 'cin' => 'G01234', 'age' => 66, 'profession' => 'فلاح', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                        ['num' => 11, 'name' => 'بوسلهام الفيلالي', 'cin' => 'G11223', 'age' => 61, 'profession' => 'تاجر ماشية', 'address' => 'سوق الرماني', 'bias_free' => true],
                        ['num' => 12, 'name' => 'الميلودي البصري', 'cin' => 'G33445', 'age' => 64, 'profession' => 'فلاح', 'address' => 'دوار أولاد موسى', 'bias_free' => true],
                    ],
                ],
            ],

            // 4. رسم إراثة وفريضة شرعية (Inheritance)
            [
                'reference' => 'DOS-2026-00004',
                'type' => 'inheritance',
                'status' => 'draft',
                'client_id' => $createdClients[0]->id,
                'client2_id' => null,
                'adoul_id' => $adoulId,
                'amount_due' => 1200.00,
                'amount_paid' => 600.00,
                'act_date' => '2026-03-20',
                'signing_date' => null,
                'qadi_validation_date' => null,
                'qadi_reference' => null,
                'details' => [
                    'deceased_name' => 'المرحوم الحاج العربي المنصوري',
                    'death_date' => '2026-01-15',
                    'death_place' => 'الرباط',
                    'heirs_list' => 'الزوجة مريم، ابنان (أحمد ومصطفى)، وثلاث بنات (خديجة، سلوى، وسناء)',
                    'estate_estimated_value' => 850000,
                    'second_adoul_id' => $secondAdoulId,
                ],
            ],
        ];

        foreach ($dossiersData as $dd) {
            $dossier = Dossier::updateOrCreate(['reference' => $dd['reference']], $dd);

            ActLog::firstOrCreate(
                [
                    'dossier_id' => $dossier->id,
                    'action' => 'created',
                ],
                [
                    'user_id' => $adoulId,
                    'details' => ['note' => 'تم فتح وتقييد المعاملة العدلية وتدقيق وثائق الأطراف والهويات'],
                ]
            );
        }
    }
}
