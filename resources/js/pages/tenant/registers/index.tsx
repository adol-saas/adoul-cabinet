import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    FolderKanban,
    BookOpen,
    Scale,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    Edit3,
    ArrowUpRight,
    ShieldCheck,
} from 'lucide-react';
import { Dossier, OfficeSetting, PaginatedData } from '@/types';

interface RegistersPageProps {
    dossiers: PaginatedData<Dossier>;
    filters: {
        register: string;
        search: string;
        year: string;
    };
    stats: {
        total_all: number;
        family_count: number;
        property_count: number;
        inheritance_count: number;
        donations_count: number;
        general_count: number;
        homologated_count: number;
        pending_qadi_count: number;
    };
    officeSetting: OfficeSetting | null;
}

export default function RegistersIndex({
    dossiers,
    filters,
    stats,
    officeSetting,
}: RegistersPageProps) {
    const dossierList: Dossier[] = Array.isArray(dossiers?.data)
        ? dossiers.data
        : (Array.isArray(dossiers) ? dossiers : []);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRegister, setSelectedRegister] = useState(filters.register || 'all');
    const [selectedYear, setSelectedYear] = useState(filters.year || String(new Date().getFullYear()));
    const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
    const [inclusionModalOpen, setInclusionModalOpen] = useState(false);

    const inclusionForm = useForm({
        inclusion_number: '',
        inclusion_book: '',
        inclusion_page: '',
        inclusion_year: String(new Date().getFullYear()),
        qadi_reference: '',
        qadi_validation_date: '',
        registration_receipt: '',
        status: 'signed',
    });

    const openInclusionModal = (d: Dossier) => {
        setSelectedDossier(d);
        const details = (d.details as Record<string, any>) || {};
        inclusionForm.setData({
            inclusion_number: details.inclusion_number || '',
            inclusion_book: details.inclusion_book || '',
            inclusion_page: details.inclusion_page || '',
            inclusion_year: details.inclusion_year || String(new Date().getFullYear()),
            qadi_reference: d.qadi_reference || details.qadi_reference || '',
            qadi_validation_date: d.qadi_validation_date || '',
            registration_receipt: details.registration_receipt || '',
            status: d.status || 'signed',
        });
        setInclusionModalOpen(true);
    };

    const submitInclusion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDossier) return;

        inclusionForm.post(`/registers/${selectedDossier.id}/inclusion`, {
            onSuccess: () => {
                setInclusionModalOpen(false);
            },
        });
    };

    const handleFilterChange = (register: string) => {
        setSelectedRegister(register);
        router.get('/registers', {
            register,
            search,
            year: selectedYear,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/registers', {
            register: selectedRegister,
            search,
            year: selectedYear,
        }, { preserveState: true });
    };

    const registerTabs = [
        { id: 'all', label: 'كافة الكنانيش', count: stats.total_all },
        { id: 'family', label: 'كناش عقود الزواج والأسرة', count: stats.family_count },
        { id: 'property', label: 'كناش الأملاك العقارية', count: stats.property_count },
        { id: 'inheritance', label: 'كناش التركات والوصايا', count: stats.inheritance_count },
        { id: 'donations', label: 'كناش التبرعات والأوقاف', count: stats.donations_count },
        { id: 'general', label: 'كناش المحررات المختلفة', count: stats.general_count },
    ];

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج شرعي',
        divorce: 'إشهاد طلاق/خلع',
        raj3a: 'رسم الرجعة',
        thobout_zawjia: 'ثبوت الزوجية',
        hadana_nafaka: 'اتفاق الحضانة والنفقة',
        nasab_iqrar: 'إقرار بالنسب',
        inheritance: 'رسم الإراثة',
        will: 'رسم وصية شرعية',
        tarakah_qisma: 'قسمة التركة',
        tarakah_ihsa: 'إحصاء التركة',
        property_sale: 'بيع عقار',
        property_promise: 'وعد بالبيع',
        mortgage: 'رسم الرهن',
        mainlevee: 'رفع اليد عن الرهن',
        donation: 'رسم الهبة',
        sadaqa: 'رسم الصدقة',
        mulkiya_lafif: 'رسم الملكية (لفيف)',
        conversion_islam: 'اعتناق الإسلام',
        poa: 'وكالة قانونية',
        debt_recognition: 'اعتراف بدين',
        certificate: 'شهادة عدلية',
        other: 'محرر عدلي عام',
    };

    return (
        <TenantAdminLayout title="سجلات التضمين ومذكرة الحفظ الإلكترونية">
            <Head title="سجلات التضمين والخطاب — فضاء التوثيق العدلي" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs">
                            <BookOpen className="h-6 w-6 text-amber-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                كناش التضمين ومحفوظات المكتب العدلي
                            </h1>
                            <p className="text-xs text-stone-500">
                                تتبع أرقام التضمين، الصحائف، الكنانيش، وتأشيرة قاضي التوثيق (القانون رقم 16.03)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-stone-500 bg-stone-50 dark:bg-stone-800/60 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300">{stats.homologated_count}</span> رسماً مخاطب عليه • <span className="font-semibold text-amber-600">{stats.pending_qadi_count}</span> قيد المخاطبة
                        </div>
                        <Link href="/dossiers/create">
                            <Button variant="emerald" size="sm" className="font-bold">
                                + رسم جديد
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Register Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
                    {registerTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleFilterChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                selectedRegister === tab.id
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-emerald-500'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                selectedRegister === tab.id ? 'bg-emerald-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="بحث برقم التضمين، المرجع، أو اسم الموكل..."
                                className="ps-8 text-xs h-9"
                            />
                        </div>
                        <Button type="submit" variant="outline" size="sm" className="h-9">
                            بحث
                        </Button>
                    </form>

                    <div className="flex items-center gap-3">
                        <Label className="text-xs text-stone-500">سنة التضمين:</Label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                router.get('/registers', { register: selectedRegister, search, year: e.target.value }, { preserveState: true });
                            }}
                            className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">كافة السنوات</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                </div>

                {/* Table of Acts in Registers */}
                <Card>
                    <CardHeader className="pb-2 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold font-tajawal">
                            قائمة القيود والمحررات المضمنة
                        </CardTitle>
                        <span className="text-xs text-stone-500">
                            عرض {dossiers.data.length} من أصل {dossiers.total} رسم
                        </span>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3 text-start">الرقم المرجعي</th>
                                    <th className="p-3 text-start">نوع الرسم والمحرر</th>
                                    <th className="p-3 text-start">أطراف العقد</th>
                                    <th className="p-3 text-start">رقم التضمين</th>
                                    <th className="p-3 text-start">الكناش والصحيفة</th>
                                    <th className="p-3 text-start">تأشيرة قاضي التوثيق</th>
                                    <th className="p-3 text-end">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {dossierList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-xs text-stone-400">
                                            لا توجد رسوم مسجلة في هذا الكناش حالياً.
                                        </td>
                                    </tr>
                                ) : (
                                    dossierList.map((d) => {
                                        const details = (d.details as Record<string, any>) || {};
                                        const hasInclusion = Boolean(details.inclusion_number);
                                        const isHomologated = Boolean(d.qadi_validation_date);

                                        return (
                                            <tr key={d.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                                <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                    {d.reference}
                                                </td>
                                                <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                                                    {actTypeLabels[d.type] || d.type}
                                                </td>
                                                <td className="p-3 text-stone-700 dark:text-stone-300">
                                                    <div>{d.client?.name || 'طرف رئيسي'}</div>
                                                    {d.client2 && (
                                                        <div className="text-[11px] text-stone-400">{d.client2.name}</div>
                                                    )}
                                                </td>
                                                <td className="p-3 font-mono">
                                                    {hasInclusion ? (
                                                        <Badge variant="emerald" className="text-[11px]">
                                                            {details.inclusion_number} / {details.inclusion_year || '2026'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] text-stone-400">
                                                            قيد الإيداع
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3 text-stone-600 dark:text-stone-300 text-[11px]">
                                                    {details.inclusion_book || details.inclusion_page ? (
                                                        <span>كناش: {details.inclusion_book || '-'} • ص: {details.inclusion_page || '-'}</span>
                                                    ) : (
                                                        <span className="text-stone-400">—</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {isHomologated ? (
                                                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>خوطب في {d.qadi_validation_date}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                                                            <Clock className="h-3 w-3" />
                                                            <span>في انتظار التأشيرة</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-end space-x-2 space-x-reverse">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openInclusionModal(d)}
                                                        className="h-7 text-[11px] px-2.5"
                                                    >
                                                        <Edit3 className="h-3 w-3 me-1" />
                                                        <span>تدوين التضمين</span>
                                                    </Button>
                                                    <Link href={`/dossiers/${d.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 text-emerald-700">
                                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal for recording inclusion data */}
            <Dialog open={inclusionModalOpen} onOpenChange={setInclusionModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-2">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-center text-base font-bold font-tajawal">
                            تدوين بيانات التضمين ومخاطبة القاضي
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs text-stone-500">
                            الرسم العدلي: {selectedDossier?.reference} — {actTypeLabels[selectedDossier?.type || ''] || selectedDossier?.type}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitInclusion} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>رقم التضمين بسجل المحكمة *</Label>
                                <Input
                                    required
                                    value={inclusionForm.data.inclusion_number}
                                    onChange={(e) => inclusionForm.setData('inclusion_number', e.target.value)}
                                    placeholder="مثال: 412"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>سنة التضمين *</Label>
                                <Input
                                    required
                                    value={inclusionForm.data.inclusion_year}
                                    onChange={(e) => inclusionForm.setData('inclusion_year', e.target.value)}
                                    placeholder="2026"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>رقم الكناش / المجلد</Label>
                                <Input
                                    value={inclusionForm.data.inclusion_book}
                                    onChange={(e) => inclusionForm.setData('inclusion_book', e.target.value)}
                                    placeholder="كناش عدد 14"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>رقم الصحيفة</Label>
                                <Input
                                    value={inclusionForm.data.inclusion_page}
                                    onChange={(e) => inclusionForm.setData('inclusion_page', e.target.value)}
                                    placeholder="صحيفة 88"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-stone-100 dark:border-stone-800 pt-3">
                            <div className="space-y-1">
                                <Label>تاريخ تأشيرة قاضي التوثيق (الخطاب)</Label>
                                <Input
                                    type="date"
                                    value={inclusionForm.data.qadi_validation_date}
                                    onChange={(e) => inclusionForm.setData('qadi_validation_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>مرجع أمر القاضي المكلف</Label>
                                <Input
                                    value={inclusionForm.data.qadi_reference}
                                    onChange={(e) => inclusionForm.setData('qadi_reference', e.target.value)}
                                    placeholder="أمر عدد 89/ت/2026"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>رقم وصل إدارة التسجيل والتمبر (كناش التصاريح)</Label>
                            <Input
                                value={inclusionForm.data.registration_receipt}
                                onChange={(e) => inclusionForm.setData('registration_receipt', e.target.value)}
                                placeholder="وصل قباضة الضرائب رقم 2026/90412"
                            />
                        </div>

                        <DialogFooter className="flex gap-2 sm:justify-between pt-2">
                            <Button type="button" variant="outline" onClick={() => setInclusionModalOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={inclusionForm.processing} className="font-bold">
                                {inclusionForm.processing ? 'جاري الحفظ...' : 'حفظ وتأكيد التضمين'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
