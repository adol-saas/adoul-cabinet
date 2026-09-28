<?php

declare(strict_types=1);

namespace App\Services;

class MoroccanLegalTariffService
{
    /**
     * Calculate statutory Adoul honoraires, Treasury registration taxes, and Court stamps.
     *
     * @param string $actType
     * @param float $declaredValue Transaction value or property price in MAD (DH)
     * @param array $options Additional statutory flags (is_indigent, indigent_decree_ref, etc.)
     * @return array
     */
    public static function calculate(string $actType, float $declaredValue = 0.0, array $options = []): array
    {
        $isIndigent = !empty($options['is_indigent']) || !empty($options['is_statutory_free']);

        // 1. Statutory Free Services under Law 16.03 (مجانية بنص القانون)
        if ($isIndigent || in_array($actType, ['islam_conversion', 'crescent_sighting', 'indigent_marriage'], true)) {
            $reason = match ($actType) {
                'islam_conversion' => 'شهادة اعتناق الإسلام (مجانية بنص المادة 36 من القانون 16.03)',
                'crescent_sighting' => 'مراقبة الهلال (خدمة وطنية شرعية مجانية)',
                'indigent_marriage' => 'زواج في حالة العسر (معفى بأمر قاضي التوثيق بالتناوب)',
                default => 'إعفاء قانوني معتمد من قاضي التوثيق',
            };

            return [
                'is_free' => true,
                'free_reason' => $reason,
                'adoul_fee' => 0.0,
                'tax_registration' => 0.0,
                'court_stamp' => 0.0,
                'total_cost' => 0.0,
                'currency' => 'MAD',
                'breakdown' => [
                    ['label_ar' => 'أتعاب السادة العدول', 'amount' => 0.0, 'note' => 'معفى بقوة القانون'],
                    ['label_ar' => 'واجبات التسجيل (إدارة الضرائب)', 'amount' => 0.0, 'note' => 'معفى'],
                    ['label_ar' => 'رسوم المحكمة والتمبر القضائي', 'amount' => 0.0, 'note' => 'معفى'],
                ],
            ];
        }

        // 2. Standard Tariff & Moroccan Tax Code Rules
        $adoulFee = 500.0;
        $taxRegistration = 200.0;
        $courtStamp = 100.0;

        switch ($actType) {
            case 'marriage':
                $adoulFee = 500.0;
                $taxRegistration = 200.0; // Fixed flat marriage registration tax
                $courtStamp = 100.0; // Family court stamp
                break;

            case 'divorce':
                $adoulFee = 600.0;
                $taxRegistration = 200.0;
                $courtStamp = 100.0;
                break;

            case 'revocation':
                $adoulFee = 350.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;

            case 'poa':
                $adoulFee = 400.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;

            case 'property_sale':
                // Registration Tax: 4% for unregistered/requisition real estate (المدونة العامة للضرائب)
                $taxRegistration = $declaredValue > 0 ? round($declaredValue * 0.04, 2) : 1000.0;
                if ($taxRegistration < 1000.0) {
                    $taxRegistration = 1000.0;
                }

                // Proportional Adoul fee brackets
                if ($declaredValue <= 50000.0) {
                    $adoulFee = max(800.0, round($declaredValue * 0.015, 2));
                } elseif ($declaredValue <= 200000.0) {
                    $adoulFee = round(750.0 + (($declaredValue - 50000.0) * 0.01), 2);
                } elseif ($declaredValue <= 1000000.0) {
                    $adoulFee = round(2250.0 + (($declaredValue - 200000.0) * 0.005), 2);
                } else {
                    $adoulFee = round(6250.0 + (($declaredValue - 1000000.0) * 0.0025), 2);
                }
                $courtStamp = 200.0;
                break;

            case 'property_gift':
                // Donation direct ascendants/descendants: 1.5%
                $taxRegistration = $declaredValue > 0 ? round($declaredValue * 0.015, 2) : 500.0;
                $adoulFee = $declaredValue > 0 ? max(800.0, round($declaredValue * 0.0075, 2)) : 1000.0;
                $courtStamp = 150.0;
                break;

            case 'lafif_property':
                // Mulkiya Lafif with 12 witnesses + field transport
                $adoulFee = 1500.0;
                $taxRegistration = 200.0;
                $courtStamp = 150.0;
                break;

            case 'will':
                $adoulFee = 800.0;
                $taxRegistration = 200.0;
                $courtStamp = 100.0;
                break;

            case 'mortgage':
                $taxRegistration = $declaredValue > 0 ? round($declaredValue * 0.015, 2) : 500.0;
                $adoulFee = $declaredValue > 0 ? max(500.0, round($declaredValue * 0.005, 2)) : 600.0;
                $courtStamp = 100.0;
                break;

            case 'certificate':
            default:
                $adoulFee = 350.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;
        }

        $totalCost = round($adoulFee + $taxRegistration + $courtStamp, 2);

        return [
            'is_free' => false,
            'free_reason' => null,
            'adoul_fee' => $adoulFee,
            'tax_registration' => $taxRegistration,
            'court_stamp' => $courtStamp,
            'total_cost' => $totalCost,
            'currency' => 'MAD',
            'breakdown' => [
                [
                    'label_ar' => 'أتعاب السادة العدول (المرسوم الوزاري للتعريفة)',
                    'label_fr' => 'Honoraires légaux des Adoul',
                    'amount' => $adoulFee,
                    'note' => 'تشمل التلقي الثنائي والتحرير والإشهاد',
                ],
                [
                    'label_ar' => 'واجبات التسجيل (المدونة العامة للضرائب DGI)',
                    'label_fr' => 'Droits d’enregistrement (DGI)',
                    'amount' => $taxRegistration,
                    'note' => 'تؤدى لفائدة قابض إدارة الضرائب',
                ],
                [
                    'label_ar' => 'رسوم المحكمة والتمبر القضائي',
                    'label_fr' => 'Taxes judiciaires & Timbre',
                    'amount' => $courtStamp,
                    'note' => 'تؤدى بصندوق المحكمة الابتدائية للخطاب',
                ],
            ],
        ];
    }
}
