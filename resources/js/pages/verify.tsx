import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Scale, ShieldCheck, ShieldAlert, CheckCircle2, Calendar, FileText, Building2, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VerifyProps {
    reference: string;
    dossier: {
        reference: string;
        type: string;
        status: string;
        act_date: string | null;
        signing_date: string | null;
        qadi_validation_date: string | null;
        qadi_reference: string | null;
        is_authentic: boolean;
    } | null;
    office: {
        id: string;
        name_ar: string;
        name_fr: string;
        city: string;
        qadi_name: string;
    } | null;
}

export default function Verify({ reference, dossier, office }: VerifyProps) {
    const isAuthentic = dossier && dossier.is_authentic;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
            <Head title={`شهادة التحقق العدلي: ${reference} — Adoul`} />

            <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Scale className="h-6 w-6 text-emerald-700" />
                    <span className="font-bold text-lg font-tajawal">Adoul — بوابة التحقق الوطني</span>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>العودة للبوابة</span>
                    </Button>
                </Link>
            </header>

            <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 my-8">
                {isAuthentic ? (
                    <Card className="border-2 border-emerald-600 shadow-xl bg-white dark:bg-stone-900 overflow-hidden">
                        <div className="bg-emerald-800 text-white p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-900 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md">
                                <ShieldCheck className="h-9 w-9 text-amber-300" />
                            </div>
                            <Badge variant="gold" className="text-xs px-3 py-1 font-bold">وثيقة عدلية أصلية وموثقة رسميّاً</Badge>
                            <h1 className="text-2xl font-bold font-tajawal mt-2">شهادة صحة الوثيقة والمحرر العدلي</h1>
                            <p className="text-xs text-emerald-100 mt-1">
                                مطابقة لأحكام القانون 16.03 المتعلق بخطة العدالة ومدونة الأسرة والقوانين العقارية
                            </p>
                        </div>

                        <CardContent className="p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
                                <div>
                                    <span className="text-stone-500 block mb-1">الرقم المرجعي للوثيقة:</span>
                                    <span className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
                                        {dossier?.reference}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-500 block mb-1">نوع المحرر العدلي:</span>
                                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm font-tajawal">
                                        {dossier?.type}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-500 block mb-1">مكتب السادة العدول:</span>
                                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                                        {office?.name_ar} ({office?.city})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-500 block mb-1">مخاطبة قاضي التوثيق:</span>
                                    <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                                        {dossier?.qadi_reference || 'قيد المخاطبة والتوثيق'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-500 block mb-1">تاريخ إبرام وتلقي الشهادة:</span>
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        {dossier?.act_date || dossier?.signing_date || 'تاريخ رسمي مسجل'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-500 block mb-1">الحالة الإدارية للعقد:</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>موقع ومضمن في كناش الحفظ</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800">
                                <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                                    <p className="font-bold text-stone-800 dark:text-stone-200">بصمة التحقق الإلكترونية المشفرة</p>
                                    <p>رمز QR معتمد للفحص الفوري لدى مصالح المحافظة العقارية، قباضات التسجيل، المحاكم، والمصالح القنصلية.</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm border border-stone-200 shrink-0">
                                    <QRCodeSVG value={currentUrl} size={110} level="H" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                                    <Printer className="h-4 w-4" />
                                    <span>طباعة إشعار التحقق</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-2 border-red-500 shadow-xl bg-white dark:bg-stone-900 text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/80 border-2 border-red-400 flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="h-9 w-9 text-red-600 dark:text-red-400" />
                        </div>
                        <Badge variant="destructive" className="text-xs px-3 py-1 font-bold">لم يتم التحقق من صحة الوثيقة</Badge>
                        <h2 className="text-2xl font-bold font-tajawal mt-3 text-stone-900 dark:text-stone-100">
                            المرجع {reference} غير مسجل أو قيد المراجعة
                        </h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto mt-2 leading-relaxed">
                            لم يتم العثور على أي محرر عدلي نشط بهذا الرقم المرجعي، أو أن العقد ما يزال في طور التحرير الأولي ولم يوقع بعد من قبل العدلين وقاضي التوثيق.
                        </p>
                    </Card>
                )}
            </main>

            <footer className="bg-stone-900 text-stone-400 py-4 text-xs text-center border-t border-stone-800">
                <p>© {new Date().getFullYear()} Adoul — المنصة الموحدة للتوثيق العدلي بالمملكة المغربية.</p>
            </footer>
        </div>
    );
}
