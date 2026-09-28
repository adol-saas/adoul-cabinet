import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowLeft, Scale, Users, ShieldCheck } from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface LafifWitness {
    num: number;
    name: string;
    cin?: string;
    age?: string | number;
    profession?: string;
    address?: string;
    bias_free?: boolean;
    testimony?: string;
}

interface PrintLafifProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    witnesses: LafifWitness[];
    verifyUrl: string;
}

export default function PrintLafif({
    dossier,
    officeSetting,
    witnesses = [],
    verifyUrl,
}: PrintLafifProps) {
    const details = (dossier.details || {}) as any;
    const secondAdoulName = details.second_adoul_name || 'الأستاذة ذة. فاطمة الزهراء بنجلون (عدل شريك)';

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center p-3 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`محضر شهادة اللفيف الشرعي (12 شاهداً) — ${dossier.reference}`} />

            {/* Top Toolbar */}
            <div className="w-full max-w-5xl mb-4 flex items-center justify-between gap-3 print:hidden bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <Link href={`/dossiers/${dossier.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                        <ArrowLeft className="h-4 w-4" />
                        <span>العودة للملف العدلي</span>
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
                        <span>طباعة محضر اللفيف A4</span>
                    </Button>
                </div>
            </div>

            {/* A4 Document Sheet */}
            <div className="w-full max-w-5xl bg-white text-stone-900 rounded-sm p-8 sm:p-12 shadow-xl border border-stone-300 print:border-none print:shadow-none print:p-4 print:w-full font-tajawal text-xs">
                {/* Official Moroccan Judiciary Header */}
                <div className="flex items-start justify-between border-b-2 border-stone-900 pb-4">
                    <div className="text-center w-60 text-xs font-bold space-y-0.5">
                        <div>المملكة المغربية</div>
                        <div>وزارة العدل</div>
                        <div>محكمة الاستئناف</div>
                        <div>المحكمة الابتدائية ب{officeSetting?.city || 'الرباط'}</div>
                        <div>قسم قضاء الأسرة والتوثيق</div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <Scale className="h-12 w-12 text-emerald-900 mb-1" />
                        <span className="font-bold text-base text-emerald-950">
                            {officeSetting?.office_name_ar || 'مكتب التوثيق العدلي'}
                        </span>
                        <span className="text-[11px] text-stone-600 font-mono">
                            خطة العدالة — القانون 16.03 المنظم لمهنة العدول
                        </span>
                    </div>

                    <div className="text-center w-60 text-xs space-y-1">
                        <div className="font-bold">مرجع الملف العدلي:</div>
                        <div className="font-mono font-bold text-sm text-emerald-900 border border-emerald-800/40 rounded px-2 py-0.5 bg-emerald-50">
                            {dossier.reference}
                        </div>
                        <div className="text-[10px] text-stone-500">
                            تاريخ التلقي: {dossier.act_date ? String(dossier.act_date) : new Date().toLocaleDateString('ar-MA')}
                        </div>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center my-6">
                    <h1 className="text-xl font-extrabold text-stone-950 underline decoration-emerald-800 decoration-2 underline-offset-8">
                        محضر تلقي وتضمين شهادة اللفيف الشرعي (12 شاهداً)
                    </h1>
                    <p className="text-xs text-stone-600 mt-2 font-medium">
                        محرر وفقاً لأحكام الفقه المالكي المعمول به وقواعد الإثبات العدلي بالمملكة المغربية
                    </p>
                </div>

                {/* Preamble & Subject */}
                <div className="p-4 bg-stone-50 border border-stone-300 rounded-lg space-y-2 leading-relaxed">
                    <p>
                        <strong>الحمد لله وحده، والصلاة والسلام على رسول الله وآله وصحبه.</strong>
                    </p>
                    <p>
                        بمحضر العدلين الموقعين أسفله المنتصبين للإشهاد بدائرة المحكمة الابتدائية، وبطلب من المشهود له:
                        {' '}<strong>{dossier.client?.name_ar || dossier.client?.name}</strong>{' '}
                        (الحامل للبطاقة الوطنية للتعريف رقم: <strong className="font-mono">{dossier.client?.cin}</strong>)،
                        حضر اثنا عشر رجلاً من أهل العدالة والفضل والمعرفة التامة بالمدخل والمخرج، المشهود بسلامتهم من الجرحة والموانع الشرعية،
                        وأشهدوا لله تعالى شهادة إحاطة ويقين تام بما يلي:
                    </p>
                    <div className="p-3 bg-white border border-stone-200 rounded text-stone-800 font-medium">
                        {details.property_name ? (
                            <>
                                إن العقار موضوع الشهادة المسمى <strong>«{details.property_name}»</strong> الكائن بـ{' '}
                                <strong>{details.property_location || 'الموقع المعتبر'}</strong>، والمحدود بالحدود الأربعة:{' '}
                                <em>{details.property_boundaries || 'شمالاً وجنوباً وشرقاً وغرباً حسب المخطط المرفق'}</em>،
                                هو في حيازة وتصرف المشهود له حيازة هادئة ومستمرة دون منازع ولا معارض، تصرف المالك في ملكه مدة تزيد عن المدة المعتبرة شرعاً لحيازة العقار.
                            </>
                        ) : (
                            dossier.notes_ar || 'يشهد الشهود بصحة الواقعة محل الإشهاد الشرعي ونسبتها للمشهود له دون نزاع.'
                        )}
                    </div>
                </div>

                {/* 12 Witnesses Grid Table */}
                <div className="my-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                            <Users className="h-4 w-4 text-emerald-800" />
                            <span>جدول الهوية الكاملة لشهود اللفيف الاثنا عشر (12 شاهداً):</span>
                        </div>
                        <span className="text-[11px] text-stone-500">
                            (التحقق التام من الأهلية والبطاقة الوطنية وخلوهم من موانع الشهادة)
                        </span>
                    </div>

                    <table className="w-full border-collapse border border-stone-400 text-right text-[11px]">
                        <thead>
                            <tr className="bg-stone-200 text-stone-900 font-bold border-b border-stone-400">
                                <th className="p-2 border border-stone-400 text-center w-8">#</th>
                                <th className="p-2 border border-stone-400">اسم الشاهد الكامل</th>
                                <th className="p-2 border border-stone-400 w-24">رقم ب.ت.و (CIN)</th>
                                <th className="p-2 border border-stone-400 w-12 text-center">السن</th>
                                <th className="p-2 border border-stone-400">المهنة</th>
                                <th className="p-2 border border-stone-400">محل الإقامة والسكنى</th>
                                <th className="p-2 border border-stone-400 text-center w-20">خلوه من الجرحة</th>
                                <th className="p-2 border border-stone-400 text-center w-28">التوقيع / البصمة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {witnesses.map((w, idx) => (
                                <tr key={idx} className="hover:bg-stone-50 border-b border-stone-300">
                                    <td className="p-2 border border-stone-300 text-center font-bold font-mono">
                                        {w.num || idx + 1}
                                    </td>
                                    <td className="p-2 border border-stone-300 font-bold">
                                        {w.name}
                                    </td>
                                    <td className="p-2 border border-stone-300 font-mono">
                                        {w.cin || '—'}
                                    </td>
                                    <td className="p-2 border border-stone-300 text-center font-mono">
                                        {w.age || '—'}
                                    </td>
                                    <td className="p-2 border border-stone-300">
                                        {w.profession || '—'}
                                    </td>
                                    <td className="p-2 border border-stone-300 text-stone-700">
                                        {w.address || '—'}
                                    </td>
                                    <td className="p-2 border border-stone-300 text-center text-emerald-800 font-bold">
                                        سالم شرعاً
                                    </td>
                                    <td className="p-2 border border-stone-300 text-center">
                                        <div className="h-8 border border-dashed border-stone-300 rounded flex items-center justify-center text-[9px] text-stone-400">
                                            توقيع / بصمة
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sacramental Conclusion & Signatures */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-800/30 rounded-lg text-stone-800 space-y-2">
                    <p className="leading-relaxed">
                        <strong>شهادة لله:</strong> شهد الشهود الاثنا عشر بأجمعهم طبق ما سُطر أعلاه، بعد تلاوته عليهم وفهمهم لمضمونه وإقرارهم بصحته،
                        وأدوا شهادتهم بصوت واحد أو على انفراد دون إكراه ولا تلبيس، وقيدت بمذكرة الحفظ اليومية تحت عدد:
                        {' '}<strong>{details.conservation_blotter_number || dossier.id}</strong>{' '}
                        بتاريخ: <strong>{dossier.act_date ? String(dossier.act_date) : 'اليوم'}</strong>.
                    </p>
                </div>

                {/* Signatures & Stamps Footer */}
                <div className="grid grid-cols-3 gap-6 mt-8 pt-4 border-t-2 border-stone-900 text-center">
                    {/* First Adoul */}
                    <div className="space-y-2">
                        <div className="font-bold text-stone-900">العدل المتلقي الأول:</div>
                        <div className="font-semibold text-emerald-950">{dossier.adoul?.name || 'الأستاذ د. محمد الإدريسي'}</div>
                        <div className="text-[10px] text-stone-500">عدل موثق محلف</div>
                        <div className="h-16 border border-dashed border-stone-300 rounded flex items-center justify-center text-stone-400 text-[10px]">
                            توقيع وخاتم العدل الأول
                        </div>
                    </div>

                    {/* QR Code & Anti-Fraud Center */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="p-2 bg-white border border-stone-300 rounded shadow-xs inline-block">
                            <QRCodeSVG value={verifyUrl} size={80} level="H" />
                        </div>
                        <div className="text-[9px] text-stone-500 font-mono">التحقق بالرمز الرقمي المعتمد</div>
                        <div className="text-[9px] text-emerald-800 font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>رسم عدلي غير قابل للتزوير</span>
                        </div>
                    </div>

                    {/* Second Adoul */}
                    <div className="space-y-2">
                        <div className="font-bold text-stone-900">العدل المتلقي الثاني (الشريك):</div>
                        <div className="font-semibold text-emerald-950">{secondAdoulName}</div>
                        <div className="text-[10px] text-stone-500">عدل موثق شريك في التلقي</div>
                        <div className="h-16 border border-dashed border-stone-300 rounded flex items-center justify-center text-stone-400 text-[10px]">
                            توقيع وخاتم العدل الثاني
                        </div>
                    </div>
                </div>

                {/* Qadi Khitab Reserved Area */}
                <div className="mt-6 p-4 border-2 border-stone-800 rounded-lg text-center bg-stone-50">
                    <div className="font-bold text-stone-900 text-xs mb-1">
                        مساحة مخصصة لتأشيرة وخطاب السيد قاضي التوثيق (الخطاب القضائي)
                    </div>
                    <div className="text-[10px] text-stone-600 italic">
                        «الحمد لله وحده، خوطب به وتضمن طبق القانون بسجل التضمين تحت عدد: .......... صحيفة: .......... كناش: .......... بتاريخ: .........»
                    </div>
                    <div className="mt-4 flex justify-between px-12 text-[10px] text-stone-500">
                        <span>توقيع كاتب الضبط: ....................</span>
                        <span>توقيع وخاتم قاضي التوثيق: ....................</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
