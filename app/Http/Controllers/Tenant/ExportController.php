<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use App\Services\MoroccanLegalTariffService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function printDossier(Dossier $dossier): Response
    {
        $dossier->load(['client', 'client2', 'adoul']);
        $officeSetting = OfficeSetting::first();
        $template = DocumentTemplate::where('type', $dossier->type)->where('is_active', true)->first();

        $verifyUrl = url("/verify/{$dossier->reference}");

        // Build rich dynamic variables dictionary from dossier & clients
        $client = $dossier->client;
        $client2 = $dossier->client2;
        $details = $dossier->details ?? [];

        $replacements = [
            // Parties & Family
            '{{husband_name}}' => $client->name_ar,
            '{{husband_cin}}' => $client->cin,
            '{{husband_birth_date}}' => $client->birth_date ? $client->birth_date->format('Y/m/d') : 'محدد بالرسم',
            '{{husband_profession}}' => $client->profession ?? 'حسب التصريح',
            '{{husband_address}}' => $client->address ?? 'بمقر سكناه',
            '{{wife_name}}' => $client2?->name_ar ?? 'الزوجة المسماة',
            '{{wife_cin}}' => $client2?->cin ?? 'بطاقتها الوطنية',
            '{{wife_birth_date}}' => $client2?->birth_date ? $client2->birth_date->format('Y/m/d') : 'محدد بالرسم',
            '{{wife_profession}}' => $client2?->profession ?? 'حسب التصريح',
            '{{wife_address}}' => $client2?->address ?? 'بمقر سكناها',
            '{{client_name}}' => $client->name_ar,
            '{{cin}}' => $client->cin,

            // Mahr & Marriage specifics
            '{{mahr_amount}}' => isset($details['mahr_amount']) ? number_format((float) $details['mahr_amount'], 2).' درهم' : 'خمسون ألف درهم (50.000,00 درهم)',
            '{{mahr_paid}}' => isset($details['mahr_paid']) ? number_format((float) $details['mahr_paid'], 2).' درهم' : 'مقبوض بحضرة شاهدي عدل',
            '{{mahr_deferred}}' => isset($details['mahr_deferred']) ? number_format((float) $details['mahr_deferred'], 2).' درهم' : 'باقي في الذمة إلى أجل مسمى',
            '{{witness1_name}}' => $details['witness1_name'] ?? 'الشاهد العدل الأول',
            '{{witness1_cin}}' => $details['witness1_cin'] ?? '',
            '{{witness2_name}}' => $details['witness2_name'] ?? 'الشاهد العدل الثاني',
            '{{witness2_cin}}' => $details['witness2_cin'] ?? '',

            // Real Estate & Commercial
            '{{seller_name}}' => $client->name_ar,
            '{{seller_cin}}' => $client->cin,
            '{{buyer_name}}' => $client2?->name_ar ?? 'المشتري المسمى أعلاه',
            '{{buyer_cin}}' => $client2?->cin ?? '',
            '{{property_name}}' => $details['property_name'] ?? 'العقار موضوع الرسم',
            '{{title_number}}' => $details['title_number'] ?? 'الرسم العقاري عدد (محدد لدى المحافظة)',
            '{{property_area}}' => $details['property_area'] ?? 'حسب الثابت بالصك العقاري',
            '{{property_location}}' => $details['property_location'] ?? 'الكائن بنفوذ الدائرة الحضرية',
            '{{property_boundaries}}' => $details['property_boundaries'] ?? 'المحدد بالحدود الأربعة المعتبرة',
            '{{sale_price}}' => isset($details['sale_price']) ? number_format((float) $details['sale_price'], 2).' درهم مغربي' : 'الثمن الإجمالي المتفق عليه',
            '{{payment_method}}' => $details['payment_method'] ?? 'نقداً وأداءً تاماً بحضرة الشهود',

            // Lafif (12 witnesses)
            '{{lafif_witnesses}}' => $details['lafif_witnesses'] ?? 'اثنا عشر شاهداً من أهل الفضل والعدالة العارفين بالمدخل والمخرج',

            // Succession & Wills
            '{{deceased_name}}' => $details['deceased_name'] ?? $client->name_ar,
            '{{date_of_death}}' => $details['date_of_death'] ?? 'وفق رسم الوفاة المسجل',
            '{{heirs_list}}' => $details['heirs_list'] ?? 'الورثة المستحقون طبقاً للأنصبة الشرعية الواردة بالفريضة',
            '{{will_amount}}' => $details['will_amount'] ?? 'في حدود الثلث الجائز شرعاً',

            // Agency & Debts
            '{{agent_name}}' => $client2?->name_ar ?? 'الوكيل المفوض له قانوناً',
            '{{principal_name}}' => $client->name_ar,
            '{{creditor_name}}' => $client->name_ar,
            '{{debtor_name}}' => $client2?->name_ar ?? 'المدين الملتزم',
            '{{debt_amount}}' => isset($details['debt_amount']) ? number_format((float) $details['debt_amount'], 2).' درهم' : 'المبلغ محل الدين الثابت',

            // Office & Dates
            '{{act_reference}}' => $dossier->reference,
            '{{act_date}}' => $dossier->act_date ? $dossier->act_date->format('Y/m/d') : now()->format('Y/m/d'),
            '{{city}}' => $officeSetting?->city ?? 'المملكة المغربية',
            '{{court_name}}' => 'المحكمة الابتدائية ب'.($officeSetting?->city ?? 'الرباط'),
            '{{qadi_name}}' => $officeSetting?->qadi_name ?? 'قاضي التوثيق المشرف',
            '{{adoul_1_name}}' => $dossier->adoul?->name ?? 'العدل الأول الموثق',
            '{{adoul_2_name}}' => $details['adoul_2_name'] ?? 'العدل الثاني الشريك',
            '{{office_name}}' => $officeSetting?->office_name_ar ?? 'مكتب السادة العدول',
        ];

        // Interpolate variables
        $actTextAr = $dossier->notes_ar;
        $actTextFr = $dossier->notes_fr;

        if ($template) {
            $actTextAr = str_replace(array_keys($replacements), array_values($replacements), $template->content_ar);
            $actTextFr = str_replace(array_keys($replacements), array_values($replacements), $template->content_fr);
        } elseif (! empty($actTextAr)) {
            $actTextAr = str_replace(array_keys($replacements), array_values($replacements), $actTextAr);
        }

        $dossier->logAction('printed', auth()->id(), [
            'note' => 'تم استخراج نسخة الطباعة الرسمية للرسم العدلي',
        ]);

        return Inertia::render('tenant/dossiers/print', [
            'dossier' => $dossier,
            'officeSetting' => $officeSetting,
            'verifyUrl' => $verifyUrl,
            'actTextAr' => $actTextAr,
            'actTextFr' => $actTextFr,
            'availableVariables' => $replacements,
        ]);
    }

    public function exportClientsCsv(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="clients_'.date('Ymd_His').'.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM so Excel opens Arabic correctly
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['رقم البطاقة الوطنية (CIN)', 'الاسم بالعربية', 'الاسم بالفرنسية', 'الهاتف', 'البريد الإلكتروني', 'تاريخ الازدياد', 'مكان الازدياد', 'تاريخ التسجيل']);

            $clients = Client::orderBy('name_ar')->get();
            foreach ($clients as $c) {
                fputcsv($handle, [
                    $c->cin,
                    $c->name_ar,
                    $c->name_fr,
                    $c->phone,
                    $c->email,
                    $c->birth_date ? $c->birth_date->format('Y-m-d') : '',
                    $c->birth_city,
                    $c->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function exportDossiersCsv(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="dossiers_'.date('Ymd_His').'.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['المرجع الرسمي', 'نوع العقد', 'الحالة', 'الطرف الأول', 'رقم البطاقة', 'الطرف الثاني', 'المبلغ المؤدى', 'المبلغ الإجمالي', 'تاريخ الرسم', 'تأشير قاضي التوثيق']);

            $dossiers = Dossier::with(['client', 'client2'])->latest('act_date')->get();
            foreach ($dossiers as $d) {
                fputcsv($handle, [
                    $d->reference,
                    $d->type,
                    $d->status,
                    $d->client?->name_ar ?? '',
                    $d->client?->cin ?? '',
                    $d->client2?->name_ar ?? '',
                    $d->amount_paid,
                    $d->amount_due,
                    $d->act_date ? $d->act_date->format('Y-m-d') : '',
                    $d->qadi_reference ?? '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function exportClientsPdf(): Response
    {
        $officeSetting = OfficeSetting::first();
        $clients = Client::orderBy('name_ar')->get();

        return Inertia::render('tenant/clients/print', [
            'clients' => $clients,
            'officeSetting' => $officeSetting,
            'generatedAt' => now()->format('Y/m/d H:i'),
        ]);
    }

    public function exportDossiersPdf(): Response
    {
        $officeSetting = OfficeSetting::first();
        $dossiers = Dossier::with(['client', 'client2', 'adoul'])->latest('act_date')->get();

        return Inertia::render('tenant/dossiers/print-register', [
            'dossiers' => $dossiers,
            'officeSetting' => $officeSetting,
            'generatedAt' => now()->format('Y/m/d H:i'),
        ]);
    }

    public function feeStatement(Dossier $dossier): Response
    {
        $dossier->load(['client', 'client2', 'adoul']);
        $officeSetting = OfficeSetting::first();
        $details = $dossier->details ?? [];

        $declaredValue = (float) ($details['property_price'] ?? $details['declared_value'] ?? $details['loan_amount'] ?? 0.0);
        $options = [
            'is_indigent' => !empty($details['is_indigent']),
            'is_statutory_free' => !empty($details['is_statutory_free']),
        ];

        $tariff = MoroccanLegalTariffService::calculate($dossier->type, $declaredValue, $options);

        $centralHost = parse_url(config('app.url', 'http://adoul.accesspoint.ma'), PHP_URL_HOST)
            ?? (config('tenancy.central_domains')[0] ?? 'adoul.accesspoint.ma');
        $scheme = request()->getScheme();
        $verifyUrl = "{$scheme}://{$centralHost}/verify/{$dossier->reference}";

        return Inertia::render('tenant/dossiers/fee-statement', [
            'dossier' => $dossier,
            'officeSetting' => $officeSetting,
            'tariff' => $tariff,
            'declaredValue' => $declaredValue,
            'verifyUrl' => $verifyUrl,
        ]);
    }
}
