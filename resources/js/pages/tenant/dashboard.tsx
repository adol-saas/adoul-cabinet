import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FolderKanban,
    Users,
    DollarSign,
    Calendar,
    Scale,
    Clock,
    Plus,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ExternalLink,
    FileText,
    Lock,
} from 'lucide-react';
import { Appointment, Dossier } from '@/types';

interface DashboardProps {
    metrics: {
        dossiers_this_month: number;
        total_clients: number;
        revenue_this_month?: number | null;
        due_this_month?: number | null;
        pending_qadi_count: number;
        pending_appointments: number;
        can_view_financials?: boolean;
    };
    todayAppointments: Appointment[];
    pendingQadiDossiers: Dossier[];
    recentDossiers: Dossier[];
    typesBreakdown: Record<string, number>;
}

export default function TenantDashboard({
    metrics,
    todayAppointments = [],
    pendingQadiDossiers = [],
    recentDossiers = [],
    typesBreakdown = {},
}: DashboardProps) {
    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج',
        divorce: 'إشهاد طلاق/رجعة',
        property_sale: 'بيع ومعاملة عقارية',
        inheritance: 'إراثة وحصر تركة',
        poa: 'وكالة رسمية',
        will: 'وصية شرعية',
        donation: 'هبة وصدقة',
        commercial: 'عقد تجاري',
        other: 'إشهاد عدلي عام',
    };

    const statusBadges: Record<string, { label: string; variant: 'emerald' | 'destructive' | 'outline' | 'gold' }> = {
        draft: { label: 'مسودة قيد التحرير', variant: 'outline' },
        signed: { label: 'موقع من العدلين', variant: 'emerald' },
        pending_qadi: { label: 'لدى قاضي التوثيق', variant: 'gold' },
        archived: { label: 'مضمن ومؤرشف', variant: 'emerald' },
        cancelled: { label: 'ملغى', variant: 'destructive' },
    };

    return (
        <TenantAdminLayout title="لوحة قيادة المكتب العدلي">
            <Head title="لوحة القيادة — فضاء التوثيق العدلي" />

            <div className="space-y-8">
                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                        <span className="font-bold text-sm font-tajawal text-stone-900 dark:text-stone-100">
                            فضاء العمل اليومي لمكتب التوثيق
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/dossiers/create">
                            <Button variant="emerald" size="sm" className="gap-1.5 font-bold shadow-xs">
                                <Plus className="h-4 w-4" />
                                <span>تحرير عقد / ملف جديد</span>
                            </Button>
                        </Link>
                        <Link href="/clients">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                                <Users className="h-3.5 w-3.5" />
                                <span>إضافة موكل</span>
                            </Button>
                        </Link>
                        <Link href="/appointments">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>جدول المواعيد</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-white to-emerald-50/40 dark:from-stone-900 dark:to-emerald-950/20 shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">عقود وملفات هذا الشهر</span>
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 shadow-2xs">
                                <FolderKanban className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                    {metrics?.dossiers_this_month || 0}
                                </div>
                                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                                    +14% ↑
                                </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-2 flex items-center justify-between">
                                <span>إجمالي الموكلين المسجلين:</span>
                                <span className="font-semibold text-stone-800 dark:text-stone-200">{metrics?.total_clients || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {metrics?.can_view_financials !== false ? (
                        <Card className="border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-white to-amber-50/40 dark:from-stone-900 dark:to-amber-950/20 shadow-xs hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <span className="text-xs font-semibold text-stone-500">الأتعاب المحصلة (هذا الشهر)</span>
                                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 shadow-2xs">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline justify-between">
                                    <div className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                        {(metrics?.revenue_this_month || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">MAD</span>
                                    </div>
                                    <span className="inline-flex items-center text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                                        تحصيل 92%
                                    </span>
                                </div>
                                <div className="text-xs text-amber-700 dark:text-amber-300 mt-2 flex items-center justify-between font-medium">
                                    <span>مبالغ في ذمة الموكلين:</span>
                                    <span className="font-bold">{(metrics?.due_this_month || 0).toLocaleString()} MAD</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <span className="text-xs font-semibold text-stone-500">الأتعاب والبيانات المالية</span>
                                <div className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-500 shadow-2xs">
                                    <Lock className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-base font-bold font-tajawal text-stone-700 dark:text-stone-300 mt-1">
                                    محجوبة (سرية مهنية)
                                </div>
                                <div className="text-[11px] text-stone-400 mt-2">
                                    صلاحية مقتصرة على السادة العدول أصحاب المكتب
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-white to-blue-50/40 dark:from-stone-900 dark:to-blue-950/20 shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">لدى قاضي التوثيق بالمحكمة</span>
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 shadow-2xs">
                                <Scale className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-3xl font-extrabold font-tajawal text-blue-800 dark:text-blue-400">
                                    {metrics?.pending_qadi_count || 0}
                                </div>
                                <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                                    قيد التأشيرة
                                </span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                تنتظر التضمين ومخاطبة القاضي
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-white to-purple-50/40 dark:from-stone-900 dark:to-purple-950/20 shadow-xs hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">مواعيد وطلبات المواطنين</span>
                            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 shadow-2xs">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                    {todayAppointments.length}
                                </div>
                                <span className="inline-flex items-center text-[11px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                                    مواعيد اليوم
                                </span>
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                {metrics?.pending_appointments || 0} طلب قيد التأكيد
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Split: Pending Qadi + Today Appointments */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Pending Qadi Dossiers */}
                    <Card className="lg:col-span-7">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-amber-500" />
                                    <span>ملفات قيد المخاطبة لدى قاضي التوثيق</span>
                                </CardTitle>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    محاضر مودعة لدى كتابة الضبط بالمحكمة الابتدائية لاستكمال الصيغة الرسمية
                                </p>
                            </div>
                            <Link href="/dossiers?status=pending_qadi">
                                <Button variant="ghost" size="sm" className="text-xs text-emerald-700">عرض الكل</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {pendingQadiDossiers.length === 0 ? (
                                <div className="p-8 text-center text-xs text-stone-400">
                                    لا توجد عقود معلقة لدى قاضي التوثيق حالياً. كافة المحاضر مضمنة ومخاطب عليها.
                                </div>
                            ) : (
                                <table className="w-full text-start text-xs">
                                    <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-y border-stone-200 dark:border-stone-800">
                                        <tr>
                                            <th className="p-3 text-start">المرجع</th>
                                            <th className="p-3 text-start">نوع العقد</th>
                                            <th className="p-3 text-start">الموكل الرئيسي</th>
                                            <th className="p-3 text-start">تاريخ الإيداع</th>
                                            <th className="p-3 text-end">فتح</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {pendingQadiDossiers.map((d) => (
                                            <tr key={d.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                                <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                    {d.reference}
                                                </td>
                                                <td className="p-3 font-semibold text-stone-800 dark:text-stone-200">
                                                    {actTypeLabels[d.type] || d.type}
                                                </td>
                                                <td className="p-3 text-stone-600 dark:text-stone-300">
                                                    {d.client?.name || 'طرف العقد'}
                                                </td>
                                                <td className="p-3 text-stone-500">
                                                    {d.act_date || 'مسجل'}
                                                </td>
                                                <td className="p-3 text-end">
                                                    <Link href={`/dossiers/${d.id}`}>
                                                        <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                                                            <span>متابعة</span>
                                                            <ArrowUpRight className="h-3 w-3 ms-1" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Today Appointments */}
                    <Card className="lg:col-span-5">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                    <span>مواعيد اليوم بالمكتب ({todayAppointments.length})</span>
                                </CardTitle>
                            </div>
                            <Link href="/appointments">
                                <Button variant="ghost" size="sm" className="text-xs text-emerald-700">الجدول</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {todayAppointments.length === 0 ? (
                                <div className="p-8 text-center text-xs text-stone-400">
                                    لا توجد مواعيد مبرمجة لليوم في جدول المكتب.
                                </div>
                            ) : (
                                todayAppointments.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-stone-900 dark:text-stone-100">
                                                    {appt.client_name || appt.client?.name}
                                                </span>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {actTypeLabels[appt.type] || appt.type}
                                                </Badge>
                                            </div>
                                            <div className="text-[11px] text-stone-500 flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-amber-500" />
                                                <span>{new Date(appt.scheduled_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span dir="ltr">{appt.client_phone}</span>
                                            </div>
                                        </div>

                                        <Badge variant={appt.status === 'confirmed' ? 'emerald' : 'outline'} className="text-[10px]">
                                            {appt.status === 'confirmed' ? 'مؤكد' : 'قيد التأكيد'}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Dossiers List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold font-tajawal">سجل المحررات والملفات الحديثة</CardTitle>
                            <p className="text-xs text-stone-500 mt-0.5">الملفات التي تم فتحها وتحديثها مؤخراً في كناش المكتب</p>
                        </div>
                        <Link href="/dossiers">
                            <Button variant="outline" size="sm" className="text-xs">سجل كافة الملفات</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-y border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3 text-start">الرقم المرجعي</th>
                                    <th className="p-3 text-start">موضوع المحرر</th>
                                    <th className="p-3 text-start">الموكل والأطراف</th>
                                    <th className="p-3 text-start">حالة الملف</th>
                                    <th className="p-3 text-start">الأتعاب المسددة</th>
                                    <th className="p-3 text-end">فتح الملف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {recentDossiers.map((dossier) => {
                                    const st = statusBadges[dossier.status] || { label: dossier.status, variant: 'outline' };
                                    return (
                                        <tr key={dossier.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                            <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                {dossier.reference}
                                            </td>
                                            <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                                                {actTypeLabels[dossier.type] || dossier.type}
                                            </td>
                                            <td className="p-3 text-stone-700 dark:text-stone-300">
                                                {dossier.client?.name || 'غير محدد'}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                                            </td>
                                            <td className="p-3 font-semibold text-stone-800 dark:text-stone-200">
                                                {dossier.amount_paid} MAD
                                            </td>
                                            <td className="p-3 text-end">
                                                <Link href={`/dossiers/${dossier.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700">
                                                        عرض
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </TenantAdminLayout>
    );
}
