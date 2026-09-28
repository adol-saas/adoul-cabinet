import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import {
    FolderKanban,
    Scale,
    Printer,
    CheckCircle2,
    Clock,
    User,
    Users,
    DollarSign,
    ShieldCheck,
    History,
    ArrowRight,
    Edit2,
    Trash2,
    ExternalLink,
    AlertTriangle,
    Building2,
    FileCheck,
    Receipt,
    Calendar,
    FileText,
} from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface UserItem {
    id: number;
    name: string;
    job_title?: string;
}

interface DossierShowProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    template: any;
    adoulUsers: UserItem[];
    verifyUrl: string;
}

export default function TenantDossierShow({
    dossier,
    officeSetting,
    template,
    adoulUsers = [],
    verifyUrl,
}: DossierShowProps) {
    const details = (dossier.details || {}) as any;
    const dgiStatus = (dossier as any).dgi_status || {};
    const lafifList: any[] = Array.isArray(details.lafif_witnesses) && details.lafif_witnesses.length > 0
        ? details.lafif_witnesses
        : Array.from({ length: 12 }, (_, i) => ({
            num: i + 1,
            name: `الشاهد رقم ${i + 1}`,
            cin: '',
            age: '',
            profession: '',
            address: '',
            bias_free: true,
            testimony: 'يشهد بالملك والحيازة والتصرف المعتبر شرعاً',
        }));

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [circuitModalOpen, setCircuitModalOpen] = useState(false);
    const [lafifModalOpen, setLafifModalOpen] = useState(false);

    // Form for quick status update
    const statusForm = useForm({
        status: dossier.status,
        qadi_reference: dossier.qadi_reference || '',
        note: '',
    });

    // Form for financial amounts and text notes
    const editForm = useForm({
        amount_due: dossier.amount_due,
        amount_paid: dossier.amount_paid,
        notes_ar: dossier.notes_ar || '',
        notes_fr: dossier.notes_fr || '',
    });

    // Form for judicial circuit and DGI/ANCFCC
    const circuitForm = useForm({
        court_name: details.court_name || `المحكمة الابتدائية ب${officeSetting?.city || 'الرباط'} - قسم قضاء الأسرة`,
        deposit_date: details.deposit_date || '',
        deposit_receipt: details.deposit_receipt || '',
        tadmine_number: details.tadmine_number || '',
        kunnash_number: details.kunnash_number || '',
        page_number: details.page_number || '',
        qadi_reference: dossier.qadi_reference || '',
        qadi_validation_date: dossier.qadi_validation_date ? String(dossier.qadi_validation_date).split('T')[0] : '',
        dgi_number: details.dgi_number || '',
        dgi_date: details.dgi_date || '',
        dgi_amount: details.dgi_amount || '',
        ancfcc_title_number: details.ancfcc_title_number || details.title_number || '',
        ancfcc_deposit_number: details.ancfcc_deposit_number || '',
        second_adoul_id: details.second_adoul_id || '',
        status: dossier.status,
    });

    // Form for 12 Lafif Witnesses
    const lafifForm = useForm({
        witnesses: lafifList,
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.post(`/dossiers/${dossier.id}/status`, {
            onSuccess: () => setStatusModalOpen(false),
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/dossiers/${dossier.id}`, {
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const submitCircuit = (e: React.FormEvent) => {
        e.preventDefault();
        circuitForm.post(`/dossiers/${dossier.id}/circuit`, {
            onSuccess: () => setCircuitModalOpen(false),
        });
    };

    const submitLafif = (e: React.FormEvent) => {
        e.preventDefault();
        lafifForm.post(`/dossiers/${dossier.id}/lafif`, {
            onSuccess: () => setLafifModalOpen(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`تحذير: هل أنت متأكد من حذف الملف [${dossier.reference}] نهائياً؟`)) {
            router.delete(`/dossiers/${dossier.id}`);
        }
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج شرعي',
        divorce: 'إشهاد طلاق أو خلع',
        raj3a: 'رسم الرجعة بعد الطلاق الرجعي',
        thobout_zawjia: 'رسم ثبوت الزوجية',
        hadana_nafaka: 'إشهاد الحضانة والنفقة',
        property_sale: 'معاملة ورسم بيع عقاري',
        mulkiya_lafif: 'رسم استمرار الملكية باللفيف (12 شاهداً)',
        lafif_property: 'رسم استمرار الملكية باللفيف (12 شاهداً)',
        inheritance: 'رسم إراثة وفريضة شرعية',
        tarakah_qisma: 'رسم قسمة التركة وتصفية المتروك',
        donation: 'عقد هبة وصدقة مع المعاينة',
        will: 'رسم وصية شرعية',
        poa: 'وكالة رسمية خاصة / عامة',
        conversion_islam: 'شهادة اعتناق الإسلام',
        certificate: 'إشهاد واستعفاء عدلي',
    };

    const isLafifAct = dossier.type === 'mulkiya_lafif' || dossier.type === 'lafif_property' || Boolean(details.lafif_witnesses);

    // Stepper definition
    const steps = [
        { id: 'draft', title: 'التلقي والتحرير', desc: 'تحرير المسودة وتدقيق الهويات' },
        { id: 'signed_adoul', title: 'مذكرة الحفظ', desc: 'توقيع الأطراف والعدلين' },
        { id: 'court_deposit', title: 'إيداع المحكمة', desc: 'كتابة ضبط قضاء الأسرة' },
        { id: 'khotiba', title: 'تأشيرة الخطاب', desc: 'تأشير قاضي التوثيق والتضمين' },
        { id: 'dgi_registered', title: 'التسجيل الجبائي', desc: 'إدارة الضرائب SIMPL-Adoul' },
        { id: 'ancfcc_registered', title: 'المحافظة العقارية', desc: 'تقييد الصك العقاري' },
        { id: 'archived', title: 'التسليم والأرشفة', desc: 'تسليم النسخة الرسمية' },
    ];

    const getStepState = (stepId: string) => {
        if (dossier.status === 'archived') return 'completed';
        if (stepId === 'draft') return 'completed';
        if (stepId === 'signed_adoul') return (dossier.signing_date || dossier.status !== 'draft') ? 'completed' : 'current';
        if (stepId === 'court_deposit') return (details.deposit_receipt || dossier.status === 'pending_qadi' || dossier.qadi_reference) ? 'completed' : 'upcoming';
        if (stepId === 'khotiba') return (dossier.qadi_reference || dossier.qadi_validation_date) ? 'completed' : 'upcoming';
        if (stepId === 'dgi_registered') return details.dgi_number ? 'completed' : 'upcoming';
        if (stepId === 'ancfcc_registered') return details.ancfcc_deposit_number ? 'completed' : 'upcoming';
        return 'upcoming';
    };

    return (
        <TenantAdminLayout title={`الملف العدلي: ${dossier.reference}`}>
            <Head title={`الملف: ${dossier.reference} — Adoul Cabinet`} />

            <div className="space-y-6">
                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/dossiers">
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <ArrowRight className="h-4 w-4" />
                                <span>سجل الملفات</span>
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                    {actTypeLabels[dossier.type] || dossier.type}
                                </h2>
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                                    {dossier.reference}
                                </span>
                                <Badge variant="emerald" className="text-xs">
                                    {dossier.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-3">
                                <span>تاريخ الإشهاد: {dossier.act_date ? String(dossier.act_date) : 'مسجل'}</span>
                                <span>•</span>
                                <span>العدل الأول: {dossier.adoul?.name || 'عدل موثق'}</span>
                                {details.second_adoul_name && (
                                    <>
                                        <span>•</span>
                                        <span>العدل الثاني: {details.second_adoul_name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 self-start">
                        <Link href={`/dossiers/${dossier.id}/print`}>
                            <Button variant="emerald" size="sm" className="gap-1.5 font-bold shadow-xs">
                                <Printer className="h-4 w-4" />
                                <span>طباعة الوثيقة مع QR</span>
                            </Button>
                        </Link>

                        {isLafifAct && (
                            <Link href={`/dossiers/${dossier.id}/print-lafif`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-amber-600/40 text-amber-700 hover:bg-amber-50">
                                    <Users className="h-4 w-4 text-amber-600" />
                                    <span>طباعة محضر اللفيف (12)</span>
                                </Button>
                            </Link>
                        )}

                        <Link href={`/dossiers/${dossier.id}/fee-statement`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-stone-700">
                                <Receipt className="h-4 w-4 text-emerald-700" />
                                <span>بيان الأتعاب والرسوم</span>
                            </Button>
                        </Link>

                        <Button variant="outline" size="sm" onClick={() => setCircuitModalOpen(true)} className="gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-300">
                            <Scale className="h-3.5 w-3.5 text-emerald-700" />
                            <span>المسار القضائي والضرائب</span>
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="gap-1.5 text-xs">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>تعديل الأتعاب</span>
                        </Button>

                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* DGI 30-Day Legal Deadline Warning Banner */}
                {dgiStatus.is_registered ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                                    تم التسجيل بإدارة الضرائب بنجاح (SIMPL-Adoul)
                                </div>
                                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                                    رقم الوصل: {dgiStatus.dgi_number} • تاريخ التسجيل: {dgiStatus.dgi_date || 'مسجل'} • واجب التسجيل: {dgiStatus.dgi_amount || 0} درهم
                                </div>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setCircuitModalOpen(true)} className="text-xs font-bold">
                            تحديث مراجع الضرائب
                        </Button>
                    </div>
                ) : (
                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                        dgiStatus.is_overdue
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                            : (dgiStatus.days_remaining <= 7
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200')
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                dgiStatus.is_overdue ? 'bg-red-100 text-red-700' : (dgiStatus.days_remaining <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700')
                            }`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm flex items-center gap-2">
                                    <span>أجل التسجيل الجبائي لدى إدارة الضرائب (المادة 128 من المدونة العامة للضرائب)</span>
                                    <Badge variant={dgiStatus.badge_variant}>{dgiStatus.status_label}</Badge>
                                </div>
                                <div className="text-xs mt-0.5 opacity-80">
                                    {dgiStatus.is_overdue
                                        ? 'انقضى الأجل القانوني المحدد في 30 يوماً من تاريخ التلقي، المعاملة معرضة لذعيرة التأخير القانونية بنسبة 15%.'
                                        : `الأجل الأقصى القانوني للتسجيل دون ذعائر هو: ${dgiStatus.deadline_date || 'خلال 30 يوماً'} (متبقي ${dgiStatus.days_remaining} يوماً).`
                                    }
                                </div>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            variant={dgiStatus.is_overdue ? 'destructive' : 'emerald'}
                            onClick={() => setCircuitModalOpen(true)}
                            className="font-bold text-xs shrink-0"
                        >
                            تسجيل وصل DGI الآن
                        </Button>
                    </div>
                )}

                {/* Judicial & Administrative Circuit Stepper */}
                <Card className="border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-stone-50 dark:bg-stone-900/60 py-3 border-b border-stone-200 dark:border-stone-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold font-tajawal flex items-center gap-2 text-stone-800 dark:text-stone-200">
                            <Scale className="h-4 w-4 text-emerald-700" />
                            <span>مسار الإجراءات القضائية والخطاب والتضمين (Circuit Judiciaire)</span>
                        </CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => setCircuitModalOpen(true)} className="h-7 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                            تحديث مراجع المسار
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                            {steps.map((st, i) => {
                                const state = getStepState(st.id);
                                return (
                                    <div
                                        key={st.id}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-between transition-colors ${
                                            state === 'completed'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold'
                                                : (state === 'current'
                                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-950 dark:text-amber-200 font-bold'
                                                    : 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-400')
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            {state === 'completed' ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <span className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-700 text-[10px] flex items-center justify-center font-bold">
                                                    {i + 1}
                                                </span>
                                            )}
                                            <span className="text-[11px] font-tajawal">{st.title}</span>
                                        </div>
                                        <span className="text-[10px] opacity-75 font-normal line-clamp-1">{st.desc}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Main 2-Column Grid */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Left 8 Cols: Parties, Qadi & Court Info, Lafif (if applicable), History */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Contracting Parties Card */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-600" />
                                    <span>أطراف الرسم العدلي (المتعاقدون)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الأول (المشهود له / البائع / الزوج):</span>
                                    <Link href={`/clients/${dossier.client?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                        {dossier.client?.name_ar || dossier.client?.name}
                                    </Link>
                                    <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                        CIN: {dossier.client?.cin}
                                    </div>
                                    <div className="text-stone-500 mt-1">{dossier.client?.phone || 'بدون هاتف'}</div>
                                    <div className="text-stone-500 text-[11px] mt-0.5">{dossier.client?.address}</div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الثاني (المشتري / الزوجة / الوكيل):</span>
                                    {dossier.client2 ? (
                                        <>
                                            <Link href={`/clients/${dossier.client2?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                                {dossier.client2?.name_ar || dossier.client2?.name}
                                            </Link>
                                            <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                                CIN: {dossier.client2?.cin}
                                            </div>
                                            <div className="text-stone-500 mt-1">{dossier.client2?.phone || 'بدون هاتف'}</div>
                                            <div className="text-stone-500 text-[11px] mt-0.5">{dossier.client2?.address}</div>
                                        </>
                                    ) : (
                                        <div className="text-stone-400 italic py-4 text-center">
                                            معاملة بإشهاد طرف واحد (أو شهادة لفيف)
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Court, Qadi & Dual Adoul Info Card */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-amber-600" />
                                    <span>المسار القضائي وتأشير قاضي التوثيق (الخطاب والتضمين)</span>
                                </CardTitle>
                                <Button size="sm" variant="outline" onClick={() => setCircuitModalOpen(true)} className="h-7 text-xs">
                                    تعديل المراجع
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 grid sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-stone-400 block mb-1">المحكمة الابتدائية:</span>
                                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                                        {details.court_name || `ابتدائية ${officeSetting?.city || 'الرباط'}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block mb-1">صيغة ورقم الخطاب القضائي:</span>
                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                        {dossier.qadi_reference || 'قيد الإيداع والدراسة'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block mb-1">تاريخ التأشير (الخطاب):</span>
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        {dossier.qadi_validation_date ? String(dossier.qadi_validation_date).split('T')[0] : 'لم يخاطب عليه بعد'}
                                    </span>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-2">
                                    <span className="text-stone-400 block mb-1">رقم التضمين بسجل المحكمة:</span>
                                    <span className="font-mono font-bold">
                                        {details.tadmine_number || '—'}
                                    </span>
                                </div>
                                <div className="border-t border-stone-100 dark:border-stone-800 pt-2">
                                    <span className="text-stone-400 block mb-1">رقم الكناش / السجل:</span>
                                    <span className="font-mono font-bold">
                                        {details.kunnash_number || '—'}
                                    </span>
                                </div>
                                <div className="border-t border-stone-100 dark:border-stone-800 pt-2">
                                    <span className="text-stone-400 block mb-1">رقم الصحيفة:</span>
                                    <span className="font-mono font-bold">
                                        {details.page_number || '—'}
                                    </span>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-2 sm:col-span-2">
                                    <span className="text-stone-400 block mb-1">الثنائية العدلية (العدلان المتلقيان):</span>
                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                        1. {dossier.adoul?.name || 'العدل الأول'} (رئيس المكتب)
                                    </div>
                                    <div className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                                        2. {details.second_adoul_name || 'الأستاذة ذة. فاطمة الزهراء بنجلون'} (العدل الشريك)
                                    </div>
                                </div>
                                <div className="border-t border-stone-100 dark:border-stone-800 pt-2">
                                    <span className="text-stone-400 block mb-1">مذكرة الحفظ اليومية:</span>
                                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                                        عدد: {details.conservation_blotter_number || dossier.id}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lafif 12 Witnesses Card (When Act is Lafif or has witnesses) */}
                        {isLafifAct && (
                            <Card className="border-amber-500/30">
                                <CardHeader className="pb-3 border-b border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2 text-amber-950 dark:text-amber-200">
                                        <Users className="h-4 w-4 text-amber-600" />
                                        <span>شهادة اللفيف الشرعي (اثنا عشر شاهداً - 12)</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setLafifModalOpen(true)} className="h-7 text-xs font-bold">
                                            تعديل بيانات الـ 12 شاهداً
                                        </Button>
                                        <Link href={`/dossiers/${dossier.id}/print-lafif`}>
                                            <Button size="sm" variant="emerald" className="h-7 text-xs gap-1 font-bold">
                                                <Printer className="h-3 w-3" />
                                                <span>طباعة المحضر</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                                        {lafifList.slice(0, 12).map((w, idx) => (
                                            <div key={idx} className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                                                <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                                                    <span>شاهد رقم {w.num || idx + 1}</span>
                                                    <span className="text-emerald-700 font-bold">سالم شرعاً</span>
                                                </div>
                                                <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                                    {w.name}
                                                </div>
                                                <div className="text-[11px] font-mono text-stone-500">
                                                    CIN: {w.cin || '—'}
                                                </div>
                                                <div className="text-[10px] text-stone-400 truncate mt-0.5">
                                                    {w.profession || 'فلاح / تاجر'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Audit Trail & History */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <History className="h-4 w-4 text-emerald-600" />
                                    <span>سجل التتبع والمطابقة غير القابل للتعديل (Audit Trail)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {dossier.act_logs?.length === 0 ? (
                                    <p className="text-xs text-stone-400 text-center py-2">لا توجد سجلات تتبع إضافية.</p>
                                ) : (
                                    dossier.act_logs?.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 text-xs border-s-2 border-emerald-600 ps-3 py-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-stone-800 dark:text-stone-200">{log.action}</span>
                                                    <span className="text-[10px] text-stone-400">
                                                        {new Date(log.created_at).toLocaleString('ar-MA')}
                                                    </span>
                                                </div>
                                                <p className="text-stone-500 mt-0.5">{log.details?.note || 'عملية مسجلة'}</p>
                                            </div>
                                            <span className="text-[10px] text-stone-400">{log.user?.name}</span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 4 Cols: QR Verification Badge + Financials */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* QR Code Verification Widget */}
                        <Card className="border-2 border-emerald-600/30 text-center overflow-hidden">
                            <div className="bg-emerald-800 text-white p-4">
                                <ShieldCheck className="h-7 w-7 text-amber-300 mx-auto mb-1" />
                                <CardTitle className="text-sm font-bold font-tajawal text-white">
                                    رمز التحقق الرقمي المعتمد
                                </CardTitle>
                                <p className="text-[11px] text-emerald-100 mt-0.5">
                                    بوابة التحقق الفوري للإدارات والمحافظة العقارية
                                </p>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200 inline-block mx-auto">
                                    <QRCodeSVG value={verifyUrl} size={130} level="H" />
                                </div>
                                <div className="text-[11px] font-mono text-stone-500 break-all px-2" dir="ltr">
                                    {verifyUrl}
                                </div>
                                <a
                                    href={verifyUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                                >
                                    <span>فتح صفحة التحقق الرسمية</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </CardContent>
                        </Card>

                        {/* Financial Settlement Card */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    <span>الأتعاب والواجبات المستخلصة</span>
                                </CardTitle>
                                <Link href={`/dossiers/${dossier.id}/fee-statement`}>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-700">
                                        بيان الحساب A4
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500">المبلغ الإجمالي المستحق:</span>
                                    <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">{dossier.amount_due} MAD</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500">المؤدى والمقبوض:</span>
                                    <span className="font-bold text-emerald-600 font-mono">{dossier.amount_paid} MAD</span>
                                </div>
                                <div className="flex justify-between py-1 font-bold">
                                    <span className="text-stone-500">الباقي في ذمة الموكل:</span>
                                    <span className={`font-mono ${Number(dossier.amount_due) > Number(dossier.amount_paid) ? 'text-amber-600' : 'text-stone-400'}`}>
                                        {Number(dossier.amount_due) - Number(dossier.amount_paid)} MAD
                                    </span>
                                </div>

                                <Button size="sm" variant="outline" onClick={() => setEditModalOpen(true)} className="w-full mt-2 text-xs font-bold">
                                    تحيين المبالغ والأتعاب
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Circuit & Qadi & Tax Dialog */}
            <Dialog open={circuitModalOpen} onOpenChange={setCircuitModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">
                            المسار القضائي، الخطاب، والتسجيل الجبائي والعقاري
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCircuit} className="space-y-4 text-xs font-tajawal">
                        {/* Section 1: Court & Qadi */}
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                1. قضاء التوثيق وقسم قضاء الأسرة
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>المحكمة المختصة</Label>
                                    <Input
                                        value={circuitForm.data.court_name}
                                        onChange={(e) => circuitForm.setData('court_name', e.target.value)}
                                        placeholder="ابتدائية الرباط"
                                    />
                                </div>
                                <div>
                                    <Label>وصل إيداع كتابة الضبط</Label>
                                    <Input
                                        value={circuitForm.data.deposit_receipt}
                                        onChange={(e) => circuitForm.setData('deposit_receipt', e.target.value)}
                                        placeholder="رقم وتاريخ وصل الإيداع"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label>رقم التضمين (سجل التضمين)</Label>
                                    <Input
                                        value={circuitForm.data.tadmine_number}
                                        onChange={(e) => circuitForm.setData('tadmine_number', e.target.value)}
                                        placeholder="مثال: 450"
                                    />
                                </div>
                                <div>
                                    <Label>رقم الكناش / السجل</Label>
                                    <Input
                                        value={circuitForm.data.kunnash_number}
                                        onChange={(e) => circuitForm.setData('kunnash_number', e.target.value)}
                                        placeholder="مثال: 12"
                                    />
                                </div>
                                <div>
                                    <Label>رقم الصحيفة</Label>
                                    <Input
                                        value={circuitForm.data.page_number}
                                        onChange={(e) => circuitForm.setData('page_number', e.target.value)}
                                        placeholder="مثال: 88"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>صيغة ورقم الخطاب القضائي</Label>
                                    <Input
                                        value={circuitForm.data.qadi_reference}
                                        onChange={(e) => circuitForm.setData('qadi_reference', e.target.value)}
                                        placeholder="خوطب به طبقاً للقانون تحت عدد..."
                                    />
                                </div>
                                <div>
                                    <Label>تاريخ تأشيرة الخطاب</Label>
                                    <Input
                                        type="date"
                                        value={circuitForm.data.qadi_validation_date}
                                        onChange={(e) => circuitForm.setData('qadi_validation_date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: DGI Taxes */}
                        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                            <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                                2. إدارة الضرائب (SIMPL-Adoul) — أجل 30 يوماً
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label>رقم التسجيل الجبائي (DGI)</Label>
                                    <Input
                                        value={circuitForm.data.dgi_number}
                                        onChange={(e) => circuitForm.setData('dgi_number', e.target.value)}
                                        placeholder="SIMPL-2026-XXXX"
                                    />
                                </div>
                                <div>
                                    <Label>تاريخ الأداء والتسجيل</Label>
                                    <Input
                                        type="date"
                                        value={circuitForm.data.dgi_date}
                                        onChange={(e) => circuitForm.setData('dgi_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>واجب التسجيل المؤدى (MAD)</Label>
                                    <Input
                                        type="number"
                                        value={circuitForm.data.dgi_amount}
                                        onChange={(e) => circuitForm.setData('dgi_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: ANCFCC Conservation */}
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                3. الوكالة الوطنية للمحافظة العقارية (ANCFCC)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>رقم الرسم العقاري / مطلب التحفيظ</Label>
                                    <Input
                                        value={circuitForm.data.ancfcc_title_number}
                                        onChange={(e) => circuitForm.setData('ancfcc_title_number', e.target.value)}
                                        placeholder="مثال: T/145892/03"
                                    />
                                </div>
                                <div>
                                    <Label>رقم إيداع مطلب التقييد</Label>
                                    <Input
                                        value={circuitForm.data.ancfcc_deposit_number}
                                        onChange={(e) => circuitForm.setData('ancfcc_deposit_number', e.target.value)}
                                        placeholder="DEP-2026-XXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Dual Adoul */}
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                4. الثنائية العدلية (العدل الثاني الشريك في التلقي)
                            </div>
                            <div>
                                <Label>اختيار العدل الثاني الشريك</Label>
                                <select
                                    value={circuitForm.data.second_adoul_id}
                                    onChange={(e) => circuitForm.setData('second_adoul_id', e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                                >
                                    <option value="">اختيار عدل ثانٍ من أعضاء المكتب...</option>
                                    {adoulUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.job_title || 'عدل موثق'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setCircuitModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={circuitForm.processing}>
                                حفظ واعتماد كافة المراجع
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Lafif 12 Witnesses Edit Dialog */}
            <Dialog open={lafifModalOpen} onOpenChange={setLafifModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">
                            إدارة وتحرير قائمة شهود اللفيف الشرعي الاثنا عشر (12 شاهداً)
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitLafif} className="space-y-4 text-xs font-tajawal">
                        <p className="text-stone-500">
                            يشترط في شهود اللفيف البلوغ، والذكورية، والعقل، والعدالة، والمروءة، والسلامة من الجرحة، والمعرفة التامة بالواقعة المشهود عليها.
                        </p>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pe-2">
                            {lafifForm.data.witnesses.map((w, index) => (
                                <div key={index} className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                                    <div className="sm:col-span-2">
                                        <Label className="text-[10px]">الشاهد {index + 1}: الاسم الكامل</Label>
                                        <Input
                                            value={w.name}
                                            onChange={(e) => {
                                                const list = [...lafifForm.data.witnesses];
                                                list[index].name = e.target.value;
                                                lafifForm.setData('witnesses', list);
                                            }}
                                            placeholder="الاسم والنسب واسم الأب"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">رقم البطاقة (CIN)</Label>
                                        <Input
                                            value={w.cin}
                                            onChange={(e) => {
                                                const list = [...lafifForm.data.witnesses];
                                                list[index].cin = e.target.value;
                                                lafifForm.setData('witnesses', list);
                                            }}
                                            placeholder="AB123456"
                                            className="h-8 text-xs font-mono"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">السن</Label>
                                        <Input
                                            type="number"
                                            value={w.age}
                                            onChange={(e) => {
                                                const list = [...lafifForm.data.witnesses];
                                                list[index].age = e.target.value;
                                                lafifForm.setData('witnesses', list);
                                            }}
                                            placeholder="60"
                                            className="h-8 text-xs font-mono"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">المهنة</Label>
                                        <Input
                                            value={w.profession}
                                            onChange={(e) => {
                                                const list = [...lafifForm.data.witnesses];
                                                list[index].profession = e.target.value;
                                                lafifForm.setData('witnesses', list);
                                            }}
                                            placeholder="فلاح / تاجر"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px]">محل السكنى</Label>
                                        <Input
                                            value={w.address}
                                            onChange={(e) => {
                                                const list = [...lafifForm.data.witnesses];
                                                list[index].address = e.target.value;
                                                lafifForm.setData('witnesses', list);
                                            }}
                                            placeholder="دوار / حي..."
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setLafifModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={lafifForm.processing}>
                                حفظ قائمة الـ 12 شاهداً
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Financial Edit Dialog */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">تعديل المبالغ والأتعاب</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>المبلغ المستحق (MAD)</Label>
                                <Input
                                    type="number"
                                    value={editForm.data.amount_due}
                                    onChange={(e) => editForm.setData('amount_due', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>المبلغ المقبوض (MAD)</Label>
                                <Input
                                    type="number"
                                    value={editForm.data.amount_paid}
                                    onChange={(e) => editForm.setData('amount_paid', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>ملاحظات نص العقد</Label>
                            <textarea
                                rows={3}
                                value={editForm.data.notes_ar}
                                onChange={(e) => editForm.setData('notes_ar', e.target.value)}
                                className="w-full rounded-md border border-stone-300 dark:border-stone-700 p-2 text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={editForm.processing}>حفظ التعديل</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
