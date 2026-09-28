import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FolderKanban,
    Search,
    Plus,
    Filter,
    Eye,
    Printer,
    CheckCircle2,
    Clock,
    Scale,
    FileText,
    Download,
} from 'lucide-react';
import { Dossier, PaginatedData } from '@/types';

interface DossiersIndexProps {
    dossiers: PaginatedData<Dossier>;
    filters: { search?: string; type?: string; status?: string };
    stats: {
        total: number;
        draft: number;
        pending_qadi: number;
        signed: number;
        archived: number;
    };
}

export default function TenantDossiersIndex({
    dossiers,
    filters = {},
    stats,
}: DossiersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dossiers', {
            search,
            type: typeFilter,
            status: statusFilter,
        }, { preserveState: true });
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج',
        divorce: 'إشهاد طلاق/رجعة',
        revocation: 'إشهاد رجعة',
        property_sale: 'بيع ومعاملة عقارية',
        property_gift: 'هبة وصدقة عقارية',
        property_pledge: 'رهن حيازي',
        poa: 'وكالة رسمية',
        will: 'وصية شرعية',
        certificate: 'إشهاد عدلي',
        other: 'محرر عدلي عام',
    };

    const statusBadges: Record<string, { label: string; variant: 'emerald' | 'destructive' | 'outline' | 'gold' }> = {
        draft: { label: 'مسودة قيد التحرير', variant: 'outline' },
        pending_qadi: { label: 'لدى قاضي التوثيق', variant: 'gold' },
        signed: { label: 'موقع رسمياً', variant: 'emerald' },
        archived: { label: 'مضمن ومؤرشف', variant: 'emerald' },
        cancelled: { label: 'ملغى', variant: 'destructive' },
    };

    return (
        <TenantAdminLayout title="سجل المحررات والعقود العدلية">
            <Head title="سجل العقود والمحررات — فضاء التوثيق العدلي" />

            <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            كناش العقود والشهادات العدلية ({dossiers.total || dossiers.data?.length || 0})
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            سجل الحفظ الإلكتروني للمحررات طبقاً لقانون خطة العدالة 16.03
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start">
                        <Link href="/dossiers/create">
                            <Button variant="emerald" size="sm" className="gap-2 font-bold shadow-xs">
                                <Plus className="h-4 w-4" />
                                <span>تحرير عقد جديد</span>
                            </Button>
                        </Link>
                        <a href="/exports/dossiers/pdf" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer border-emerald-500/50 text-emerald-800 dark:text-emerald-300">
                                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                                <span>(PDF) تصدير السجل</span>
                            </Button>
                        </a>
                        <a href="/exports/dossiers" download>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                                <Download className="h-3.5 w-3.5 text-stone-600" />
                                <span>(CSV) تصدير السجل</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Status Badges Toolbar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <button
                        type="button"
                        onClick={() => router.get('/dossiers', { status: 'all' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            statusFilter === 'all' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-[11px] text-stone-500 block">كافة الملفات</span>
                        <span className="text-lg font-bold font-tajawal text-stone-900 dark:text-stone-100">{stats?.total || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/dossiers', { status: 'draft' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            statusFilter === 'draft' ? 'border-stone-600 bg-stone-100 dark:bg-stone-800' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-[11px] text-stone-500 block">مسودات</span>
                        <span className="text-lg font-bold font-tajawal text-stone-600">{stats?.draft || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/dossiers', { status: 'pending_qadi' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            statusFilter === 'pending_qadi' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-[11px] text-stone-500 block">لدى قاضي التوثيق</span>
                        <span className="text-lg font-bold font-tajawal text-amber-600">{stats?.pending_qadi || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/dossiers', { status: 'signed' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            statusFilter === 'signed' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-[11px] text-stone-500 block">موقعة ونافذة</span>
                        <span className="text-lg font-bold font-tajawal text-emerald-600">{stats?.signed || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/dossiers', { status: 'archived' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            statusFilter === 'archived' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-[11px] text-stone-500 block">مضمنة في الحفظ</span>
                        <span className="text-lg font-bold font-tajawal text-blue-600">{stats?.archived || 0}</span>
                    </button>
                </div>

                {/* Filter Controls */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-center">
                            <div className="flex-1 min-w-[220px] relative">
                                <Search className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث بالمرجع (ACT-...)، اسم المتعاقد، أو رقم بطاقته..."
                                    className="ps-9 h-10 text-xs"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                            >
                                <option value="all">كافة أنواع العقود</option>
                                {Object.entries(actTypeLabels).map(([k, label]) => (
                                    <option key={k} value={k}>{label}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                            >
                                <option value="all">كافة المراحل الإدارية</option>
                                <option value="draft">مسودة</option>
                                <option value="pending_qadi">لدى قاضي التوثيق</option>
                                <option value="signed">موقع رسمياً</option>
                                <option value="archived">مضمن ومؤرشف</option>
                            </select>

                            <Button type="submit" variant="outline" size="sm" className="h-10 px-4 text-xs font-semibold">
                                <Filter className="h-3.5 w-3.5 me-1.5" />
                                <span>تصفية</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Dossiers Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3.5 text-start">المرجع الرسمي</th>
                                    <th className="p-3.5 text-start">نوع العقد والمحرر</th>
                                    <th className="p-3.5 text-start">أطراف العقد (المتعاقدون)</th>
                                    <th className="p-3.5 text-start">الحالة الإدارية</th>
                                    <th className="p-3.5 text-start">الأتعاب والرسوم</th>
                                    <th className="p-3.5 text-start">تاريخ الإبرام</th>
                                    <th className="p-3.5 text-end">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {dossiers.data?.map((d) => {
                                    const st = statusBadges[d.status] || { label: d.status, variant: 'outline' };
                                    return (
                                        <tr key={d.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                            <td className="p-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                {d.reference}
                                                {d.qadi_reference && (
                                                    <div className="text-[10px] text-stone-400 font-normal">
                                                        تضمين: {d.qadi_reference}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3.5 font-semibold text-stone-900 dark:text-stone-100">
                                                {actTypeLabels[d.type] || d.type}
                                            </td>
                                            <td className="p-3.5 space-y-0.5">
                                                <div className="font-bold text-stone-800 dark:text-stone-200">
                                                    {d.client?.name_ar || d.client?.name}
                                                    <span className="font-mono text-[10px] text-stone-400 ms-1 font-normal">({d.client?.cin})</span>
                                                </div>
                                                {d.client2 && (
                                                    <div className="text-[11px] text-stone-500">
                                                        طرف ثانٍ: {d.client2.name_ar || d.client2.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                    {d.amount_paid} MAD
                                                </div>
                                                {Number(d.amount_due) > Number(d.amount_paid) && (
                                                    <div className="text-[10px] text-amber-600">
                                                        باقٍ: {Number(d.amount_due) - Number(d.amount_paid)} MAD
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3.5 text-stone-500">
                                                {d.act_date ? new Date(d.act_date).toLocaleDateString('ar-MA') : 'مسجل'}
                                            </td>
                                            <td className="p-3.5 text-end space-x-1.5 space-x-reverse">
                                                <Link href={`/dossiers/${d.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700">
                                                        <span>تفاصيل</span>
                                                        <Eye className="h-3.5 w-3.5 ms-1" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/dossiers/${d.id}/print`}>
                                                    <Button variant="outline" size="sm" className="h-7 p-1.5 text-stone-600">
                                                        <Printer className="h-3.5 w-3.5" />
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
