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
    DollarSign,
    ShieldCheck,
    History,
    ArrowRight,
    Edit2,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface DossierShowProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    template: any;
    verifyUrl: string;
}

export default function TenantDossierShow({
    dossier,
    officeSetting,
    template,
    verifyUrl,
}: DossierShowProps) {
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const statusForm = useForm({
        status: dossier.status,
        qadi_reference: dossier.qadi_reference || '',
        note: '',
    });

    const editForm = useForm({
        amount_due: dossier.amount_due,
        amount_paid: dossier.amount_paid,
        notes_ar: dossier.notes_ar || '',
        notes_fr: dossier.notes_fr || '',
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.put(`/dossiers/${dossier.id}/status`, {
            onSuccess: () => setStatusModalOpen(false),
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/dossiers/${dossier.id}`, {
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`تحذير: هل أنت متأكد من حذف الملف [${dossier.reference}] نهائياً؟`)) {
            router.delete(`/dossiers/${dossier.id}`);
        }
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج شرعي',
        divorce: 'إشهاد طلاق أو رجعة',
        property_sale: 'معاملة ورسم بيع عقاري',
        property_gift: 'رسم هبة وصدقة',
        poa: 'وكالة رسمية',
        will: 'رسم إراثة أو وصية شرعية',
        certificate: 'إشهاد عدلي',
    };

    const statusBadges: Record<string, { label: string; variant: 'emerald' | 'destructive' | 'outline' | 'gold' }> = {
        draft: { label: 'مسودة قيد التحرير', variant: 'outline' },
        pending_qadi: { label: 'مودع لدى قاضي التوثيق', variant: 'gold' },
        signed: { label: 'موقع رسمياً ومخاطب عليه', variant: 'emerald' },
        archived: { label: 'مضمن ومؤرشف نهائياً', variant: 'emerald' },
        cancelled: { label: 'ملغى', variant: 'destructive' },
    };

    const st = statusBadges[dossier.status] || { label: dossier.status, variant: 'outline' };

    return (
        <TenantAdminLayout title={`الملف العدلي: ${dossier.reference}`}>
            <Head title={`الملف: ${dossier.reference} — Adoul`} />

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
                                <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                                تاريخ الإشهاد: {dossier.act_date ? new Date(dossier.act_date).toLocaleDateString('ar-MA') : 'مسجل'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                        <Link href={`/dossiers/${dossier.id}/print`}>
                            <Button variant="emerald" size="sm" className="gap-1.5 font-bold shadow-xs">
                                <Printer className="h-4 w-4" />
                                <span>طباعة الوثيقة الرسمية مع QR</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(true)} className="gap-1.5 text-xs font-semibold">
                            <Scale className="h-3.5 w-3.5 text-amber-500" />
                            <span>تغيير المرحلة</span>
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

                {/* Main 3-Column Grid */}
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Left 8 Cols: Parties, Qadi Info, Act Details */}
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
                                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الأول:</span>
                                    <Link href={`/clients/${dossier.client?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                        {dossier.client?.name_ar || dossier.client?.name}
                                    </Link>
                                    <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                        CIN: {dossier.client?.cin}
                                    </div>
                                    <div className="text-stone-500 mt-1">{dossier.client?.phone}</div>
                                </div>

                                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الثاني:</span>
                                    {dossier.client2 ? (
                                        <>
                                            <Link href={`/clients/${dossier.client2?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                                {dossier.client2?.name_ar || dossier.client2?.name}
                                            </Link>
                                            <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                                CIN: {dossier.client2?.cin}
                                            </div>
                                            <div className="text-stone-500 mt-1">{dossier.client2?.phone}</div>
                                        </>
                                    ) : (
                                        <div className="text-stone-400 italic py-2">لا يوجد طرف ثانٍ مقترن بهذا الملف</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Qadi & Registration Details */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-amber-500" />
                                    <span>المسار القضائي وتأشير قاضي التوثيق</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-stone-400 block mb-1">مرجع التضمين بالمحكمة:</span>
                                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                                        {dossier.qadi_reference || 'قيد الإيداع والمخاطبة'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block mb-1">العدل المتلقي:</span>
                                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                                        {dossier.adoul?.name || 'عدل موثق'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block mb-1">تاريخ توقيع الشهادة:</span>
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        {dossier.signing_date ? new Date(dossier.signing_date).toLocaleDateString('ar-MA') : 'في انتظار التوقيع'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

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
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    <span>الرسوم والأتعاب المستخلصة</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500">المبلغ الإجمالي المستحق:</span>
                                    <span className="font-bold text-stone-900 dark:text-stone-100">{dossier.amount_due} MAD</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500">المؤدى والمقبوض:</span>
                                    <span className="font-bold text-emerald-600">{dossier.amount_paid} MAD</span>
                                </div>
                                <div className="flex justify-between py-1 font-bold">
                                    <span className="text-stone-500">الباقي في ذمة الموكل:</span>
                                    <span className={Number(dossier.amount_due) > Number(dossier.amount_paid) ? 'text-amber-600' : 'text-stone-400'}>
                                        {Number(dossier.amount_due) - Number(dossier.amount_paid)} MAD
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Status Transition Dialog */}
            <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">تحديث المرحلة الإدارية للرسم العدلي</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitStatus} className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <Label>المرحلة الحالية / الجديدة *</Label>
                            <select
                                value={statusForm.data.status}
                                onChange={(e) => statusForm.setData('status', e.target.value as any)}
                                className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                            >
                                <option value="draft">مسودة قيد التحرير (Draft)</option>
                                <option value="pending_qadi">إحالة إلى قاضي التوثيق بالمحكمة (Pending Qadi)</option>
                                <option value="signed">موقع ومخاطب عليه رسمياً (Signed)</option>
                                <option value="archived">مضمن في كناش الحفظ النهائي (Archived)</option>
                                <option value="cancelled">إلغاء المعاملة (Cancelled)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label>رقم التضمين / كناش المحكمة (عند التأشير)</Label>
                            <Input
                                value={statusForm.data.qadi_reference}
                                onChange={(e) => statusForm.setData('qadi_reference', e.target.value)}
                                placeholder="مثال: كناش 12 رقم 450 ص 80"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>ملاحظة توثيقية في سجل التتبع</Label>
                            <Input
                                value={statusForm.data.note}
                                onChange={(e) => statusForm.setData('note', e.target.value)}
                                placeholder="سبب التغيير أو تفاصيل الإيداع..."
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={statusForm.processing}>تأكيد تغيير المرحلة</Button>
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
