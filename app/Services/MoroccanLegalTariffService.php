<?php

declare(strict_types=1);

namespace App\Services;

class MoroccanLegalTariffService
{
    /**
     * Calculate statutory Adoul honoraires (Décret 2-08-378), Treasury registration taxes (CGI), and Court stamps.
     *
     * @param string $actType
     * @param float $declaredValue Transaction value or property price in MAD (DH)
     * @param array $options Additional statutory flags (is_indigent, has_ancfcc, etc.)
     * @return array
     */
    public static function calculate(string $actType, float $declaredValue = 0.0, array $options = []): array
    {
        $isIndigent = !empty($options['is_indigent']) || !empty($options['is_statutory_free']);

        // 1. Statutory Free Services under Law 16.03 (مجانية بنص القانون - المادة 36)
        if ($isIndigent || in_array($actType, ['islam_conversion', 'crescent_sighting', 'indigent_marriage', 'conversion_islam'], true)) {
            $reason = match ($actType) {
                'islam_conversion', 'conversion_islam' => 'شهادة اعتناق الإسلام (مجانية بنص المادة 36 من القانون 16.03)',
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
                'ancfcc_fee' => 0.0,
                'total_cost' => 0.0,
                'currency' => 'MAD',
                'breakdown' => [
                    ['label_ar' => 'أتعاب السادة العدول', 'amount' => 0.0, 'note' => 'معفى بقوة القانون'],
                    ['label_ar' => 'واجبات التسجيل (إدارة الضرائب)', 'amount' => 0.0, 'note' => 'معفى'],
                    ['label_ar' => 'رسوم المحكمة والتمبر القضائي', 'amount' => 0.0, 'note' => 'معفى'],
                ],
            ];
        }

        // 2. Standard Tariff & Moroccan Tax Code Rules (Décret 2-08-378 & CGI)
        $adoulFee = 500.0;
        $taxRegistration = 200.0;
        $courtStamp = 100.0;
        $ancfccFee = 0.0;

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

            case 'raj3a':
            case 'revocation':
                $adoulFee = 350.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;

            case 'thobout_zawjia':
                $adoulFee = 500.0;
                $taxRegistration = 200.0;
                $courtStamp = 100.0;
                break;

            case 'hadana_nafaka':
                $adoulFee = 400.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;

            case 'poa':
                $adoulFee = 400.0;
                $taxRegistration = 200.0;
                $courtStamp = 50.0;
                break;

            case 'property_sale':
            case 'property_promise':
                // Registration Tax: 4% for built / 5% for vacant lands (المدونة العامة للضرائب)
                $taxRegistration = $declaredValue > 0 ? round($declaredValue * 0.04, 2) : 1000.0;
                if ($taxRegistration < 1000.0) {
                    $taxRegistration = 1000.0;
                }

                // Proportional Adoul fee brackets (Décret 2-08-378)
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

                // ANCFCC Land Conservation (1% + 150 DH fixe + 100 DH certificat)
                if (!empty($options['has_ancfcc']) || $declaredValue > 0) {
                    $ancfccFee = round(($declaredValue * 0.01) + 250.0, 2);
                }
                break;

            case 'donation':
            case 'sadaqa':
            case 'property_gift':
                // Donation direct ascendants/descendants: 1.5%
                $taxRegistration = $declaredValue > 0 ? round($declaredValue * 0.015, 2) : 500.0;
                $adoulFee = $declaredValue > 0 ? max(800.0, round($declaredValue * 0.0075, 2)) : 1000.0;
                $courtStamp = 150.0;
                if (!empty($options['has_ancfcc']) && $declaredValue > 0) {
                    $ancfccFee = round(($declaredValue * 0.01) + 250.0, 2);
                }
                break;

            case 'mulkiya_lafif':
            case 'lafif_property':
                // Mulkiya Lafif with 12 witnesses + field transport
                $adoulFee = 1500.0;
                $taxRegistration = 200.0;
                $courtStamp = 150.0;
                break;

            case 'inheritance':
            case 'will':
                $adoulFee = 800.0;
                $taxRegistration = 200.0;
                $courtStamp = 100.0;
                break;

            case 'tarakah_qisma':
                // Partage amiable
                $taxRegistration = $declaredValue > 0 ? max(1000.0, round($declaredValue * 0.015, 2)) : 500.0;
                $adoulFee = $declaredValue > 0 ? max(1000.0, round($declaredValue * 0.005, 2)) : 1200.0;
                $courtStamp = 200.0;
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

        $totalCost = round($adoulFee + $taxRegistration + $courtStamp + $ancfccFee, 2);

        $breakdown = [
            [
                'label_ar' => 'أتعاب السادة العدول (المرسوم الوزاري للتعريفة 2-08-378)',
                'label_fr' => 'Honoraires réglementaires des Adoul',
                'amount' => $adoulFee,
                'note' => 'تشمل التلقي الثنائي والتحرير والإشهاد',
            ],
            [
                'label_ar' => 'واجبات التسجيل (المدونة العامة للضرائب DGI)',
                'label_fr' => 'Droits d’enregistrement fiscaux (DGI)',
                'amount' => $taxRegistration,
                'note' => 'تؤدى لفائدة قابض إدارة الضرائب عبر SIMPL-Adoul',
            ],
            [
                'label_ar' => 'رسوم المحكمة والتمبر القضائي (صندوق المحكمة)',
                'label_fr' => 'Taxes judiciaires & Timbre',
                'amount' => $courtStamp,
                'note' => 'تؤدى بكتابة الضبط لقاء تأشير وخطاب القاضي',
            ],
        ];

        if ($ancfccFee > 0) {
            $breakdown[] = [
                'label_ar' => 'واجبات المحافظة العقارية (ANCFCC)',
                'label_fr' => 'Droits de conservation foncière',
                'amount' => $ancfccFee,
                'note' => '1% + 150 درهم ثابتة + 100 درهم رسم الشهادة',
            ];
        }

        return [
            'is_free' => false,
            'free_reason' => null,
            'adoul_fee' => $adoulFee,
            'tax_registration' => $taxRegistration,
            'court_stamp' => $courtStamp,
            'ancfcc_fee' => $ancfccFee,
            'total_cost' => $totalCost,
            'currency' => 'MAD',
            'breakdown' => $breakdown,
        ];
    }
}
