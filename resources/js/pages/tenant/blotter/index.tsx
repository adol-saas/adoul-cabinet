import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    BookOpen,
    Search,
    Filter,
    Calendar,
    Printer,
    FileText,
    CheckCircle2,
    Clock,
    Scale,
    Receipt,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface BlotterIndexProps {
    entries: {
        data: Dossier[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
    };
    officeSetting: OfficeSetting | null;
    stats: {
        total_entries: number;
        current_year_count: number;
        free_acts_count: number;
        court_validated_count: number;
    };
}

export default function BlotterIndex({
    entries,
    filters = {},
    officeSetting,
    stats,
}: BlotterIndexProps) {
    const entryList: Dossier[] = Array.isArray(entries?.data)
        ? entries.data
        : (Array.isArray(entries) ? entries : []);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/blotter',
            {
                search: search || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'زواج شرعي',
        divorce: 'إشهاد طلاق',
        revocation: 'مراجعة زوجية',
        property_sale: 'بيع وتفويت عقاري',
        property_gift: 'هبة وصدقة',
        poa: 'وكالة رسمية',
        will: 'إراثة وحصر تركة',
        certificate: 'إشهاد واستعفاء',
        commercial_lease: 'كراء تجاري',
        mortgage: 'رهن وتوثيق دين',
        lafif_property: 'لفيف الملكية (12 شاهداً)',
        islam_conversion: 'اعتناق الإسلام (مجاني)',
        crescent_sighting: 'مراقبة الهلال (مجاني)',
        indigent_marriage: 'زواج معوزين (مجاني)',
    };

    return (
        <TenantAdminLayout title="مذكرة الحفظ اليومية (المادة 24)">
            <Head title="مذكرة الحفظ الرسمية للعدلين — القانون 16.03" />

            <div className="space-y-6">
                {/* Official Legal Header Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white shadow-md border border-emerald-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-amber-400" />
                            <h1 className="text-xl font-bold font-tajawal">مذكرة الحفظ اليومية للسادة العدول (Journal de Conservation)</h1>
                        </div>
                        <p className="text-xs text-emerald-200">
                            سجل إلزامي رسمي ممسوك طبقاً لأحكام <strong>المادة 24 من القانون رقم 16.03</strong> المنظم لخطة العدالة بالمملكة المغربية
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 print:hidden font-bold"
                    >
                        <Printer className="h-4 w-4 text-amber-300" />
                        <span>طباعة سجل مذكرة الحفظ A4</span>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
                    <Card className="border-stone-200 dark:border-stone-800">
                        <CardHeader className="pb-2">
                            <span className="text-xs text-stone-500 font-semibold">مجموع قيود المذكرة</span>
                            <CardTitle className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-400">
                                {stats.total_entries}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-stone-200 dark:border-stone-800">
                        <CardHeader className="pb-2">
                            <span className="text-xs text-stone-500 font-semibold">قيود السنة الحالية</span>
                            <CardTitle className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                                {stats.current_year_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-stone-200 dark:border-stone-800">
                        <CardHeader className="pb-2">
                            <span className="text-xs text-stone-500 font-semibold">رسوم معفاة (0 درهم بقوة القانون)</span>
                            <CardTitle className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                                {stats.free_acts_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-stone-200 dark:border-stone-800">
                        <CardHeader className="pb-2">
                            <span className="text-xs text-stone-500 font-semibold">المخاطب عليها بالمحكمة</span>
                            <CardTitle className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                                {stats.court_validated_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Search & Filter Bar */}
                <Card className="border-stone-200 dark:border-stone-800 print:hidden">
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="lg:col-span-2 relative">
                                <Search className="absolute start-3 top-2.5 h-4 w-4 text-stone-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="بحث برقم المرجع، اسم الطرف، أو رقم CIN..."
                                    className="ps-9 text-xs"
                                />
                            </div>

                            <div>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                                >
                                    <option value="all">كافة مواضيع الرسوم...</option>
                                    {Object.entries(actTypeLabels).map(([k, label]) => (
                                        <option key={k} value={k}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="text-xs h-9"
                                    title="من تاريخ"
                                />
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="text-xs h-9"
                                    title="إلى تاريخ"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" variant="emerald" size="sm" className="w-full font-bold text-xs h-9">
                                    <Filter className="h-3.5 w-3.5 me-1" />
                                    <span>تصفية</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Blotter Register Table */}
                <Card className="border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border-collapse">
                            <thead>
                                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-700">
                                    <th className="p-3 w-16 text-center">العدد بالمذكرة</th>
                                    <th className="p-3">تاريخ وساعة التلقي</th>
                                    <th className="p-3">موضوع الشهادة العدلية</th>
                                    <th className="p-3">الأطراف المتعاقدة (الأسماء وCIN)</th>
                                    <th className="p-3">الواجبات المؤداة والأتعاب</th>
                                    <th className="p-3">مآل المخاطبة والتضمين</th>
                                    <th className="p-3 text-center print:hidden">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                {entryList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-stone-500">
                                            لا توجد قيود مسجلة في مذكرة الحفظ مطابقة لمعايير البحث الحالية.
                                        </td>
                                    </tr>
                                ) : (
                                    entryList.map((entry, idx) => {
                                        const isFree = entry.type === 'islam_conversion' || entry.type === 'crescent_sighting' || entry.type === 'indigent_marriage' || (entry.details as any)?.is_statutory_free;

                                        return (
                                            <tr key={entry.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-900/50 transition-colors">
                                                <td className="p-3 text-center font-mono font-bold text-stone-700 dark:text-stone-300">
                                                    {(entry.details as any)?.conservation_blotter_number || entry.id}
                                                </td>
                                                <td className="p-3 font-mono text-stone-600 dark:text-stone-400">
                                                    <div>{entry.act_date ? String(entry.act_date) : String(entry.created_at).split('T')[0]}</div>
                                                    <span className="text-[10px] text-stone-400">تلقي ثنائي معتمد</span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-bold text-emerald-950 dark:text-emerald-300 font-tajawal">
                                                        {actTypeLabels[entry.type] || entry.type}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-stone-500" dir="ltr">
                                                        Ref: {entry.reference}
                                                    </div>
                                                </td>
                                                <td className="p-3 space-y-1">
                                                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                                                        1. {entry.client?.name_ar} <span className="font-mono text-stone-500 font-normal">({entry.client?.cin})</span>
                                                    </div>
                                                    {entry.client2 && (
                                                        <div className="text-stone-600 dark:text-stone-400">
                                                            2. {entry.client2.name_ar} <span className="font-mono text-stone-500">({entry.client2.cin})</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {isFree ? (
                                                        <Badge variant="emerald" className="text-[10px]">
                                                            معفى بقوة القانون (0 درهم)
                                                        </Badge>
                                                    ) : (
                                                        <div className="font-mono text-stone-800 dark:text-stone-200">
                                                            <div>المستحق: <strong>{entry.amount_due} DH</strong></div>
                                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">المقبوض: {entry.amount_paid} DH</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {entry.qadi_reference ? (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                <span>خوطب عليه وصح</span>
                                                            </div>
                                                            <div className="font-mono text-[10px] text-stone-500">
                                                                كناش: {entry.qadi_reference}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px]">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>في طور المراقبة والإيداع</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center print:hidden">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link href={`/dossiers/${entry.id}/print`}>
                                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="استوديو التحرير والطباعة A4">
                                                                <FileText className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/dossiers/${entry.id}/fee-statement`}>
                                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-700 dark:text-amber-400" title="بيان الحساب والضرائب">
                                                                <Receipt className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </TenantAdminLayout>
    );
}
