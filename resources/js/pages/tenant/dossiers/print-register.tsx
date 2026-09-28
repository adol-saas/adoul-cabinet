import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Printer,
    ArrowRight,
    Scale,
    FileSpreadsheet,
    ShieldCheck,
    FileText,
} from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface DossiersPrintRegisterProps {
    dossiers: Dossier[];
    officeSetting: OfficeSetting | null;
    generatedAt: string;
}

const actTypeLabels: Record<string, string> = {
    marriage: 'عقد زواج شرعي',
    divorce: 'إشهاد طلاق وتفريق',
    raj3a: 'إشهاد مراجعة زوجية',
    thobout_zawjia: 'ثبوت زوجية',
    hadana_nafaka: 'حضانة ونفقة',
    nasab_iqrar: 'إقرار بنسب',
    property_sale: 'بيع وتفويت عقاري',
    property_promise: 'وعد بالبيع العقاري',
    mortgage: 'رهن وتوثيق دين',
    mainlevee: 'رفع اليد عن رهن',
    donation: 'هبة عقارية',
    sadaqa: 'صدقة لوجه الله',
    mulkiya_lafif: 'لفيف الملكية (12 شاهداً)',
    inheritance: 'إراثة وحصر تركة',
    will: 'وصية شرعية',
    tarakah_qisma: 'قسمة تركة رضائية',
    tarakah_ihsa: 'إحصاء متروك',
    conversion_islam: 'اعتناق الإسلام',
    poa: 'وكالة قانونية خاصة',
    debt_recognition: 'اعتراف بدين',
    certificate: 'إشهاد واستعفاء',
    other: 'محرر عدلي رسمي',
};

const statusLabels: Record<string, string> = {
    draft: 'مسودة قيد الإعداد',
    in_progress: 'قيد التحرير والتوقيع',
    qadi_pending: 'مرفوع لقاضي التوثيق',
    qadi_approved: 'مؤشر عليه من القاضي',
    qadi_rejected: 'مرفوض للتعديل',
    registered: 'مسجل ومؤدى الرسوم',
    archived: 'مضمن ومحفوظ بالكناش',
};

