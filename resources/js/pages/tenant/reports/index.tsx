import React from 'react';
import { Head } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, TrendingUp, DollarSign, FolderKanban, Users, Scale, Printer } from 'lucide-react';
import { Client } from '@/types';

interface ReportProps {
    monthlyTrends: { month: string; label: string; count: number; revenue: number }[];
    dossiersByType: { type: string; count: number; total_paid: number }[];
    topClients: (Client & { dossiers_count: number })[];
    financialSummary: {
        total_revenue: number;
        total_due: number;
        total_unpaid: number;
        average_fee_per_act: number;
    };
}

export default function TenantReportsIndex({
    monthlyTrends = [],
    dossiersByType = [],
    topClients = [],
    financialSummary,
}: ReportProps) {
    const trends = Array.isArray(monthlyTrends)
        ? monthlyTrends
        : (monthlyTrends && Array.isArray((monthlyTrends as any).data) ? (monthlyTrends as any).data : []);
    const typeList = Array.isArray(dossiersByType)
        ? dossiersByType
        : (dossiersByType && Array.isArray((dossiersByType as any).data) ? (dossiersByType as any).data : []);
    const clientList = Array.isArray(topClients)
        ? topClients
        : (topClients && Array.isArray((topClients as any).data) ? (topClients as any).data : []);

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج شرعي',
        divorce: 'إشهاد طلاق ورجعة',
        property_sale: 'معاملات وبيوع عقارية',
        property_gift: 'هبات وصدقات',
        poa: 'وكالات رسمية',
        will: 'إراثة ووصايا',
        certificate: 'إشهادات عامة',
    };

    const maxMonthlyRevenue = Math.max(1, ...trends.map((m) => m.revenue));

    return (
        <TenantAdminLayout title="التقارير والإحصائيات المالية">
            <Head title="التقارير والإحصائيات — فضاء التوثيق العدلي" />

            <div className="space-y-6">
                {/* Header with Export buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            اللوحة الإحصائية والتقارير الدورية للمكتب
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            مؤشرات الأداء التوثيقي، الأتعاب المستخلصة، وتوزيع المعاملات حسب الصنف
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start">
                        <a href="/exports/dossiers/pdf" target="_blank" rel="noreferrer">
                            <Button variant="emerald" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                                <Printer className="h-3.5 w-3.5" />
                                <span>(PDF) تصدير سجل العقود</span>
                            </Button>
                        </a>
                        <a href="/exports/dossiers" download>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                                <Download className="h-3.5 w-3.5 text-emerald-600" />
                                <span>(CSV) تصدير سجل العقود</span>
                            </Button>
                        </a>
                        <a href="/exports/clients/pdf" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer border-blue-500/50 text-blue-700 dark:text-blue-400">
                                <Printer className="h-3.5 w-3.5 text-blue-600" />
                                <span>(PDF) تصدير لائحة المتعاقدين</span>
                            </Button>
                        </a>
                        <a href="/exports/clients" download>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                <span>(CSV) تصدير لائحة المتعاقدين</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/40 dark:from-stone-900 dark:to-emerald-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">إجمالي الأتعاب المحصلة</span>
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                {(financialSummary?.total_revenue || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">MAD</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-white to-amber-50/40 dark:from-stone-900 dark:to-amber-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">المتبقي بذمة الموكلين</span>
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-tajawal text-amber-600">
                                {(financialSummary?.total_unpaid || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">MAD</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50/40 dark:from-stone-900 dark:to-blue-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">الإجمالي العام المستحق</span>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700">
                                <Scale className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                {(financialSummary?.total_due || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">MAD</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-white to-purple-50/40 dark:from-stone-900 dark:to-purple-950/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-semibold text-stone-500">متوسط الأتعاب لكل رسم</span>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                {(financialSummary?.average_fee_per_act || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">MAD</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts & Breakdown */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Monthly Trends Chart */}
                    <Card className="lg:col-span-7">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-emerald-600" />
                                <span>تطور المداخيل وعدد العقود لآخر 6 أشهر</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {trends.map((trend) => {
                                const pct = Math.min(100, Math.max(8, (trend.revenue / maxMonthlyRevenue) * 100));
                                return (
                                    <div key={trend.month} className="space-y-1.5 text-xs">
                                        <div className="flex justify-between font-semibold">
                                            <span>{trend.label}</span>
                                            <span className="text-emerald-700 dark:text-emerald-400">
                                                {trend.revenue.toLocaleString()} MAD ({trend.count} عقد)
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Types Breakdown */}
                    <Card className="lg:col-span-5">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <FolderKanban className="h-4 w-4 text-emerald-600" />
                                <span>توزيع المعاملات حسب صنف العقد</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-y border-stone-200 dark:border-stone-800">
                                    <tr>
                                        <th className="p-3 text-start">نوع العقد</th>
                                        <th className="p-3 text-center">العدد</th>
                                        <th className="p-3 text-end">إجمالي الأتعاب</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {typeList.map((item) => (
                                        <tr key={item.type} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                            <td className="p-3 font-semibold text-stone-800 dark:text-stone-200">
                                                {actTypeLabels[item.type] || item.type}
                                            </td>
                                            <td className="p-3 text-center font-bold font-tajawal">
                                                {item.count}
                                            </td>
                                            <td className="p-3 text-end font-semibold text-emerald-700 dark:text-emerald-400">
                                                {item.total_paid.toLocaleString()} MAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Clients */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            <span>أكثر المتعاقدين نشاطاً وإبراماً للرسوم بالمكتب</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3 text-start">المتعاقد</th>
                                    <th className="p-3 text-start">رقم البطاقة (CIN)</th>
                                    <th className="p-3 text-start">الهاتف</th>
                                    <th className="p-3 text-end">عدد العقود المقترنة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {clientList.map((c) => (
                                    <tr key={c.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                        <td className="p-3 font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                            {c.name_ar || c.name}
                                        </td>
                                        <td className="p-3 font-mono text-emerald-800 dark:text-emerald-400">{c.cin}</td>
                                        <td className="p-3 text-stone-500" dir="ltr">{c.phone || '—'}</td>
                                        <td className="p-3 text-end font-bold text-stone-900 dark:text-stone-100">
                                            {c.dossiers_count} عقود
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </TenantAdminLayout>
    );
}
