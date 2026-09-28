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
    Users,
} from 'lucide-react';
import { Client, OfficeSetting } from '@/types';

interface ClientsPrintProps {
    clients: Client[];
    officeSetting: OfficeSetting | null;
    generatedAt: string;
}

export default function TenantClientsPrint({
    clients,
    officeSetting,
    generatedAt,
}: ClientsPrintProps) {
    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 p-4 sm:p-8 flex flex-col items-center">
            <Head title="لائحة المتعاقدين والموكلين — طباعة وتصدير رسمي" />

            {/* Non-printed Top Bar with Action Buttons */}
            <div className="w-full max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3">
                    <Link href="/clients">
                        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold cursor-pointer">
                            <ArrowRight className="h-4 w-4" />
                            <span>العودة لقائمة المتعاقدين</span>
                        </Button>
                    </Link>
                    <Badge variant="emerald" className="gap-1 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        <span>إجمالي المتعاقدين: {clients.length}</span>
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <a href="/exports/clients" download>
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

            {/* Printable Official Sheet */}
            <div className="w-full max-w-5xl bg-white text-stone-900 p-8 sm:p-10 rounded-xl shadow-lg border border-stone-200 print:shadow-none print:border-none print:p-2 print:m-0 print:max-w-none">
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
                                لائحة المتعاقدين والموكلين المعتمدة بالمكتب
                            </h1>
                            <div className="text-[11px] text-stone-600 font-sans mt-0.5">
                                استخرجت بتاريخ: {generatedAt} — إجمالي الأسماء المضمنة: {clients.length} متعاقد
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-stone-400 text-xs">
                        <thead>
                            <tr className="bg-stone-100 text-stone-900 border-b border-stone-400">
                                <th className="border border-stone-300 p-2 text-center w-10">#</th>
                                <th className="border border-stone-300 p-2 text-start w-28">رقم البطاقة (CIN)</th>
                                <th className="border border-stone-300 p-2 text-start font-bold">الاسم الكامل (بالعربية)</th>
                                <th className="border border-stone-300 p-2 text-start font-medium font-sans">Nom Complet (FR)</th>
                                <th className="border border-stone-300 p-2 text-start">الهاتف</th>
                                <th className="border border-stone-300 p-2 text-start">تاريخ الازدياد</th>
                                <th className="border border-stone-300 p-2 text-start">العنوان ومحل السكنى</th>
                                <th className="border border-stone-300 p-2 text-center w-24">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-stone-500 text-sm">
                                        لا يوجد متعاقدون مسجلون حتى الآن.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((c, idx) => (
                                    <tr key={c.id} className="border-b border-stone-200 even:bg-stone-50/50">
                                        <td className="border border-stone-300 p-2 text-center font-bold text-stone-600">
                                            {idx + 1}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-mono font-bold text-stone-900">
                                            {c.cin}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-bold font-tajawal text-stone-900">
                                            {c.name_ar}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-sans text-stone-700">
                                            {c.name_fr || '—'}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-mono text-stone-700" dir="ltr">
                                            {c.phone || '—'}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-stone-700">
                                            {c.birth_date ? new Date(c.birth_date).toLocaleDateString('fr-CA') : '—'}
                                            {c.birth_city ? ` (${c.birth_city})` : ''}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-stone-700 max-w-xs truncate">
                                            {c.address || '—'}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center font-mono text-stone-600">
                                            {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-CA') : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Certification and Stamp Space */}
                <div className="mt-8 pt-6 border-t border-stone-300 grid grid-cols-2 gap-8 text-xs font-tajawal">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-stone-800">
                            <ShieldCheck className="h-4 w-4 text-emerald-700" />
                            <span>بيان الحجية الرسمية:</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                            هذه اللائحة الرسمية مستخرجة آلياً من سجلات المحررات والبيانات المعتمدة للمكتب العدلي طبقاً لأحكام القانون رقم 16.03 المنظم لخطة العدالة، وتصلح كمرجع إداري وتوثيقي معتمد.
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
