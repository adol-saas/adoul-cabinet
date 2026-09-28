import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowLeft, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface FeeStatementProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    tariff: {
        is_free: boolean;
        free_reason: string | null;
        adoul_fee: number;
        tax_registration: number;
        court_stamp: number;
        total_cost: number;
        currency: string;
        breakdown: Array<{
            label_ar: string;
            label_fr?: string;
            amount: number;
            note: string;
        }>;
    };
    declaredValue: number;
    verifyUrl: string;
}

export default function FeeStatement({
    dossier,
    officeSetting,
    tariff,
    declaredValue = 0,
    verifyUrl,
}: FeeStatementProps) {
    const actTypeLabels: Record<string, string> = {
        marriage: 'رسم عقد زواج شرعي مبارك',
        divorce: 'رسم إشهاد طلاق وتفريق شرعي',
        revocation: 'رسم إشهاد مراجعة زوجية',
        property_sale: 'رسم شراء وتفويت عقاري تام',
        property_gift: 'رسم هبة وصدقة عقارية',
        poa: 'رسم وكالة قانونية رسمية خاصة',
        will: 'رسم إراثة وحصر تركة وتحديد أنصبة شرعية',
        certificate: 'رسم إشهاد واستعفاء عدلي رسمي',
        commercial_lease: 'رسم عقد كراء عقاري وتجاري',
        mortgage: 'رسم رهن وتوثيق دين شرعي موثق',
        lafif_property: 'رسم لفيف الملكية بـ 12 شاهداً مع التزكية',
        islam_conversion: 'شهادة اعتناق الإسلام (مجانية بقوة القانون)',
        crescent_sighting: 'مراقبة الهلال (خدمة شرعية مجانية)',
        indigent_marriage: 'زواج في حالة العسر (معفى بأمر قضائي)',
    };

    const titleAr = actTypeLabels[dossier.type] || 'رسم ومحرر عدلي رسمي';

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center p-3 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`بيان حساب وأتعاب الرسم: ${dossier.reference} — Adoul`} />

            {/* Action Bar */}
            <div className="w-full max-w-4xl mb-4 flex items-center justify-between gap-3 print:hidden bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <Link href={`/dossiers/${dossier.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                        <ArrowLeft className="h-4 w-4" />
                        <span>العودة للملف</span>
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5 font-bold text-xs shadow-md"
                    >
                        <Printer className="h-4 w-4" />
                        <span>طباعة بيان الحساب A4</span>
                    </Button>
                </div>
            </div>

            {/* Official A4 Fee Statement Sheet */}
            <div className="w-full max-w-4xl bg-white text-stone-900 rounded-sm p-8 sm:p-12 shadow-xl border border-stone-300 print:border-none print:shadow-none print:p-6 print:w-full">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
                    <div className="text-center w-56 text-xs font-bold font-tajawal space-y-0.5">
                        <div>المملكة المغربية</div>
                        <div>وزارة العدل</div>
                        <div>محكمة الاستئناف</div>
                        <div>المحكمة الابتدائية ب{officeSetting?.city || 'المغرب'}</div>
                        <div>قسم قضاء الأسرة والتوثيق</div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <Scale className="h-12 w-12 text-emerald-800 mb-1" />
                        <span className="font-tajawal font-bold text-sm text-emerald-950">
                            {officeSetting?.office_name_ar || 'مكتب التوثيق العدلي'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">خطة العدالة — القانون 16.03</span>
                    </div>

                    <div className="text-center w-56 text-xs font-tajawal space-y-0.5">
                        <div className="font-bold text-stone-800">بيان الأتعاب والواجبات الجبائية</div>
                        <div className="text-[11px] text-stone-600 font-sans">Note d'honoraires & taxes déboursées</div>
                        <div className="text-[11px] font-mono mt-1" dir="ltr">Ref: {dossier.reference}</div>
                        <div className="text-[10px] text-stone-500">{new Date().toLocaleDateString('ar-MA')}</div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center my-6 space-y-1">
                    <h1 className="text-xl font-bold font-tajawal text-emerald-950 border-b-2 border-amber-500/40 inline-block px-6 pb-1">
                        بيان تصفية حساب المصاريف القضائية وأتعاب التوثيق العدلي
                    </h1>
                    <p className="text-xs text-stone-500">
                        محرر وفق مقتضيات المرسوم المحدد لتعريفة أجور العدول والمدونة العامة للضرائب
                    </p>
                </div>

                {/* Statutory Free Act Banner */}
                {tariff.is_free && (
                    <div className="my-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-center">
                        <div className="flex items-center justify-center gap-2 font-bold text-base font-tajawal">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span>خدمة معفاة ومجانية بقوة القانون (0,00 درهم)</span>
                        </div>
                        <p className="text-xs mt-1 text-emerald-800 font-medium">
                            {tariff.free_reason}
                        </p>
                    </div>
                )}

                {/* Parties Details Card */}
                <div className="my-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-stone-500 font-semibold block">موضوع المحرر العدلي:</span>
                            <span className="font-bold text-stone-900 text-sm font-tajawal">{titleAr}</span>
                        </div>
                        <div>
                            <span className="text-stone-500 font-semibold block">الرقم المرجعي للملف:</span>
                            <span className="font-mono font-bold text-stone-900">{dossier.reference}</span>
                        </div>
                        <div>
                            <span className="text-stone-500 font-semibold block">الطرف الأول (طالب الشهادة / البائع / الزوج):</span>
                            <span className="font-bold text-stone-900">{dossier.client?.name_ar}</span>
                            <span className="font-mono text-stone-500 ms-2">(CIN: {dossier.client?.cin})</span>
                        </div>
                        <div>
                            <span className="text-stone-500 font-semibold block">الطرف الثاني (المشتري / الزوجة / المتنازل له):</span>
                            <span className="font-bold text-stone-900">{dossier.client2?.name_ar || '—'}</span>
                            {dossier.client2?.cin && <span className="font-mono text-stone-500 ms-2">(CIN: {dossier.client2.cin})</span>}
                        </div>
                        {declaredValue > 0 && (
                            <div className="sm:col-span-2 pt-2 border-t border-stone-200">
                                <span className="text-stone-500 font-semibold block">القيمة المالية المصرح بها للمعاملة (Prix / Valeur déclarée):</span>
                                <span className="font-mono font-bold text-base text-emerald-800">
                                    {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(declaredValue)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Table Breakdown */}
                <div className="my-6 border border-stone-300 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                                <th className="p-3">بيان الرسم / البند القانوني</th>
                                <th className="p-3">المستفيد / الوجهة الرسمية</th>
                                <th className="p-3 text-left">المبلغ المستحق (درهم)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                            {tariff.breakdown.map((item, index) => (
                                <tr key={index} className="hover:bg-stone-50">
                                    <td className="p-3">
                                        <div className="font-bold text-stone-900">{item.label_ar}</div>
                                        {item.label_fr && <div className="text-[11px] text-stone-500 font-sans">{item.label_fr}</div>}
                                    </td>
                                    <td className="p-3 text-stone-600">{item.note}</td>
                                    <td className="p-3 text-left font-mono font-bold text-stone-900" dir="ltr">
                                        {new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(item.amount)} DH
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-700 text-stone-900">
                                <td colSpan={2} className="p-3 text-sm font-tajawal text-emerald-950">
                                    المجموع الإجمالي الواجب أداؤه (أتعاب + ضرائب + رسوم المحكمة):
                                </td>
                                <td className="p-3 text-left text-base font-mono text-emerald-900 font-extrabold" dir="ltr">
                                    {new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(tariff.total_cost)} DH
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Dual Adoul Signatures & Stamp Box */}
                <div className="mt-8 pt-4 border-t-2 border-stone-800">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        <div className="space-y-12">
                            <div className="font-bold text-stone-800">توقيع وخاتم العدل الأول:</div>
                            <div className="text-[11px] text-stone-500 font-mono">
                                الأستاذ {dossier.adoul?.name || officeSetting?.office_name_ar}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            {officeSetting?.stamp_image_path ? (
                                <img src={officeSetting.stamp_image_path} alt="خاتم المكتب" className="h-20 w-20 object-contain opacity-80" />
                            ) : (
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-[10px] text-stone-400">
                                    طابع المكتب
                                </div>
                            )}
                            <span className="text-[9px] text-stone-400 mt-1">تأشيرة المحاسبة الرسمية</span>
                        </div>

                        <div className="space-y-12">
                            <div className="font-bold text-stone-800">توقيع وخاتم العدل الثاني:</div>
                            <div className="text-[11px] text-stone-500 font-mono">
                                العدل الشريك المتلقي للإشهاد
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer and QR */}
                <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
                    <div>
                        تم تحرير هذا البيان وفق الضوابط المعمول بها في خطة العدالة بالمملكة المغربية.
                        <div className="font-mono mt-0.5">منصة Adoul — التوثيق العدلي الإلكتروني</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono">التحقق الإلكتروني:</span>
                        <QRCodeSVG value={verifyUrl} size={48} level="M" />
                    </div>
                </div>
            </div>
        </div>
    );
}