export default function TenantDossiersPrintRegister({
    dossiers,
    officeSetting,
    generatedAt,
}: DossiersPrintRegisterProps) {
    const totalAmount = dossiers.reduce((acc, d) => acc + (Number(d.amount_paid) || 0), 0);

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 p-4 sm:p-8 flex flex-col items-center">
            <Head title="سجل العقود والمحررات العدلية — طباعة وتصدير رسمي" />

            {/* Non-printed Top Bar with Action Buttons */}
            <div className="w-full max-w-6xl mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3">
                    <Link href="/dossiers">
                        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold cursor-pointer">
                            <ArrowRight className="h-4 w-4" />
                            <span>العودة لكناش العقود</span>
                        </Button>
                    </Link>
                    <Badge variant="emerald" className="gap-1 text-xs">
                        <FileText className="h-3.5 w-3.5" />
                        <span>إجمالي المحررات: {dossiers.length}</span>
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <a href="/exports/dossiers" download>
                        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold cursor-pointer">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                            <span>تحميل كملف إكسيل (CSV)</span>
                        </Button>
                    </a>
                    <Button
                        onClick={() => window.print()}
                        variant="emerald"
                        size="sm"
                        className="gap-2 text-xs font-bold shadow-md cursor-pointer"
                    >
                        <Printer className="h-4 w-4" />
                        <span>طباعة / حفظ كـ PDF (A4)</span>
                    </Button>
                </div>
            </div>

            {/* Printable Official Register Sheet */}
            <div className="w-full max-w-6xl bg-white text-stone-900 p-8 sm:p-10 rounded-xl shadow-lg border border-stone-200 print:shadow-none print:border-none print:p-2 print:m-0 print:max-w-none">
                {/* Official Legal Header */}
                <div className="border-b-2 border-stone-900 pb-5 mb-6">
                    <div className="flex items-start justify-between">
                        {/* Kingdom & Ministry */}
                        <div className="text-center w-56 space-y-1 text-xs font-bold font-tajawal">
                            <div className="text-sm">المملكة المغربية</div>
                            <div>وزارة العدل</div>
                            <div>محكمة الاستئناف</div>
                            <div>المحكمة الابتدائية ب{officeSetting?.city || 'المملكة'}</div>
                            <div className="text-[11px] text-stone-600">قسم قضاء الأسرة والتوثيق</div>
                        </div>

                        {/* Center Emblem */}
                        <div className="flex flex-col items-center text-center">
                            {officeSetting?.logo_path ? (
                                <img
                                    src={officeSetting.logo_path}
                                    alt="شعار المكتب"
                                    className="h-16 w-16 object-contain mb-1"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full border-2 border-emerald-800 flex items-center justify-center text-emerald-800 mb-1">
                                    <Scale className="h-7 w-7" />
                                </div>
                            )}
                            <span className="text-[10px] font-bold tracking-widest uppercase">ROYAUME DU MAROC</span>
                            <span className="text-[10px] font-semibold text-emerald-800 font-tajawal">خطة العدالة — القانون 16.03</span>
                        </div>

                        {/* Office Details */}
                        <div className="text-center w-56 space-y-1 text-xs font-bold font-tajawal">
                            <div className="text-sm text-emerald-900">{officeSetting?.office_name_ar || 'مكتب التوثيق العدلي'}</div>
                            <div>الأستاذ(ة): {officeSetting?.adoul_name || 'عدل موثق'}</div>
                            {officeSetting?.city && <div className="text-[11px] text-stone-600">{officeSetting.city}</div>}
                            {officeSetting?.phone && <div className="text-[11px] text-stone-600" dir="ltr">{officeSetting.phone}</div>}
                        </div>
                    </div>

                    {/* Document Title Banner */}
                    <div className="mt-6 text-center">
                        <div className="inline-block border-2 border-stone-800 px-6 py-2 rounded-lg bg-stone-50">
                            <h1 className="text-base font-extrabold font-tajawal tracking-wide">
                                سجل تضمين العقود والمحررات العدلية الرسمية
                            </h1>
                            <div className="text-[11px] text-stone-600 font-sans mt-0.5">
                                تاريخ الاستخراج: {generatedAt} — مجموع الرسوم المستخلصة: {totalAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} درهم
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dossiers Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-stone-400 text-xs">
                        <thead>
                            <tr className="bg-stone-100 text-stone-900 border-b border-stone-400">
                                <th className="border border-stone-300 p-2 text-center w-8">#</th>
                                <th className="border border-stone-300 p-2 text-start w-28">المرجع الرسمي</th>
                                <th className="border border-stone-300 p-2 text-start">نوع العقد / الإشهاد</th>
                                <th className="border border-stone-300 p-2 text-center w-24">تاريخ الإبرام</th>
                                <th className="border border-stone-300 p-2 text-start">الطرف الأول (CIN)</th>
                                <th className="border border-stone-300 p-2 text-start">الطرف الثاني (CIN)</th>
                                <th className="border border-stone-300 p-2 text-end w-24">المؤدى (درهم)</th>
                                <th className="border border-stone-300 p-2 text-center w-28">الحالة والتأشيرة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dossiers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-stone-500 text-sm">
                                        لا توجد عقود أو محررات مسجلة حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                dossiers.map((d, idx) => (
                                    <tr key={d.id} className="border-b border-stone-200 even:bg-stone-50/50">
                                        <td className="border border-stone-300 p-2 text-center font-bold text-stone-600">
                                            {idx + 1}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-mono font-bold text-stone-900">
                                            {d.reference}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-bold font-tajawal text-stone-900">
                                            {actTypeLabels[d.type] || d.type}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center font-mono text-stone-700">
                                            {d.act_date ? new Date(d.act_date).toLocaleDateString('fr-CA') : '—'}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-stone-900">
                                            <div className="font-semibold">{d.client?.name_ar || '—'}</div>
                                            {d.client?.cin && (
                                                <div className="text-[10px] text-stone-500 font-mono">{d.client.cin}</div>
                                            )}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-stone-900">
                                            <div className="font-semibold">{d.client2?.name_ar || '—'}</div>
                                            {d.client2?.cin && (
                                                <div className="text-[10px] text-stone-500 font-mono">{d.client2.cin}</div>
                                            )}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-end font-mono font-bold text-stone-800">
                                            {Number(d.amount_paid || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                d.status === 'qadi_approved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : d.status === 'qadi_pending'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-stone-100 text-stone-800'
                                            }`}>
                                                {statusLabels[d.status] || d.status}
                                            </span>
                                            {d.qadi_reference && (
                                                <div className="text-[9px] text-emerald-700 font-mono mt-0.5">
                                                    تأشيرة: {d.qadi_reference}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-stone-100 font-bold border-t-2 border-stone-400">
                                <td colSpan={6} className="border border-stone-300 p-2 text-start font-tajawal">
                                    المجموع العام للمستخلصات:
                                </td>
                                <td className="border border-stone-300 p-2 text-end font-mono text-emerald-900">
                                    {totalAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} د.م
                                </td>
                                <td className="border border-stone-300 p-2 text-center font-tajawal text-stone-600 text-[10px]">
                                    {dossiers.length} محرر
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer with Certification and Stamp Space */}
                <div className="mt-8 pt-6 border-t border-stone-300 grid grid-cols-2 gap-8 text-xs font-tajawal">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                            <ShieldCheck className="h-4 w-4 text-emerald-700" />
                            <span>مطابقة السجل الإلكتروني:</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                            يشهد السيد(ة) العدل الموثق المشرف على هذا المكتب بأن البيانات المضمنة بهذا السجل مطابقة تماماً للمحررات الأصلية المودعة بالحفظ الإلكتروني طبقاً للقانون 16.03 والنصوص التنظيمية الجاري بها العمل.
                        </p>
                    </div>

                    <div className="text-center space-y-10">
                        <div className="font-bold text-stone-800">
                            خاتم وإمضاء السيد(ة) العدل الموثق
                        </div>
                        {officeSetting?.stamp_image_path ? (
                            <div className="flex justify-center">
                                <img
                                    src={officeSetting.stamp_image_path}
                                    alt="طابع العدل"
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="h-20 border border-dashed border-stone-400 rounded-lg flex items-center justify-center text-stone-400 text-[11px]">
                                (مكان الخاتم والتوقيع العدلي)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
