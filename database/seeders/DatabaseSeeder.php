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

        // 2. Default Document Templates
        $this->seedDocumentTemplates();

                // 1.1 Users & Staff
        $adoulUser = User::firstOrCreate(
            ['email' => 'adoul@cabinet.ma'],
            [
                'name' => 'Ø§Ù„Ø£Ø³ØªØ§Ø° Ø°. Ù…Ø­Ù…Ø¯ Ø§Ù„Ø¥Ø¯Ø±ÙŠØ³ÙŠ',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'phone' => '+212 661 000 000',
                'job_title' => 'Ø¹Ø¯Ù„ Ù…ÙˆØ«Ù‚ Ù…Ø­Ù„Ù',
                'is_active' => true,
            ]
        );
        $adoulUser->assignRole('owner');

        $katibUser = User::firstOrCreate(
            ['email' => 'katib@cabinet.ma'],
            [
                'name' => 'Ø£Ø­Ù…Ø¯ Ø§Ù„Ù…Ù†ØµÙˆØ±ÙŠ',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'phone' => '+212 662 000 000',
                'job_title' => 'ÙƒØ§ØªØ¨ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù„ÙØ§Øª',
                'is_active' => true,
            ]
        );
        $katibUser->assignRole('katib');

        // Conventions
        \App\Models\Convention::updateOrCreate(
            ['reference_number' => 'CONV-2026-MJ-01'],
            [
                'title_ar' => 'Ø¯ÙˆØ±ÙŠØ© ÙˆØ²Ø§Ø±Ø© Ø§Ù„Ø¹Ø¯Ù„ Ø­ÙˆÙ„ Ø§Ù„ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø±Ù‚Ù…ÙŠ Ù…Ø¹ Ù‚Ø¶Ø§Ø© Ø§Ù„ØªÙˆØ«ÙŠÙ‚',
                'title_fr' => 'Circulaire du MinistÃ¨re de la Justice sur lâ€™Ã©change numÃ©rique avec le Juge de lâ€™authentification',
                'description_ar' => 'Ø§Ù„Ø¥Ø·Ø§Ø± Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠ Ø§Ù„Ù…Ù†Ø¸Ù… Ù„Ø¥Ø±Ø³Ø§Ù„ Ù…Ø­Ø§Ø¶Ø± Ø§Ù„Ø¹Ù‚ÙˆØ¯ ÙˆØ§Ù„ØªØ£Ø´ÙŠØ±Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ø¨ØµÙŠØºØ© Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© Ù…Ø¤Ù…Ù†Ø©.',
                'description_fr' => 'Cadre de rÃ©fÃ©rence pour la transmission dÃ©matÃ©rialisÃ©e et sÃ©curisÃ©e des actes notariÃ©s.',
                'file_path' => '/documents/conventions/circulaire_ministere_justice_2026.pdf',
                'category' => 'ministry',
                'issued_date' => now()->subMonths(1)->toDateString(),
            ]
        );

        \App\Models\Convention::updateOrCreate(
            ['reference_number' => 'CONV-2026-ORD-02'],
            [
                'title_ar' => 'Ù…ÙŠØ«Ø§Ù‚ Ø§Ù„Ø´Ø±Ù ÙˆØ£Ø®Ù„Ø§Ù‚ÙŠØ§Øª Ù…Ù‡Ù†Ø© Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¹Ø¯Ù„ÙŠ 2026',
                'title_fr' => 'Code de dÃ©ontologie de la profession notariale adoulaire 2026',
                'description_ar' => 'Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø£Ø®Ù„Ø§Ù‚ÙŠØ© ÙˆØ§Ù„Ù…Ù‡Ù†ÙŠØ© Ø§Ù„ØµØ§Ø¯Ø±Ø© Ø¹Ù† Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ù„Ù„Ù…Ø­Ø§ÙØ¸Ø© Ø¹Ù„Ù‰ Ø£Ø³Ø±Ø§Ø± Ø§Ù„Ù…ÙˆÙƒÙ„ÙŠÙ† ÙˆØ­Ù…Ø§ÙŠØ© Ø§Ù„Ø¹Ù‚ÙˆØ¯.',
                'description_fr' => 'Directives dÃ©ontologiques et dÃ©ontologie de lâ€™Ordre National des Adoul du Maroc.',
                'file_path' => '/documents/conventions/charte_deontologie_adoul_2026.pdf',
                'category' => 'order',
                'issued_date' => now()->subMonths(2)->toDateString(),
            ]
        );

        // 3. Office Settings
        $cityName = 'Ø§Ù„Ø±Ø¨Ø§Ø·';
        $cityFr = 'Rabat';
        $officeNameAr = 'Ù…ÙƒØªØ¨ Ø§Ù„Ø£Ø³ØªØ§Ø° Ø°. Ù…Ø­Ù…Ø¯ Ø§Ù„Ø¥Ø¯Ø±ÙŠØ³ÙŠ - Ø¹Ø¯Ù„ Ù…Ø­Ù„Ù';
        $officeNameFr = 'Etude Notariale Adoulaire - MaÃ®tre M. Drissi';
        $qadiName = 'Ø§Ù„Ø£Ø³ØªØ§Ø° Ø¹Ø¨Ø¯ Ø§Ù„Ø³Ù„Ø§Ù… Ø§Ù„Ø¨ÙˆØ´ÙŠØ®ÙŠ (Ù‚Ø§Ø¶ÙŠ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø¨Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©)';

        OfficeSetting::updateOrCreate(
            ['id' => 1],
            [
                'office_name_ar' => $officeNameAr,
                'office_name_fr' => $officeNameFr,
                'city' => $cityName,
                'region' => 'Ø¬Ù‡Ø© Ø§Ù„Ø±Ø¨Ø§Ø· Ø³Ù„Ø§ Ø§Ù„Ù‚Ù†ÙŠØ·Ø±Ø©',
                'phone' => '+212 537 778 899',
                'whatsapp_number' => '+212 661 000 000',
                'email' => 'adoul@cabinet.ma',
                'address' => 'Ø´Ø§Ø±Ø¹ Ù…Ø­Ù…Ø¯ Ø§Ù„Ø®Ø§Ù…Ø³ØŒ Ø¹Ù…Ø§Ø±Ø© Ø§Ù„ØªÙˆØ«ÙŠÙ‚ØŒ Ø§Ù„Ø·Ø§Ø¨Ù‚ 2ØŒ Ø±Ù‚Ù… 8',
                'qadi_name' => $qadiName,
                'stamp_image_path' => null,
                'logo_path' => null,
                'color_primary' => '#0d5f47',
                'theme_color' => 'emerald',
                'tagline_ar' => 'Ø§Ù„Ø£ØµØ§Ù„Ø© ÙÙŠ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ ÙˆØ§Ù„Ø±ÙŠØ§Ø¯Ø© ÙÙŠ Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©',
                'tagline_fr' => 'AuthenticitÃ© notariale et excellence juridique',
                'bio_ar' => 'Ù…ÙƒØªØ¨ ØªÙˆØ«ÙŠÙ‚ Ø¹Ø¯Ù„ÙŠ Ù…Ø¹ØªÙ…Ø¯ ÙŠØ®ØªØµ ÙÙŠ ØªØ­Ø±ÙŠØ± ÙƒØ§ÙØ© Ø§Ù„Ø±Ø³ÙˆÙ… ÙˆØ§Ù„Ø¥Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ø±Ø¹ÙŠØ© ÙˆØ§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ© ÙˆØ§Ù„ØªØ±ÙƒØ§Øª ØªØ­Øª Ø¥Ø´Ø±Ø§Ù Ù‚Ø¶Ø§Ø¡ Ø§Ù„ØªÙˆØ«ÙŠÙ‚.',
                'bio_fr' => 'Cabinet notarial adoulaire assermentÃ© auprÃ¨s du tribunal de premiÃ¨re instance.',
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

        // 4. Seed Clients & Dossiers
        $this->seedClientsAndDossiers('CAB', $cityName, $cityFr);
    }

    protected function seedDocumentTemplates(): void
    {
        $templates = [
            // 1. Ø§Ù„Ø£Ø³Ø±Ø© ÙˆØ§Ù„Ø£Ø­ÙˆØ§Ù„ Ø§Ù„Ø´Ø®ØµÙŠØ©
            [
                'type' => 'marriage',
                'name_ar' => 'Ù†Ù…ÙˆØ°Ø¬ Ø¹Ù‚Ø¯ Ø§Ù„Ø²ÙˆØ§Ø¬ Ø§Ù„Ø´Ø±Ø¹ÙŠ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ÙŠ',
                'name_fr' => 'ModÃ¨le officiel acte de mariage (Code de la Famille)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡ ÙˆØ§Ù„ØµÙ„Ø§Ø© ÙˆØ§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„Ù‰ Ù…ÙˆÙ„Ø§Ù†Ø§ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡.\n\nØ¨Ù…Ø­Ø¶Ø± Ø§Ù„Ø¹Ø¯Ù„ÙŠÙ† Ø§Ù„Ù…ÙˆÙ‚Ø¹ÙŠÙ† Ø£Ø³ÙÙ„Ù‡ Ø§Ù„Ù…Ù†ØªØµØ¨ÙŠÙ† Ù„Ù„Ø¥Ø´Ù‡Ø§Ø¯ Ø¨Ù…ÙƒØªØ¨ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø¨Ø¯Ø§Ø¦Ø±Ø© Ù‚Ø¶Ø§Ø¡ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø¨Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©.\nØ­Ø¶Ø± ÙƒÙ„ Ù…Ù† Ø§Ù„Ø²ÙˆØ¬: {{husband_name}}ØŒ Ø§Ù„Ø­Ø§Ù…Ù„ Ù„Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ø±Ù‚Ù… {{husband_cin}}ØŒ ÙˆØ§Ù„Ø²ÙˆØ¬Ø©: {{wife_name}}ØŒ Ø§Ù„Ø­Ø§Ù…Ù„Ø© Ù„Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ø±Ù‚Ù… {{wife_cin}}.\nÙˆØ¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£Ù‡Ù„ÙŠØªÙ‡Ù…Ø§ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ®Ù„ÙˆÙ‡Ù…Ø§ Ù…Ù† Ø§Ù„Ù…ÙˆØ§Ù†Ø¹ Ø§Ù„Ø´Ø±Ø¹ÙŠØ© ÙˆØ§Ù„Ù†Ø¸Ø§Ù…ÙŠØ© Ø·Ø¨Ù‚Ø§ Ù„Ù…Ù‚ØªØ¶ÙŠØ§Øª Ù…Ø¯ÙˆÙ†Ø© Ø§Ù„Ø£Ø³Ø±Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ©ØŒ Ø§ØªÙÙ‚Ø§ Ø¹Ù„Ù‰ Ø¥Ø¨Ø±Ø§Ù… Ø¹Ù‚Ø¯ Ø§Ù„Ø²ÙˆØ§Ø¬ Ø¹Ù„Ù‰ ØµØ¯Ø§Ù‚ Ù‚Ø¯Ø±Ù‡: {{mahr_amount}} Ø¯Ø±Ù‡Ù… Ù…ØºØ±Ø¨ÙŠ (Ø§Ù„Ø­Ø§Ù„ Ù…Ù†Ù‡: {{mahr_paid}} ÙˆØ§Ù„Ù…Ø¤Ø¬Ù„: {{mahr_deferred}}).\nØ¨Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø´Ø§Ù‡Ø¯ÙŠÙ† Ø§Ù„Ø¹Ø§Ø±ÙÙŠÙ† Ø¨Ù‡Ù…Ø§ Ù‚Ø¯Ø± Ø§Ù„Ù…Ø¹Ø±ÙØ©: {{witness1_name}} Ùˆ{{witness2_name}}.\nÙˆØ¹Ù„Ù‰ Ø°Ù„Ùƒ ÙˆÙ‚Ø¹ Ø§Ù„ØªØ±Ø§Ø¶ÙŠ ÙˆØ§Ù„Ø¥Ø´Ù‡Ø§Ø¯ Ø§Ù„Ø´Ø±Ø¹ÙŠ Ø¨ØªØ§Ø±ÙŠØ®: {{act_date}}.",
                'content_fr' => "Louange Ã  Dieu seul.\nPar-devant les Adoul soussignÃ©s, ont comparu les Ã©poux : {{husband_name}} (CIN : {{husband_cin}}) et {{wife_name}} (CIN : {{wife_cin}}). AprÃ¨s vÃ©rification de la capacitÃ© lÃ©gale et conformitÃ© aux dispositions du Code de la Famille marocain, ils ont conclu leur union sacrÃ©e avec une dot de {{mahr_amount}} MAD. Fait en prÃ©sence de deux tÃ©moins lÃ©gaux le {{act_date}}.",
                'content_ber' => 'âµœâ´°âµŽâµ“âµâµœ âµ âµœâµ‰âµœâµâµ‰ â´· âµ“âµ™âµâ´½âµ‰âµ âµ™ âµ“âµ™â´°â´¹âµ“â´¼ â´°âµŽâµ–âµ”âµ‰â´±âµ‰.',
                'variables' => ['husband_name', 'husband_cin', 'wife_name', 'wife_cin', 'mahr_amount', 'mahr_paid', 'mahr_deferred', 'witness1_name', 'witness2_name', 'act_date'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'divorce',
                'name_ar' => 'Ø¥Ø´Ù‡Ø§Ø¯ Ø¨Ø§Ù„Ø·Ù„Ø§Ù‚ Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠ / Ø§Ù„Ø®Ù„Ø¹',
                'name_fr' => 'Acte de divorce par consentement mutuel (Khoul / Ittifaqi)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ¨Ù†Ø§Ø¡ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø°Ù† Ø§Ù„ØµØ§Ø¯Ø± Ø¹Ù† Ø§Ù„Ø³ÙŠØ¯ Ù‚Ø§Ø¶ÙŠ Ø§Ù„Ø£Ø³Ø±Ø© Ø§Ù„Ù…ÙƒÙ„Ù Ø¨Ø§Ù„Ø²ÙˆØ§Ø¬ ÙˆØ§Ù„Ø·Ù„Ø§Ù‚ ØªØ­Øª Ø¹Ø¯Ø¯ {{court_permission_number}} ÙˆØªØ§Ø±ÙŠØ® {{court_permission_date}}ØŒ Ø­Ø¶Ø± Ø§Ù„Ø²ÙˆØ¬Ø§Ù† Ø§Ù„Ù…ØªØ±Ø§Ø¶ÙŠØ§Ù†: {{husband_name}} Ùˆ{{wife_name}}ØŒ ÙˆØ£Ø´Ù‡Ø¯Ø§ Ø¨Ø£Ù†Ù‡Ù…Ø§ Ø£Ù†Ù‡ÙŠØ§ Ø§Ù„Ø¹Ù„Ø§Ù‚Ø© Ø§Ù„Ø²ÙˆØ¬ÙŠØ© Ø¨Ø§Ù„ØªØ±Ø§Ø¶ÙŠ Ø¯ÙˆÙ† Ù†Ø²Ø§Ø¹ØŒ Ù…Ø¹ Ø£Ø¯Ø§Ø¡ Ù…Ø³ØªØ­Ù‚Ø§Øª Ø§Ù„Ù…ØªØ¹Ø© ÙˆØ§Ù„Ø¹Ø¯Ø© ÙˆÙ‚Ø¯Ø±Ù‡Ø§ {{compensation_amount}} Ø¯Ø±Ù‡Ù….",
                'content_fr' => "En vertu de l'autorisation judiciaire nÂ° {{court_permission_number}}, les Ã©poux ont consenti Ã  la rupture dÃ©finitive du lien conjugal par accord mutuel conformÃ©ment au Code de la Famille.",
                'variables' => ['court_permission_number', 'court_permission_date', 'husband_name', 'wife_name', 'compensation_amount'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'raj3a',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ø±Ø¬Ø¹Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© Ø¨Ø¹Ø¯ Ø§Ù„Ø·Ù„Ø§Ù‚ Ø§Ù„Ø±Ø¬Ø¹ÙŠ',
                'name_fr' => 'Acte de reprise conjugale (RajÃ¢a lÃ©gale)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ­Ø¶Ø± Ø§Ù„Ø²ÙˆØ¬: {{husband_name}} ÙˆØ£Ø´Ù‡Ø¯ Ø§Ù„Ø¹Ø¯Ù„ÙŠÙ† ÙÙŠ ÙØªØ±Ø© Ø§Ù„Ø¹Ø¯Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© Ø¨Ø£Ù†Ù‡ Ø±Ø§Ø¬Ø¹ Ø¥Ù„Ù‰ Ø¹ØµÙ…ØªÙ‡ Ø²ÙˆØ¬ØªÙ‡ ÙˆÙ…Ø¯Ø®ÙˆÙ„ØªÙ‡: {{wife_name}} Ø¹Ù„Ù‰ Ø§Ù„ØµØ¯Ø§Ù‚ ÙˆØ§Ù„Ø¹Ù‚Ø¯ Ø§Ù„Ø£ØµÙ„ÙŠ Ø§Ù„Ù…Ø¤Ø±Ø® ÙÙŠ {{original_marriage_date}}ØŒ ÙˆÙˆØ§ÙÙ‚Øª Ø§Ù„Ø²ÙˆØ¬Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø¬Ø¹Ø© Ø¨Ø­Ø¶ÙˆØ± Ø§Ù„Ø´Ø§Ù‡Ø¯ÙŠÙ†.",
                'content_fr' => 'Par-devant les Adoul, le mari a dÃ©clarÃ© solennellement reprendre son Ã©pouse dans les liens du mariage pendant le dÃ©lai lÃ©gal de viduitÃ© (Idda).',
                'variables' => ['husband_name', 'wife_name', 'original_marriage_date', 'divorce_act_reference'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'thobout_zawjia',
                'name_ar' => 'Ø±Ø³Ù… Ø¥Ø´Ù‡Ø§Ø¯ Ø«Ø¨ÙˆØª Ø§Ù„Ø²ÙˆØ¬ÙŠØ©',
                'name_fr' => 'Acte de constatation de mariage coutumier (Thobout Zawjia)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ¨Ù†Ø§Ø¡ Ø¹Ù„Ù‰ Ø§Ù„Ø­ÙƒÙ… Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ Ø§Ù„ØµØ§Ø¯Ø± Ø¹Ù† Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ© Ù‚Ø³Ù… Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø£Ø³Ø±Ø© ØªØ­Øª Ù…Ù„Ù Ø¹Ø¯Ø¯ {{judgment_number}} Ø¨ØªØ§Ø±ÙŠØ® {{judgment_date}} Ø§Ù„Ù‚Ø§Ø¶ÙŠ Ø¨Ø«Ø¨ÙˆØª Ø§Ù„Ø²ÙˆØ¬ÙŠØ© Ø¨ÙŠÙ† {{husband_name}} Ùˆ{{wife_name}} Ù…Ù†Ø° ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…Ø¹Ø§Ø´Ø±Ø© Ø§Ù„Ø²ÙˆØ¬ÙŠØ© ÙÙŠ {{cohabitation_date}} ÙˆØ¥Ø«Ø¨Ø§Øª Ù†Ø³Ø¨ Ø§Ù„Ø£Ø¨Ù†Ø§Ø¡.",
                'content_fr' => 'En exÃ©cution du jugement du Tribunal de PremiÃ¨re Instance confirmant la relation matrimoniale Ã©tablie et la filiation des enfants.',
                'variables' => ['judgment_number', 'judgment_date', 'husband_name', 'wife_name', 'cohabitation_date', 'children_names'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'hadana_nafaka',
                'name_ar' => 'Ø¥Ø´Ù‡Ø§Ø¯ Ø¨Ø§ØªÙØ§Ù‚ Ø§Ù„Ø­Ø¶Ø§Ù†Ø© ÙˆØ§Ù„Ù†ÙÙ‚Ø© ÙˆØ³ÙƒÙ†Ù‰ Ø§Ù„Ù…Ø­Ø¶ÙˆÙ†',
                'name_fr' => 'Accord authentifiÃ© de garde d\'enfants et pension alimentaire',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ§ØªÙÙ‚ Ø§Ù„Ø·Ø±ÙØ§Ù†: Ø§Ù„Ø£Ø¨ {{father_name}} ÙˆØ§Ù„Ø£Ù… {{mother_name}} Ø¹Ù„Ù‰ Ø¥Ø³Ù†Ø§Ø¯ Ø­Ø¶Ø§Ù†Ø© Ø§Ù„Ø£Ø¨Ù†Ø§Ø¡: {{children_names}} Ù„Ù„Ø£Ù…ØŒ Ù…Ø¹ Ø§Ù„ØªØ²Ø§Ù… Ø§Ù„Ø£Ø¨ Ø¨Ø£Ø¯Ø§Ø¡ Ù†ÙÙ‚Ø© Ø´Ù‡Ø±ÙŠØ© Ø´Ø§Ù…Ù„Ø© Ù‚Ø¯Ø±Ù‡Ø§ {{monthly_alimony}} Ø¯Ø±Ù‡Ù… Ù…ØºØ±Ø¨ÙŠØŒ Ù…Ø¹ ÙˆØ§Ø¬Ø¨ Ø³ÙƒÙ†Ù‰ Ø§Ù„Ù…Ø­Ø¶ÙˆÙ†.",
                'content_fr' => 'Convention parentale authentifiÃ©e confiant la garde des enfants Ã  la mÃ¨re avec engagement du pÃ¨re au versement de la pension mensuelle de {{monthly_alimony}} MAD.',
                'variables' => ['father_name', 'mother_name', 'children_names', 'monthly_alimony', 'housing_allowance'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'nasab_iqrar',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ø¥Ù‚Ø±Ø§Ø± Ø¨Ø§Ù„Ù†Ø³Ø¨ ÙˆØ§Ù„Ø¨Ù†ÙˆØ© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©',
                'name_fr' => 'Acte de reconnaissance de filiation et de paternitÃ©',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£Ù‚Ø± ÙˆØ§Ø¹ØªØ±Ù Ø§Ù„Ø³ÙŠØ¯: {{father_name}} (Ø¨.Øª.Ùˆ: {{father_cin}}) Ø¥Ù‚Ø±Ø§Ø±Ø§Ù‹ ØµØ­ÙŠØ­Ø§Ù‹ Ø´Ø±Ø¹ÙŠØ§Ù‹ Ù„Ø§ Ø±Ø¬Ø¹Ø© ÙÙŠÙ‡ Ø¨Ø£Ù† Ø§Ù„Ø§Ø¨Ù†/Ø§Ù„Ø§Ø¨Ù†Ø©: {{child_name}} Ø§Ù„Ù…ÙˆÙ„ÙˆØ¯ Ø¨ØªØ§Ø±ÙŠØ® {{birth_date}} Ø¨Ù…Ø¯ÙŠÙ†Ø© {{birth_city}} Ù‡Ùˆ Ø§Ø¨Ù†Ù‡ Ù…Ù† ØµÙ„Ø¨Ù‡ ÙˆÙ†Ø³Ø¨Ù‡ Ø§Ù„Ø´Ø±Ø¹ÙŠ.",
                'content_fr' => 'Reconnaissance expresse et irrÃ©vocable de paternitÃ© et de filiation lÃ©gitime Ã©tablie devant Adoul conformÃ©ment Ã  la Moudawana.',
                'variables' => ['father_name', 'father_cin', 'child_name', 'birth_date', 'birth_city'],
                'is_active' => true,
                'version' => 1,
            ],

            // 2. Ø§Ù„ØªØ±ÙƒØ§Øª ÙˆØ§Ù„Ù…ÙˆØ§Ø±ÙŠØ« ÙˆØ§Ù„ÙˆØµØ§ÙŠØ§
            [
                'type' => 'inheritance',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ø¥Ø±Ø§Ø«Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© ÙˆØ­ØµØ± Ø§Ù„ÙˆØ±Ø«Ø© ÙˆØ§Ù„Ù…Ø®Ù„Ù',
                'name_fr' => 'Acte de notoriÃ©tÃ© hÃ©rÃ©ditaire (Hiratha et dÃ©volution)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ¨Ø´Ù‡Ø§Ø¯Ø© Ù„ÙÙŠÙ Ø§Ù„Ø´Ù‡ÙˆØ¯ Ø§Ù„Ø¹Ø§Ø±ÙÙŠÙ† Ø¨Ø§Ù„Ù‡Ø§Ù„Ùƒ: {{deceased_name}} Ø§Ù„Ù…ØªÙˆÙÙ‰ Ø¨ØªØ§Ø±ÙŠØ® {{death_date}}ØŒ Ø¨Ø£Ù†Ù‡ ØªÙˆÙÙŠ Ø¹Ù† ÙˆØ±Ø«Ø© Ø´Ø±Ø¹ÙŠÙŠÙ† Ù…Ø­ØµÙˆØ±ÙŠÙ† ÙÙŠ: {{heirs_list}}ØŒ ÙˆÙ„Ø§ ÙˆØ§Ø±Ø« Ù„Ù‡ Ø³ÙˆØ§Ù‡Ù… Ø­Ø³Ø¨ Ø¹Ù„Ù…Ù‡Ù…ØŒ ÙˆØªØ±Ùƒ ØªØ±ÙƒØ© ÙˆÙ…Ø®Ù„ÙØ§Ù‹ Ø´Ø±Ø¹ÙŠØ§Ù‹ ØªØ¤ØµÙ„ ÙØ±ÙŠØ¶ØªÙ‡ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù†ØµØ¨Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø© Ø¨Ù…Ø¯ÙˆÙ†Ø© Ø§Ù„Ø£Ø³Ø±Ø©.",
                'content_fr' => "Acte d'hÃ©rÃ©ditÃ© authentifiÃ© constatant le dÃ©cÃ¨s de {{deceased_name}} survenu le {{death_date}} et Ã©tablissant la liste exclusive de ses hÃ©ritiers lÃ©gaux selon la dÃ©volution successorale islamique.",
                'variables' => ['deceased_name', 'death_date', 'death_place', 'heirs_list', 'estate_estimated_value'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'will',
                'name_ar' => 'Ø±Ø³Ù… ÙˆØµÙŠØ© Ø´Ø±Ø¹ÙŠØ© Ù…Ù†Ø¬Ø²Ø© ÙÙŠ Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø«Ù„Ø«',
                'name_fr' => 'Acte de testament authentique (Wassiya lÃ©gale)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£ÙˆØµÙ‰ Ø§Ù„Ù…ÙˆØµÙŠ: {{testator_name}} ÙÙŠ ØµØ­Ø© Ø¹Ù‚Ù„Ù‡ ÙˆØªÙ…Ø§Ù… Ø¥Ø¯Ø±Ø§ÙƒÙ‡ Ø¨Ù…Ø§ Ù‚Ø¯Ø±Ù‡ Ø«Ù„Ø« Ù…Ø§Ù„Ù‡ Ø£Ùˆ Ø§Ù„Ø¹Ù‚Ø§Ø± Ø§Ù„Ù…Ø°ÙƒÙˆØ± Ù„ÙØ§Ø¦Ø¯Ø©: {{beneficiary_name}} ØµØ¯Ù‚Ø© Ø¬Ø§Ø±ÙŠØ© Ù„ÙˆØ¬Ù‡ Ø§Ù„Ù„Ù‡ ØªØ¹Ø§Ù„Ù‰ ÙÙŠ Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø«Ù„Ø« Ø§Ù„Ø´Ø±Ø¹ÙŠ Ø§Ù„Ø¬Ø§Ø¦Ø² Ù‚Ø§Ù†ÙˆÙ†Ø§Ù‹.",
                'content_fr' => 'Le testateur {{testator_name}} lÃ¨gue authentiquement Ã  {{beneficiary_name}} les biens spÃ©cifiÃ©s dans la limite lÃ©gale du tiers rÃ©servataire conformÃ©ment aux rÃ¨gles du droit successoral marocain.',
                'variables' => ['testator_name', 'beneficiary_name', 'bequest_details'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'tarakah_qisma',
                'name_ar' => 'Ø±Ø³Ù… Ù‚Ø³Ù…Ø© Ø§Ù„ØªØ±ÙƒØ© Ø§Ù„Ø±Ø¶Ø§Ø¦ÙŠØ© ÙˆØªØµÙÙŠØ© Ø§Ù„Ù…ØªØ±ÙˆÙƒ',
                'name_fr' => 'Partage successoral amiable entre cohÃ©ritiers',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ­Ø¶Ø± Ø§Ù„ÙˆØ±Ø«Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠÙˆÙ† Ù„Ù„Ù‡Ø§Ù„Ùƒ Ø§Ù„Ù…Ø°ÙƒÙˆØ±ÙŠÙ† Ø¨Ø±Ø³Ù… Ø§Ù„Ø¥Ø±Ø§Ø«Ø©ØŒ ÙˆØ§ØªÙÙ‚ÙˆØ§ Ø¨Ø±Ø¶Ø§Ù‡Ù… ÙˆØ§Ø®ØªÙŠØ§Ø±Ù‡Ù… Ø¹Ù„Ù‰ Ù‚Ø³Ù…Ø© Ø¹Ù†Ø§ØµØ± Ø§Ù„ØªØ±ÙƒØ© Ø§Ù„Ù…Ø´ØªÙ…Ù„Ø© Ø¹Ù„Ù‰ {{estate_properties}} ÙˆØªÙÙˆÙŠØªÙ‡Ø§ ÙˆÙ…Ø®Ø§Ø±Ø¬ØªÙ‡Ø§ ÙˆÙÙ‚ Ø§Ù„Ø£Ù†ØµØ¨Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©.",
                'content_fr' => "Acte de partage dÃ©finitif et amiable des biens de la succession entre l'ensemble des cohÃ©ritiers.",
                'variables' => ['deceased_name', 'inheritance_act_ref', 'heirs_list', 'estate_properties', 'equalization_payment'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'tarakah_ihsa',
                'name_ar' => 'Ø±Ø³Ù… Ø¥Ø­ØµØ§Ø¡ Ù…ØªØ±ÙˆÙƒ Ø§Ù„Ù‡Ø§Ù„Ùƒ ÙˆØ­ØµØ± Ø§Ù„Ø¯ÙŠÙˆÙ†',
                'name_fr' => 'Inventaire des actifs et passifs successoraux',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ¨Ø·Ù„Ø¨ Ù…Ù† Ø°ÙˆÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ‚ØŒ ØªÙ… Ø­ØµØ± ÙˆØªÙ‚ÙŠÙŠØ¯ ÙƒØ§ÙØ© Ù…Ø§ Ø®Ù„ÙÙ‡ Ø§Ù„Ù‡Ø§Ù„Ùƒ: {{deceased_name}} Ù…Ù† Ø£Ù…ÙˆØ§Ù„ Ù†Ù‚Ø¯ÙŠØ© ÙˆØ¹Ù‚Ø§Ø±Ø§Øª ÙˆÙ…Ù†Ù‚ÙˆÙ„Ø§Øª ÙˆØ¯ÙŠÙˆÙ† Ù…Ø³ØªØ­Ù‚Ø© Ù„Ù‡ Ø£Ùˆ Ø¹Ù„ÙŠÙ‡ Ù„ØªØµÙÙŠØªÙ‡Ø§ Ù‚Ø¨Ù„ ØªÙˆØ²ÙŠØ¹ Ø§Ù„ÙØ±ÙŠØ¶Ø©.",
                'content_fr' => "ProcÃ¨s-verbal d'inventaire notariÃ© des biens mobiliers, immobiliers et crÃ©ances laissÃ©s par le dÃ©funt.",
                'variables' => ['deceased_name', 'real_estate_list', 'bank_accounts', 'debts_due'],
                'is_active' => true,
                'version' => 1,
            ],

            // 3. Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ© ÙˆØ§Ù„Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ø¹ÙŠÙ†ÙŠØ©
            [
                'type' => 'property_sale',
                'name_ar' => 'Ø¹Ù‚Ø¯ Ø¨ÙŠØ¹ Ø¹Ù‚Ø§Ø± Ù…Ø­ÙØ¸ / ØºÙŠØ± Ù…Ø­ÙØ¸',
                'name_fr' => 'Acte de vente immobiliÃ¨re dÃ©finitive',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ­Ø¶Ø± Ù„Ø¯Ù‰ Ø§Ù„Ø¹Ø¯Ù„ÙŠÙ† Ø¨Ù…ÙƒØªØ¨ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¨Ø§Ø¦Ø¹: {{seller_name}} (Ø¨.Øª.Ùˆ: {{seller_cin}}) ÙˆØ§Ù„Ù…Ø´ØªØ±ÙŠ: {{buyer_name}} (Ø¨.Øª.Ùˆ: {{buyer_cin}}).\nØ­ÙŠØ« ØµØ±Ø­ Ø§Ù„Ø¨Ø§Ø¦Ø¹ Ø¨Ø£Ù†Ù‡ Ø¨Ø§Ø¹ ÙˆØ£Ø³Ù‚Ø· ÙˆØªØ®Ù„Ù‰ Ø¹Ù† ÙƒØ§ÙØ© Ø§Ù„Ø¹Ù‚Ø§Ø± Ø§Ù„Ù…Ø³Ù…Ù‰ {{property_name}} Ø§Ù„ÙƒØ§Ø¦Ù† Ø¨Ù€ {{property_location}} Ø°ÙŠ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ø§Ù„ØªØ§Ù„ÙŠØ©: {{property_boundaries}} ÙˆØ±Ù‚Ù… Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ Ø¥Ù† ÙˆØ¬Ø¯: {{title_number}} Ø¨Ø«Ù…Ù† Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù…ØªÙÙ‚ Ø¹Ù„ÙŠÙ‡ Ù‚Ø¯Ø±Ù‡ {{sale_price}} Ø¯Ø±Ù‡Ù… Ù…Ø¤Ø¯Ù‰ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ù†Ù‚Ø¯Ø§ Ø£Ùˆ Ø¨Ø´ÙŠÙƒ Ø¨Ù†ÙƒÙŠ.",
                'content_fr' => "Par-devant les Adoul, le vendeur {{seller_name}} cÃ¨de et vend au profit de l'acquÃ©reur {{buyer_name}} le bien immobilier dÃ©signÃ© sous le nom {{property_name}}, sis Ã  {{property_location}}, titre foncier {{title_number}}, moyennant le prix global de {{sale_price}} MAD.",
                'variables' => ['seller_name', 'seller_cin', 'buyer_name', 'buyer_cin', 'property_name', 'property_location', 'title_number', 'property_boundaries', 'sale_price'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'property_promise',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„ÙˆØ¹Ø¯ Ø¨Ø§Ù„Ø¨ÙŠØ¹ Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ ÙˆØ£Ø¯Ø§Ø¡ Ø§Ù„Ø¹Ø±Ø¨ÙˆÙ†',
                'name_fr' => 'Promesse synallagmatique de vente immobiliÃ¨re avec arrhes',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nÙˆØ¹Ø¯ Ø§Ù„ÙˆØ§Ø¹Ø¯ {{promisor_name}} Ø¨Ø£Ù† ÙŠØ¨ÙŠØ¹ Ù„Ù„Ù…ÙˆØ¹ÙˆØ¯ Ù„Ù‡ {{promisee_name}} Ø§Ù„Ø¹Ù‚Ø§Ø± Ø§Ù„Ù…Ø³Ù…Ù‰ {{property_name}} Ø¨Ø«Ù…Ù† Ù‚Ø¯Ø±Ù‡ {{total_price}} Ø¯Ø±Ù‡Ù…ØŒ ÙˆÙ‚Ø¨Ø¶ Ø§Ù„ÙˆØ§Ø¹Ø¯ Ø¹Ø±Ø¨ÙˆÙ†Ø§Ù‹ Ù‚Ø¯Ø±Ù‡ {{deposit_amount}} Ø¯Ø±Ù‡Ù… Ø¹Ù„Ù‰ Ø£Ù† ÙŠØªÙ… Ø¥Ø¨Ø±Ø§Ù… Ø§Ù„Ø¹Ù‚Ø¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ø®Ù„Ø§Ù„ Ø£Ø¬Ù„ Ø£Ù‚ØµØ§Ù‡ {{deadline_date}}.",
                'content_fr' => "Promesse de vente notariÃ©e avec versement d'arrhes pour l'acquisition du bien immobilier sous condition suspensive.",
                'variables' => ['promisor_name', 'promisee_name', 'property_name', 'total_price', 'deposit_amount', 'deadline_date'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'mortgage',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ø±Ù‡Ù† Ø§Ù„Ø­ÙŠØ§Ø²ÙŠ / Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ø¶Ù…Ø§Ù† Ø¯ÙŠÙ†',
                'name_fr' => 'Acte d\'hypothÃ¨que et de nantissement en garantie de crÃ©ance',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£Ø´Ù‡Ø¯ Ø§Ù„Ø±Ø§Ù‡Ù†: {{mortgagor_name}} Ø¨Ø£Ù†Ù‡ Ø±Ù‡Ù† Ù„ÙØ§Ø¦Ø¯Ø© Ø§Ù„Ø¯Ø§Ø¦Ù† Ø§Ù„Ù…Ø±ØªÙ‡Ù†: {{mortgagee_name}} Ø§Ù„Ø¹Ù‚Ø§Ø± Ø°ÙŠ Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ: {{title_number}} Ù„Ø¶Ù…Ø§Ù† Ø³Ø¯Ø§Ø¯ Ø§Ù„Ø¯ÙŠÙ† Ø§Ù„Ø¨Ø§Ù„Øº Ù‚Ø¯Ø±Ù‡: {{debt_amount}} Ø¯Ø±Ù‡Ù….",
                'content_fr' => "Constitution d'hypothÃ¨que conventionnelle en garantie d'une crÃ©ance de {{debt_amount}} MAD.",
                'variables' => ['mortgagor_name', 'mortgagee_name', 'property_name', 'title_number', 'debt_amount', 'repayment_term'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'mainlevee',
                'name_ar' => 'Ø±Ø³Ù… Ø±ÙØ¹ Ø§Ù„ÙŠØ¯ ÙˆØ§Ù„ØªØ´Ø·ÙŠØ¨ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ù‡Ù† Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ',
                'name_fr' => 'Acte de mainlevÃ©e d\'hypothÃ¨que et quittance dÃ©finitive',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£Ø´Ù‡Ø¯ Ø§Ù„Ø¯Ø§Ø¦Ù† Ø§Ù„Ù…Ø±ØªÙ‡Ù†: {{creditor_name}} Ø¨Ø£Ù†Ù‡ Ø§Ø³ØªÙˆÙÙ‰ ÙƒØ§Ù…Ù„ Ø¯ÙŠÙ†Ù‡ Ù…Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†: {{debtor_name}}ØŒ ÙˆØ¹Ù„ÙŠÙ‡ ÙŠØ¹Ø·ÙŠ Ø±ÙØ¹ Ø§Ù„ÙŠØ¯ Ø§Ù„ØªØ§Ù… ÙˆØ§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ø¹Ù† Ø§Ù„Ø±Ù‡Ù† Ø§Ù„Ù…Ù‚ÙŠØ¯ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ù… Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠ Ø±Ù‚Ù…: {{title_number}} Ù„Ø¯Ù‰ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø© Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ©.",
                'content_fr' => "MainlevÃ©e totale et dÃ©finitive d'hypothÃ¨que suite Ã  l'extinction intÃ©grale de la dette garantie.",
                'variables' => ['creditor_name', 'debtor_name', 'title_number', 'mortgage_registration_ref'],
                'is_active' => true,
                'version' => 1,
            ],

            // 4. Ø§Ù„ØªØ¨Ø±Ø¹Ø§Øª ÙˆØ§Ù„Ø£ÙˆÙ‚Ø§Ù
            [
                'type' => 'donation',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ù‡Ø¨Ø© Ø§Ù„ØµØ±ÙŠØ­Ø© Ù…Ø¹ Ø¥Ø´Ù‡Ø§Ø¯ Ø§Ù„Ø­ÙˆØ² ÙˆØ§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©',
                'name_fr' => 'Acte de donation entre vifs (Hiba avec prise de possession)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nÙˆÙ‡Ø¨ Ø§Ù„ÙˆØ§Ù‡Ø¨: {{donor_name}} Ø¹Ù„Ù‰ ÙˆØ¬Ù‡ Ø§Ù„Ø¥Ø­Ø³Ø§Ù† Ø¯ÙˆÙ† Ø¹ÙˆØ¶ Ù„Ù„Ù…ÙˆÙ‡ÙˆØ¨ Ù„Ù‡: {{donee_name}} Ø§Ù„Ø¹Ù‚Ø§Ø± Ø§Ù„Ù…Ø³Ù…Ù‰ {{property_name}}ØŒ ÙˆØ¹Ø§ÙŠÙ† Ø§Ù„Ø¹Ø¯Ù„Ø§Ù† Ø­ÙˆØ² Ø§Ù„Ù…ÙˆÙ‡ÙˆØ¨ Ù„Ù‡ Ù„Ù„Ø¹Ù‚Ø§Ø± Ø­ÙˆØ²Ø§Ù‹ ØªØ§Ù…Ø§Ù‹ Ø´Ø±Ø¹ÙŠØ§Ù‹ ÙÙŠ Ø­ÙŠØ§Ø© Ø§Ù„ÙˆØ§Ù‡Ø¨ ÙˆØµØ­ØªÙ‡.",
                'content_fr' => 'Donation entre vifs avec constatation matÃ©rielle par les Adoul de la prise de possession effective (Hiyaza).',
                'variables' => ['donor_name', 'donee_name', 'property_name', 'possession_date'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'sadaqa',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„ØµØ¯Ù‚Ø© Ø§Ù„Ø¬Ø§Ø±ÙŠØ© Ù„ÙˆØ¬Ù‡ Ø§Ù„Ù„Ù‡ ØªØ¹Ø§Ù„Ù‰',
                'name_fr' => 'Acte d\'aumÃ´ne authentifiÃ©e (Sadaqa)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØªØµØ¯Ù‚ Ø§Ù„Ù…ØªØµØ¯Ù‚: {{donor_name}} ØªÙ‚Ø±Ø¨Ø§Ù‹ Ø¥Ù„Ù‰ Ø§Ù„Ù„Ù‡ ØªØ¹Ø§Ù„Ù‰ Ø¨Ø§Ù„Ø¹ÙŠÙ† Ø§Ù„Ù…Ø°ÙƒÙˆØ±Ø©: {{asset_details}} Ù„ÙØ§Ø¦Ø¯Ø©: {{beneficiary_name}} ØµØ¯Ù‚Ø© Ù†Ø§Ø¬Ø²Ø© Ù„Ø§ Ø±Ø¬ÙˆØ¹ ÙÙŠÙ‡Ø§.",
                'content_fr' => "Acte d'aumÃ´ne perpÃ©tuelle authentifiÃ© selon les rÃ¨gles du rite malÃ©kite.",
                'variables' => ['donor_name', 'beneficiary_name', 'asset_details'],
                'is_active' => true,
                'version' => 1,
            ],

            // 5. Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ø±ÙÙŠØ© ÙˆØ§Ù„Ù…Ù„ÙƒÙŠØ© ÙˆØ§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±
            [
                'type' => 'mulkiya_lafif',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ù…Ù„ÙƒÙŠØ© ÙˆØ§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø± (Ù„ÙÙŠÙ 12 Ø´Ø§Ù‡Ø¯Ø§Ù‹)',
                'name_fr' => 'Acte de notoriÃ©tÃ© acquisitive et de propriÃ©tÃ© (Lafif 12 tÃ©moins)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nÙŠØ´Ù‡Ø¯ Ø´Ù‡ÙˆØ¯ Ø§Ù„Ù„ÙÙŠÙ Ø§Ù„Ø§Ø«Ù†Ø§ Ø¹Ø´Ø± Ø§Ù„Ù…Ø°ÙƒÙˆØ±ÙˆÙ† Ø£Ø³ÙÙ„Ù‡ Ø¨Ø£Ù† Ø§Ù„Ø¹Ù‚Ø§Ø± Ø§Ù„ÙƒØ§Ø¦Ù† Ø¨Ù€ {{location}} Ø§Ù„Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù€ {{boundaries}} Ù‡Ùˆ Ù…Ù„Ùƒ Ù„Ù„Ù…Ø´Ù‡ÙˆØ¯ Ù„Ù‡: {{owner_name}} ÙŠØ­ÙˆØ²Ù‡ ÙˆÙŠØªØµØ±Ù ÙÙŠÙ‡ ØªØµØ±Ù Ø§Ù„Ù…Ø§Ù„Ùƒ ÙÙŠ Ù…Ù„ÙƒÙ‡ Ù…Ø¯Ø© ØªØ²ÙŠØ¯ Ø¹Ù† Ø¹Ø´Ø± Ø³Ù†ÙŠÙ† Ø¯ÙˆÙ† Ù…Ù†Ø§Ø²Ø¹ ÙˆÙ„Ø§ Ù…Ø¹Ø§Ø±Ø¶.",
                'content_fr' => 'Acte de notoriÃ©tÃ© acquisitive Ã©tabli par audition de douze tÃ©moins assermentÃ©s confirmant la possession paisible et continue.',
                'variables' => ['owner_name', 'location', 'boundaries', 'area', 'witnesses_12_list'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'conversion_islam',
                'name_ar' => 'Ø´Ù‡Ø§Ø¯Ø© Ø§Ø¹ØªÙ†Ø§Ù‚ ÙˆØ¯Ø®ÙˆÙ„ Ø¯ÙŠÙ† Ø§Ù„Ø¥Ø³Ù„Ø§Ù… Ø§Ù„Ø­Ù†ÙŠÙ',
                'name_fr' => 'Certificat de conversion Ã  l\'Islam',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡ ÙˆØ§Ù„ØµÙ„Ø§Ø© ÙˆØ§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„Ù‰ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡.\nØ­Ø¶Ø± Ø¨Ù…ÙƒØªØ¨ Ø§Ù„ØªÙˆØ«ÙŠÙ‚: {{full_name}} (Ø§Ù„Ø¬Ù†Ø³ÙŠØ©: {{nationality}}ØŒ Ø¬ÙˆØ§Ø² Ø³ÙØ±: {{passport_number}})ØŒ ÙˆØ£Ø¹Ù„Ù† Ø¨Ø±ØºØ¨ØªÙ‡ Ø§Ù„ØµØ§Ø¯Ù‚Ø© ÙˆØ§Ø®ØªÙŠØ§Ø±Ù‡ Ø§Ù„Ø­Ø± Ø§Ø¹ØªÙ†Ø§Ù‚ Ø¯ÙŠÙ† Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ØŒ ÙˆÙ†Ø·Ù‚ Ø¨Ø§Ù„Ø´Ù‡Ø§Ø¯ØªÙŠÙ†: Â«Ø£Ø´Ù‡Ø¯ Ø£Ù† Ù„Ø§ Ø¥Ù„Ù‡ Ø¥Ù„Ø§ Ø§Ù„Ù„Ù‡ØŒ ÙˆØ£Ø´Ù‡Ø¯ Ø£Ù† Ù…Ø­Ù…Ø¯Ø§Ù‹ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡Â» ÙˆØ§Ø®ØªØ§Ø± Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠ: {{islamic_name}}.",
                'content_fr' => "Attestation officielle de conversion Ã  l'Islam reÃ§ue par les Adoul aprÃ¨s prononciation de la Chahada.",
                'variables' => ['full_name', 'nationality', 'passport_number', 'islamic_name'],
                'is_active' => true,
                'version' => 1,
            ],

            // 6. Ø§Ù„ÙˆÙƒØ§Ù„Ø§Øª ÙˆØ§Ù„Ø§Ù„ØªØ²Ø§Ù…Ø§Øª
            [
                'type' => 'poa',
                'name_ar' => 'Ø±Ø³Ù… ÙˆÙƒØ§Ù„Ø© Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø¹Ø§Ù…Ø© / Ø®Ø§ØµØ©',
                'name_fr' => 'Procuration lÃ©gale authentique (Wakala)',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£Ø´Ù‡Ø¯ Ø§Ù„ÙˆØ§Ø¶Ø¹ Ø®Ø·Ù‡ Ø£Ø³ÙÙ„Ù‡ Ø§Ù„Ù…ÙˆÙƒÙ„: {{client_name}} (Ø¨.Øª.Ùˆ: {{cin}}) Ø¨Ø£Ù†Ù‡ ÙˆÙƒÙ„ ÙˆÙÙˆØ¶ Ø¹Ù†Ù‡ Ø§Ù„Ø³ÙŠØ¯: {{agent_name}} (Ø¨.Øª.Ùˆ: {{agent_cin}}) Ù„ÙŠÙ†ÙˆØ¨ Ø¹Ù†Ù‡ ÙˆÙŠÙ‚ÙˆÙ… Ù…Ù‚Ø§Ù…Ù‡ ÙÙŠ ÙƒØ§ÙØ© Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ù…ØªØ¹Ù„Ù‚Ø© Ø¨Ù€: {{scope}}ØŒ ÙˆÙƒØ§Ù„Ø© ØªØ§Ù…Ø© Ù…ÙÙˆØ¶Ø© Ù„Ø§ Ø±Ø¬ÙˆØ¹ ÙÙŠÙ‡Ø§ Ø¥Ù„Ø§ Ø¨Ø±Ø³Ù… Ù…Ù…Ø§Ø«Ù„.",
                'content_fr' => "Le mandant {{client_name}} donne par la prÃ©sente procuration spÃ©ciale et irrÃ©vocable Ã  {{agent_name}} afin d'agir en son nom pour {{scope}}.",
                'variables' => ['client_name', 'cin', 'agent_name', 'agent_cin', 'scope'],
                'is_active' => true,
                'version' => 1,
            ],
            [
                'type' => 'debt_recognition',
                'name_ar' => 'Ø±Ø³Ù… Ø§Ù„Ø§Ø¹ØªØ±Ø§Ù Ø¨Ø¯ÙŠÙ† ÙˆØ§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¨Ø§Ù„Ø£Ø¯Ø§Ø¡',
                'name_fr' => 'Acte de reconnaissance de dette et Ã©chÃ©ancier de remboursement',
                'content_ar' => "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡.\nØ£Ù‚Ø± ÙˆØ§Ø¹ØªØ±Ù Ø§Ù„Ù…Ø¯ÙŠÙ†: {{debtor_name}} (Ø¨.Øª.Ùˆ: {{debtor_cin}}) Ø¨Ø£Ù† ÙÙŠ Ø°Ù…ØªÙ‡ Ù„Ù„Ø¯Ø§Ø¦Ù†: {{creditor_name}} Ø¯ÙŠÙ†Ø§Ù‹ ÙˆØ§Ø¬Ø¨Ø§Ù‹ Ù‚Ø¯Ø±Ù‡: {{debt_amount}} Ø¯Ø±Ù‡Ù… Ù…ØºØ±Ø¨ÙŠØŒ Ø§Ù„ØªØ²Ù… Ø¨Ø³Ø¯Ø§Ø¯Ù‡ Ø¨ØªØ§Ø±ÙŠØ® Ø£Ù‚ØµØ§Ù‡ {{due_date}}.",
                'content_fr' => "Reconnaissance de dette formelle avec engagement irrÃ©vocable de paiement avant l'Ã©chÃ©ance convenue.",
                'variables' => ['debtor_name', 'debtor_cin', 'creditor_name', 'debt_amount', 'due_date'],
                'is_active' => true,
                'version' => 1,
            ],
        ];

        foreach ($templates as $t) {
            DocumentTemplate::updateOrCreate(['type' => $t['type']], $t);
        }
    }

    protected function seedClientsAndDossiers(string $tenantId, string $cityAr, string $cityFr): void
    {
        $clientsData = [
            ['cin' => 'A123456', 'name_ar' => 'Ø·Ø§Ø±Ù‚ Ø§Ù„Ù…Ù†ØµÙˆØ±ÙŠ', 'name_fr' => 'Tariq El Mansouri', 'name_ber' => 'âµŸâ´°âµ”âµ‰âµ‡ âµâµŽâµâµšâµ“âµ”âµ‰', 'phone' => '+212 661 112 233', 'email' => 'tariq.mansouri@gmail.com', 'gender' => 'male', 'marital_status' => 'married'],
            ['cin' => 'AB789012', 'name_ar' => 'ÙØ§Ø·Ù…Ø© Ø§Ù„Ø²Ù‡Ø±Ø§Ø¡ Ø§Ù„Ø¹Ù…Ø±Ø§Ù†ÙŠ', 'name_fr' => 'Fatima-Zahra El Amrani', 'name_ber' => 'â´¼â´°âµŸâµ‰âµŽâ´° âµâµ„âµŽâµ”â´°âµâµ‰', 'phone' => '+212 662 223 344', 'email' => 'fz.amrani@outlook.com', 'gender' => 'female', 'marital_status' => 'married'],
            ['cin' => 'BK345678', 'name_ar' => 'ÙŠÙˆØ³Ù Ø§Ù„ØªØ§Ø²ÙŠ', 'name_fr' => 'Youssef Tazi', 'name_ber' => 'âµ¢âµ“âµ™â´¼ âµœâ´°âµ£âµ‰', 'phone' => '+212 663 334 455', 'email' => 'youssef.tazi@yahoo.fr', 'gender' => 'male', 'marital_status' => 'single'],
            ['cin' => 'BL901234', 'name_ar' => 'Ù…Ø±ÙŠÙ… Ø¨Ù†Ø¬Ù„ÙˆÙ†', 'name_fr' => 'Meryem Benjelloun', 'name_ber' => 'âµŽâµ”âµ¢âµŽ â´±âµâµŠâµâµâµ“âµ', 'phone' => '+212 664 445 566', 'email' => 'meryem.benjelloun@gmail.com', 'gender' => 'female', 'marital_status' => 'single'],
            ['cin' => 'CD567890', 'name_ar' => 'Ø±Ø´ÙŠØ¯ Ø§Ù„Ø¹Ù„Ù…ÙŠ', 'name_fr' => 'Rachid El Alami', 'name_ber' => 'âµ”â´°âµ›âµ‰â´· âµâµ„â´°âµâ´°âµŽâµ‰', 'phone' => '+212 665 556 677', 'email' => 'rachid.alami@gmail.com', 'gender' => 'male', 'marital_status' => 'married'],
            ['cin' => 'EE123789', 'name_ar' => 'Ø®Ø¯ÙŠØ¬Ø© Ø§Ù„ÙØ§Ø³ÙŠ Ø§Ù„ÙÙ‡Ø±ÙŠ', 'name_fr' => 'Khadija Fassi Fihri', 'name_ber' => 'âµ…â´°â´·âµ‰âµŠâ´° â´¼â´°âµ™âµ‰', 'phone' => '+212 666 667 788', 'email' => 'k.fassi@menara.ma', 'gender' => 'female', 'marital_status' => 'widowed'],
            ['cin' => 'FB234567', 'name_ar' => 'Ø­Ù…Ø²Ø© Ø§Ù„ØµÙ‚Ù„ÙŠ', 'name_fr' => 'Hamza Sqalli', 'name_ber' => 'âµƒâ´°âµŽâµ£â´° âµšâµ‡âµâµ‰', 'phone' => '+212 667 778 899', 'email' => 'hamza.sqalli@gmail.com', 'gender' => 'male', 'marital_status' => 'single'],
            ['cin' => 'HH345678', 'name_ar' => 'Ø²ÙŠÙ†Ø¨ Ø§Ù„Ø´Ø±Ø§ÙŠØ¨ÙŠ', 'name_fr' => 'Zineb Chraibi', 'name_ber' => 'âµ£âµ‰âµâ´± âµ›âµ”â´°âµ¢â´±âµ‰', 'phone' => '+212 668 889 900', 'email' => 'zineb.chraibi@gmail.com', 'gender' => 'female', 'marital_status' => 'single'],
            ['cin' => 'K456789', 'name_ar' => 'Ø¹Ø¨Ø¯ Ø§Ù„Ø¹Ø²ÙŠØ² Ø§Ù„ÙƒØªØ§Ù†ÙŠ', 'name_fr' => 'Abdelaziz Kettani', 'name_ber' => 'âµ„â´±â´·âµâµ„âµ£âµ‰âµ£ â´½âµœâµœâ´°âµâµ‰', 'phone' => '+212 669 990 011', 'email' => 'a.kettani@adoul.ma', 'gender' => 'male', 'marital_status' => 'married'],
            ['cin' => 'M567890', 'name_ar' => 'Ø³Ù†Ø§Ø¡ Ø¨Ø±Ø§Ø¯Ø©', 'name_fr' => 'Sanaa Berrada', 'name_ber' => 'âµ™â´°âµâ´° â´±âµ”âµ”â´°â´·â´°', 'phone' => '+212 670 123 456', 'email' => 'sanaa.berrada@gmail.com', 'gender' => 'female', 'marital_status' => 'divorced'],
        ];

        $clients = [];
        foreach ($clientsData as $c) {
            $clients[] = Client::updateOrCreate(['cin' => $c['cin']], array_merge($c, [
                'birth_date' => '1988-05-14',
                'birth_city' => $cityAr,
                'address' => "Ø­ÙŠ Ø§Ù„Ø£Ù…Ù„ØŒ Ø²Ù†Ù‚Ø© 12ØŒ Ø±Ù‚Ù… 44ØŒ {$cityAr}",
            ]));
        }

        $adoulUser = User::first();
        $adoulId = $adoulUser?->id;

        $tenantShort = "CAB";

        $dossiersConfigs = [
            [
                'reference' => "DOS-2026-{$tenantShort}-00001",
                'type' => 'marriage',
                'status' => 'signed',
                'c1' => 0, 'c2' => 1,
                'due' => 1500, 'paid' => 1500,
                'act_date' => '2026-02-10',
                'signing_date' => '2026-02-12',
                'qadi_validation_date' => '2026-02-15',
                'qadi_reference' => "TAW-{$tenantShort}-9081",
                'details' => [
                    'mahr_amount' => 40000,
                    'mahr_paid' => 20000,
                    'mahr_deferred' => 20000,
                    'witness1_name' => 'Ø§Ù„Ø­Ø§Ø¬ Ø§Ù„Ø¨Ø´ÙŠØ± Ø§Ù„Ù…Ø±Ø§Ø¨Ø· (CIN: B554433)',
                    'witness2_name' => 'Ø§Ù„Ø£Ø³ØªØ§Ø° Ø¥Ø¯Ø±ÙŠØ³ Ø§Ù„ÙˆØ¯ØºÙŠØ±ÙŠ (CIN: C998877)',
                    'conditions' => 'Ø§ØªÙÙ‚ Ø§Ù„Ø·Ø±ÙØ§Ù† Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙƒÙ† Ø§Ù„Ù…Ø³ØªÙ‚Ù„ ÙˆÙ…ÙˆØ§ØµÙ„Ø© Ø§Ù„Ø²ÙˆØ¬Ø© Ù„Ø¹Ù…Ù„Ù‡Ø§ Ø§Ù„Ù†Ø¸Ø§Ù…ÙŠ.',
                ],
                'notes_ar' => 'Ø¹Ù‚Ø¯ Ø²ÙˆØ§Ø¬ Ø±Ø³Ù…ÙŠ ØªÙ… Ø§Ù„ØªØ£Ø´ÙŠØ± Ø¹Ù„ÙŠÙ‡ Ù…Ù† Ù‚Ø§Ø¶ÙŠ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø¨Ø§Ù„Ù…Ø­ÙƒÙ…Ø© Ø§Ù„Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠØ©.',
                'notes_fr' => 'Acte de mariage regularise et vise par le Juge de la famille.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00002",
                'type' => 'property_sale',
                'status' => 'pending_qadi',
                'c1' => 2, 'c2' => 4,
                'due' => 3500, 'paid' => 2000,
                'act_date' => '2026-03-01',
                'details' => [
                    'property_name' => 'Ø£Ø±Ø¶ ÙÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ù…Ø³Ù…Ø§Ø© Ø¬Ù†Ø§Ù† Ø§Ù„Ø®ÙŠØ±',
                    'property_location' => "Ø¶ÙˆØ§Ø­ÙŠ {$cityAr}ØŒ Ø·Ø±ÙŠÙ‚ Ø§Ù„Ù‚Ù†ÙŠØ·Ø±Ø©",
                    'property_boundaries' => 'Ø´Ù…Ø§Ù„Ø§ ÙˆØ§Ø¯ Ø¨Ù‡ØªØŒ Ø¬Ù†ÙˆØ¨Ø§ Ø·Ø±ÙŠÙ‚ Ø¹Ù…ÙˆÙ…ÙŠØ©ØŒ Ø´Ø±Ù‚Ø§ Ù…Ù„Ùƒ Ø¨Ù†ÙˆÙ†Ø©ØŒ ØºØ±Ø¨Ø§ Ù…Ù„Ùƒ Ø§Ù„ÙˆØ±Ø«Ø©',
                    'sale_price' => 380000,
                    'registration_status' => 'ØºÙŠØ± Ù…Ø­ÙØ¸ (Ù…Ø·Ù„Ø¨ ØªØ­ÙÙŠØ¸ Ø¹Ø¯Ø¯ 4552/33)',
                ],
                'notes_ar' => 'Ù…Ù„Ù Ø¨ÙŠØ¹ Ø¹Ù‚Ø§Ø± ØªÙ… Ø¥Ø±Ø³Ø§Ù„Ù‡ Ù„Ù‚Ø¶Ø§Ø¡ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ù‚ØµØ¯ Ø§Ù„ØªØ£Ø´ÙŠØ± ÙˆØ¥ØµØ¯Ø§Ø± Ø§Ù„Ø¥Ø°Ù†.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00003",
                'type' => 'poa',
                'status' => 'signed',
                'c1' => 5, 'c2' => 6,
                'due' => 800, 'paid' => 800,
                'act_date' => '2026-01-20',
                'signing_date' => '2026-01-22',
                'qadi_validation_date' => '2026-01-24',
                'qadi_reference' => "TAW-{$tenantShort}-8842",
                'details' => [
                    'scope' => 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù‚Ø§Ø±Ø§Øª ÙˆØ§Ù„ØªÙ…Ø«ÙŠÙ„ Ø£Ù…Ø§Ù… Ø§Ù„Ø¥Ø¯Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠØ© ÙˆÙ…ØµØ§Ù„Ø­ Ø§Ù„Ø¶Ø±Ø§Ø¦Ø¨ ÙˆØ§Ù„Ù…Ø­Ø§ÙØ¸Ø© Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ©',
                    'duration' => 'Ù…Ø­Ø¯Ø¯Ø© ÙÙŠ 5 Ø³Ù†ÙˆØ§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ¬Ø¯ÙŠØ¯',
                ],
                'notes_ar' => 'ØªÙˆÙƒÙŠÙ„ Ø±Ø³Ù…ÙŠ Ø´Ø§Ù…Ù„ Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù…ØªÙ„ÙƒØ§Øª Ø¨Ø§Ù„Ù…ØºØ±Ø¨.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00004",
                'type' => 'marriage',
                'status' => 'draft',
                'c1' => 6, 'c2' => 7,
                'due' => 1500, 'paid' => 500,
                'act_date' => '2026-03-15',
                'details' => [
                    'mahr_amount' => 50000,
                    'mahr_paid' => 50000,
                    'mahr_deferred' => 0,
                    'witness1_name' => 'Ø¹Ù…Ø± Ø§Ù„ØªÙ„Ù…Ø³Ø§Ù†ÙŠ (CIN: D123987)',
                    'witness2_name' => 'ÙƒÙ…Ø§Ù„ Ø§Ù„ØµÙ†Ù‡Ø§Ø¬ÙŠ (CIN: F654321)',
                ],
                'notes_ar' => 'ÙÙŠ Ø·ÙˆØ± ØªØ¬Ù…ÙŠØ¹ ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø·Ø¨ÙŠ ÙˆØ´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø®Ø·ÙˆØ¨Ø©.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00005",
                'type' => 'will',
                'status' => 'signed',
                'c1' => 8, 'c2' => 3,
                'due' => 1200, 'paid' => 1200,
                'act_date' => '2025-11-10',
                'signing_date' => '2025-11-12',
                'qadi_validation_date' => '2025-11-14',
                'qadi_reference' => "TAW-{$tenantShort}-7710",
                'details' => [
                    'beneficiary_name' => 'Ù…Ø±ÙŠÙ… Ø¨Ù†Ø¬Ù„ÙˆÙ†',
                    'bequest_details' => 'ÙˆØµÙŠØ© Ø¨Ø«Ù„Ø« Ø§Ù„ØªØ±ÙƒØ© Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ© Ø§Ù„Ù…ÙØ±Ø²Ø© Ø¨Ù…Ù‚ØªØ¶Ù‰ Ø±Ø³Ù… Ø§Ù„Ø¥Ø±Ø§Ø«Ø© Ø¹Ø¯Ø¯ 45',
                ],
                'notes_ar' => 'ÙˆØµÙŠØ© Ø´Ø±Ø¹ÙŠØ© Ù…Ø³ØªÙˆÙÙŠØ© Ø§Ù„Ø´Ø±ÙˆØ· ÙˆÙÙ‚ Ù…Ø¯ÙˆÙ†Ø© Ø§Ù„Ø£Ø³Ø±Ø©.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00006",
                'type' => 'divorce',
                'status' => 'archived',
                'c1' => 8, 'c2' => 9,
                'due' => 2000, 'paid' => 2000,
                'act_date' => '2025-08-04',
                'signing_date' => '2025-08-06',
                'qadi_validation_date' => '2025-08-08',
                'qadi_reference' => "TAW-{$tenantShort}-6214",
                'details' => [
                    'court_permission_number' => 'Ø­ÙƒÙ… Ù‚Ø¶Ø§Ø¦ÙŠ Ø¹Ø¯Ø¯ 1422/2025 Ø¨ØªØ§Ø±ÙŠØ® 15 ÙŠÙˆÙ„ÙŠÙˆØ² 2025',
                    'type' => 'Ø·Ù„Ø§Ù‚ Ø§ØªÙØ§Ù‚ÙŠ Ù…Ø¹ Ø¥Ø³Ù‚Ø§Ø· Ø§Ù„Ù…ØªØ¹Ø© ÙˆØ§Ù„Ù†ÙÙ‚Ø© Ø¨Ø±Ø¶Ù‰ Ø§Ù„Ø·Ø±ÙÙŠÙ†',
                ],
                'notes_ar' => 'Ù…Ù„Ù Ù…Ø¤Ø±Ø´Ù Ø¨Ø¹Ø¯ Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª ÙˆØ¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠØ© Ù„ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø¶Ø¨Ø·.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00007",
                'type' => 'property_gift',
                'status' => 'signed',
                'c1' => 0, 'c2' => 2,
                'due' => 2500, 'paid' => 2500,
                'act_date' => '2026-01-05',
                'signing_date' => '2026-01-07',
                'qadi_validation_date' => '2026-01-10',
                'qadi_reference' => "TAW-{$tenantShort}-8311",
                'details' => [
                    'property_name' => 'Ø´Ù‚Ø© Ø³ÙƒÙ†ÙŠØ© Ø¨Ø§Ù„Ø·Ø§Ø¨Ù‚ Ø§Ù„Ø£ÙˆÙ„',
                    'property_location' => "Ø´Ø§Ø±Ø¹ Ø§Ù„Ø­Ø³Ù† Ø§Ù„Ø«Ø§Ù†ÙŠØŒ {$cityAr}",
                    'relation' => 'Ù‡Ø¨Ø© Ù…Ù† Ø§Ù„Ø£Ø¨ Ù„Ø§Ø¨Ù†Ù‡ Ù…Ø¹ Ø§Ù„Ø­ÙˆØ² ÙˆØ§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„Ø´Ø±Ø¹ÙŠØ©',
                ],
                'notes_ar' => 'Ø±Ø³Ù… Ù‡Ø¨Ø© Ø¹Ù‚Ø§Ø±ÙŠØ© Ù…Ø¹ Ø§Ø´ØªØ±Ø§Ø· Ø§Ù„Ø­ÙˆØ² Ø§Ù„ØªØ§Ù….',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00008",
                'type' => 'certificate',
                'status' => 'signed',
                'c1' => 3, 'c2' => null,
                'due' => 500, 'paid' => 500,
                'act_date' => '2026-02-28',
                'signing_date' => '2026-02-28',
                'qadi_validation_date' => '2026-03-02',
                'qadi_reference' => "TAW-{$tenantShort}-9240",
                'details' => [
                    'certificate_type' => 'Ø´Ù‡Ø§Ø¯Ø© Ø§Ø³ØªÙ…Ø±Ø§Ø± ÙˆØ¹Ø¯Ù… ØªØµØ±Ù',
                ],
                'notes_ar' => 'Ø´Ù‡Ø§Ø¯Ø© Ø±Ø³Ù…ÙŠØ© Ù…ÙˆØ¬Ù‡Ø© Ù„Ù…Ø­Ø§ÙØ¸Ø© Ø§Ù„Ø£Ù…Ù„Ø§Ùƒ Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ©.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00009",
                'type' => 'property_pledge',
                'status' => 'draft',
                'c1' => 4, 'c2' => 0,
                'due' => 1800, 'paid' => 0,
                'act_date' => '2026-03-12',
                'details' => [
                    'pledge_amount' => 120000,
                    'loan_duration' => 'Ø³Ù†ØªØ§Ù†',
                ],
                'notes_ar' => 'Ø±Ø³Ù… Ø±Ù‡Ù† Ø­ÙŠØ§Ø²ÙŠ Ù„Ø¶Ù…Ø§Ù† Ø¯ÙŠÙ† ØªØ¬Ø§Ø±ÙŠ.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00010",
                'type' => 'revocation',
                'status' => 'signed',
                'c1' => 4, 'c2' => 1,
                'due' => 900, 'paid' => 900,
                'act_date' => '2026-02-18',
                'signing_date' => '2026-02-19',
                'qadi_validation_date' => '2026-02-20',
                'qadi_reference' => "TAW-{$tenantShort}-9125",
                'details' => [
                    'revocation_type' => 'Ø±Ø¬Ø¹Ø© Ø´Ø±Ø¹ÙŠØ© Ø®Ù„Ø§Ù„ Ø¹Ø¯Ø© Ø§Ù„Ø·Ù„Ø§Ù‚ Ø§Ù„Ø±Ø¬Ø¹ÙŠ Ø§Ù„Ø£ÙˆÙ„',
                ],
                'notes_ar' => 'Ø¥Ø´Ù‡Ø§Ø¯ Ø¨Ø§Ù„Ø±Ø¬Ø¹Ø© Ø§Ù„Ø²ÙˆØ¬ÙŠØ© Ø¨Ø­Ø¶ÙˆØ± Ø§Ù„Ø´Ø§Ù‡Ø¯ÙŠÙ†.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00011",
                'type' => 'marriage',
                'status' => 'pending_qadi',
                'c1' => 2, 'c2' => 3,
                'due' => 1500, 'paid' => 1500,
                'act_date' => '2026-03-10',
                'details' => [
                    'mahr_amount' => 35000,
                    'mahr_paid' => 35000,
                    'mahr_deferred' => 0,
                ],
                'notes_ar' => 'Ø£Ø­ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ¯ Ù‚Ø§Ø¶ÙŠ Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ù‚ØµØ¯ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ ÙˆØ§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¨Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00012",
                'type' => 'property_sale',
                'status' => 'signed',
                'c1' => 5, 'c2' => 6,
                'due' => 4200, 'paid' => 4200,
                'act_date' => '2026-01-14',
                'signing_date' => '2026-01-15',
                'qadi_validation_date' => '2026-01-18',
                'qadi_reference' => "TAW-{$tenantShort}-8502",
                'details' => [
                    'sale_price' => 540000,
                    'property_name' => 'Ø¨Ù‚Ø¹Ø© Ø£Ø±Ø¶ÙŠØ© Ù…Ø¬Ù‡Ø²Ø© Ø±Ù‚Ù… 89',
                ],
                'notes_ar' => 'ØªÙ… ØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ø¹Ù‚Ø¯ Ø¨Ø­Ø¶ÙˆØ± Ø§Ù„Ø£Ø·Ø±Ø§Ù ÙˆØ§Ù„ØªØ£Ø´ÙŠØ± Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00013",
                'type' => 'poa',
                'status' => 'draft',
                'c1' => 7, 'c2' => 2,
                'due' => 700, 'paid' => 350,
                'act_date' => '2026-03-16',
                'details' => [
                    'scope' => 'ØªÙˆÙƒÙŠÙ„ Ù„Ø³Ø­Ø¨ Ø§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© ÙˆØªØ³Ù„ÙŠÙ… Ø§Ù„Ø´ÙŠÙƒØ§Øª',
                ],
                'notes_ar' => 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ù„ØªØ¯Ù‚ÙŠÙ‚ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00014",
                'type' => 'certificate',
                'status' => 'archived',
                'c1' => 9, 'c2' => null,
                'due' => 450, 'paid' => 450,
                'act_date' => '2025-10-10',
                'signing_date' => '2025-10-11',
                'qadi_validation_date' => '2025-10-12',
                'qadi_reference' => "TAW-{$tenantShort}-7114",
                'details' => [
                    'certificate_type' => 'Ø¥Ø´Ù‡Ø§Ø¯ Ø¨Ø¥Ø±Ø§Ø«Ø© ÙˆØ­ØµØ± ÙˆØ±Ø«Ø©',
                ],
                'notes_ar' => 'Ù…Ù„Ù Ø¥Ø±Ø§Ø«Ø© Ø±Ø³Ù…ÙŠ ØªÙ… ØªØ³Ù„ÙŠÙ… Ù†Ø³Ø®Ù‡ Ù„Ù„Ø£Ø·Ø±Ø§Ù ÙˆØ£Ø±Ø´ÙØªÙ‡.',
            ],
            [
                'reference' => "DOS-2026-{$tenantShort}-00015",
                'type' => 'marriage',
                'status' => 'signed',
                'c1' => 6, 'c2' => 9,
                'due' => 1500, 'paid' => 1500,
                'act_date' => '2026-02-01',
                'signing_date' => '2026-02-02',
                'qadi_validation_date' => '2026-02-04',
                'qadi_reference' => "TAW-{$tenantShort}-8920",
                'details' => [
                    'mahr_amount' => 30000,
                    'mahr_paid' => 15000,
                    'mahr_deferred' => 15000,
                ],
                'notes_ar' => 'Ø¹Ù‚Ø¯ Ø²ÙˆØ§Ø¬ Ù…Ù†Ø¬Ø² ÙˆÙ…Ø³Ù„Ù… Ù„Ø±Ø¨ Ø§Ù„Ø£Ø³Ø±Ø©.',
            ],
        ];

        foreach ($dossiersConfigs as $dc) {
            $client1 = $clients[$dc['c1']];
            $client2 = isset($dc['c2']) ? $clients[$dc['c2']] : null;

            $dossier = Dossier::updateOrCreate(
                ['reference' => $dc['reference']],
                [
                    'type' => $dc['type'],
                    'status' => $dc['status'],
                    'client_id' => $client1->id,
                    'client2_id' => $client2?->id,
                    'adoul_id' => $adoulId,
                    'amount_due' => $dc['due'],
                    'amount_paid' => $dc['paid'],
                    'act_date' => $dc['act_date'],
                    'signing_date' => $dc['signing_date'] ?? null,
                    'qadi_validation_date' => $dc['qadi_validation_date'] ?? null,
                    'qadi_reference' => $dc['qadi_reference'] ?? null,
                    'details' => $dc['details'],
                    'notes_ar' => $dc['notes_ar'],
                    'notes_fr' => $dc['notes_fr'] ?? null,
                ]
            );

            // Seed initial act log
            ActLog::create([
                'dossier_id' => $dossier->id,
                'user_id' => $adoulId,
                'action' => 'created',
                'details' => ['note' => 'ØªÙ… ÙØªØ­ Ø§Ù„Ù…Ù„Ù Ø¨Ù…ÙƒØªØ¨ Ø§Ù„ØªÙˆØ«ÙŠÙ‚'],
                'created_at' => now()->subDays(rand(1, 40)),
            ]);

            if ($dossier->status === 'signed' || $dossier->status === 'archived') {
                ActLog::create([
                    'dossier_id' => $dossier->id,
                    'user_id' => $adoulId,
                    'action' => 'qadi_signed',
                    'details' => ['qadi_reference' => $dossier->qadi_reference, 'note' => 'ØªÙ… Ø§Ù„ØªØ£Ø´ÙŠØ± Ø§Ù„Ù‚Ø¶Ø§Ø¦ÙŠ ÙˆØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø±Ø³Ù…ÙŠØ©'],
                    'created_at' => now()->subDays(rand(1, 20)),
                ]);
            }
        }

        // 5. Seed 5 appointments
        $appts = [
            [
                'client_id' => $clients[0]->id,
                'type' => 'marriage',
                'scheduled_at' => now()->addDays(1)->setTime(10, 0),
                'status' => 'confirmed',
                'notes' => 'Ø¬Ù„Ø³Ø© Ø§Ø³ØªÙ…Ø§Ø¹ ÙˆØªÙˆÙ‚ÙŠØ¹ Ø¹Ù‚Ø¯ Ø§Ù„Ø²ÙˆØ§Ø¬ Ù…Ø¹ Ø§Ù„Ø´Ø§Ù‡Ø¯ÙŠÙ†',
            ],
            [
                'client_id' => $clients[2]->id,
                'type' => 'property_sale',
                'scheduled_at' => now()->addDays(2)->setTime(14, 30),
                'status' => 'confirmed',
                'notes' => 'Ø§Ø³ØªÙ„Ø§Ù… Ø£ØµÙ„ Ø§Ù„Ù…Ù„ÙƒÙŠØ© ÙˆØ±Ø³Ù… Ø§Ù„Ø´Ø±Ø§Ø¡ Ù„Ù„Ù…Ø·Ø§Ø¨Ù‚Ø© Ø§Ù„Ø¹Ù‚Ø§Ø±ÙŠØ©',
            ],
            [
                'client_id' => $clients[5]->id,
                'type' => 'poa',
                'scheduled_at' => now()->addDays(3)->setTime(11, 0),
                'status' => 'pending',
                'notes' => 'Ø·Ù„Ø¨ Ø¥Ø¹Ø¯Ø§Ø¯ ØªÙˆÙƒÙŠÙ„ Ø±Ø³Ù…ÙŠ Ø¹Ø§Ù…',
            ],
            [
                'client_id' => null,
                'client_name' => 'Ø§Ù„Ø³ÙŠØ¯ Ù…ØµØ·ÙÙ‰ Ø§Ù„Ø¥Ø¯Ø±ÙŠØ³ÙŠ',
                'client_phone' => '+212 661 998 877',
                'client_email' => 'm.idrissi@gmail.com',
                'type' => 'marriage',
                'scheduled_at' => now()->addDays(4)->setTime(16, 0),
                'status' => 'pending',
                'is_citizen_request' => true,
                'notes' => 'Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯ Ø¹Ù† Ø·Ø±ÙŠÙ‚ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ù„Ø­Ø¬Ø² Ø¹Ù‚Ø¯ Ø²ÙˆØ§Ø¬',
            ],
            [
                'client_id' => $clients[8]->id,
                'type' => 'certificate',
                'scheduled_at' => now()->subDays(1)->setTime(9, 30),
                'status' => 'completed',
                'notes' => 'ØªØ³Ù„ÙŠÙ… Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±',
            ],
        ];

        foreach ($appts as $ap) {
            Appointment::create($ap);
        }
    }
}
