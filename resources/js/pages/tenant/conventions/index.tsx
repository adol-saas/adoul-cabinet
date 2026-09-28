import React, { useState, useMemo, useRef } from 'react';
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
    DialogDescription,
} from '@/components/ui/dialog';
import {
    FileCheck,
    Download,
    Calendar,
    ExternalLink,
    Scale,
    Search,
    BookOpen,
    Building2,
    Landmark,
    ShieldCheck,
    FileText,
    Plus,
    Trash2,
    Eye,
    Upload,
    Check,
} from 'lucide-react';
import { Convention, PaginatedData } from '@/types';

interface ConventionsIndexProps {
    conventions: PaginatedData<Convention> | Convention[];
}

export default function TenantConventionsIndex({ conventions }: ConventionsIndexProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form for adding a new circular / convention
    const form = useForm<{
        title_ar: string;
        title_fr: string;
        reference_number: string;
        category: string;
        issued_date: string;
        description_ar: string;
        description_fr: string;
        file: File | null;
    }>({
        title_ar: '',
        title_fr: '',
        reference_number: '',
        category: 'ministry',
        issued_date: new Date().toISOString().split('T')[0],
        description_ar: '',
        description_fr: '',
        file: null,
    });

    // Handle both PaginatedData and raw Array safely
    const allItems: Convention[] = useMemo(() => {
        if (!conventions) return [];
        if (Array.isArray(conventions)) return conventions;
        if (Array.isArray(conventions.data)) return conventions.data;
        return [];
    }, [conventions]);

    const categoryMap: Record<string, { label: string; badgeClass: string; icon: any }> = {
        ministry: {
            label: 'وزارة العدل',
            badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
            icon: Scale,
        },
        ancfcc: {
            label: 'المحافظة العقارية (ANCFCC)',
            badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
            icon: Landmark,
        },
        taxes: {
            label: 'إدارة الضرائب (DGI)',
            badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
            icon: Building2,
        },
        order: {
            label: 'الهيئة الوطنية للعدول',
            badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
            icon: ShieldCheck,
        },
        judiciary: {
            label: 'رئاسة النيابة العامة',
            badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300',
            icon: FileCheck,
        },
        finance: {
            label: 'صندوق الإيداع والتدبير (CDG)',
            badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300',
            icon: BookOpen,
        },
        other: {
            label: 'جهات أخرى / شراكات',
            badgeClass: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300',
            icon: FileText,
        },
    };

    // Filter items by category and search query
    const filteredItems = useMemo(() => {
        return allItems.filter((item) => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const searchLower = search.trim().toLowerCase();
            const matchesSearch =
                !searchLower ||
                (item.title_ar && item.title_ar.toLowerCase().includes(searchLower)) ||
                (item.title_fr && item.title_fr.toLowerCase().includes(searchLower)) ||
                (item.description_ar && item.description_ar.toLowerCase().includes(searchLower)) ||
                (item.reference_number && item.reference_number.toLowerCase().includes(searchLower));

            return matchesCategory && matchesSearch;
        });
    }, [allItems, selectedCategory, search]);

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/conventions', {
            onSuccess: () => {
                setCreateModalOpen(false);
                form.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDelete = (conv: Convention) => {
        if (confirm(`هل أنت متأكد من حذف الدورية [${conv.title_ar || conv.title}]؟`)) {
            router.delete(`/conventions/${conv.id}`, {
                preserveScroll: true,
            });
        }
    };

    const openViewModal = (conv: Convention) => {
        setSelectedConvention(conv);
        setViewModalOpen(true);
    };

    const paginationLinks = (conventions as PaginatedData<Convention>)?.links;

    return (
        <TenantAdminLayout title="الدوريات والاتفاقيات الرسمية">
            <Head title="الدوريات والاتفاقيات — فضاء التوثيق العدلي" />

            <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full px-1 sm:px-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span>الدوريات والاتفاقيات الرسمية المشتركة</span>
                            <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                                {filteredItems.length} / {allItems.length}
                            </span>
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            المناشير والدوريات الصادرة عن وزارة العدل، المحافظة العقارية، الضرائب، والهيئة الوطنية للعدول
                        </p>
                    </div>

                    <Button
                        variant="emerald"
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-2 font-bold cursor-pointer shrink-0 self-start sm:self-auto text-xs sm:text-sm py-2 px-3.5"
                    >
                        <Plus className="h-4 w-4" />
                        <span>إضافة دورية أو منشور رسمي</span>
                    </Button>
                </div>

                {/* Filter & Search Bar */}
                <Card className="border-stone-200 dark:border-stone-800 shadow-2xs">
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث برقم المنشور، الموضوع، أو الجهة المصدرة..."
                                    className="ps-9 h-10 text-xs w-full"
                                />
                            </div>

                            {search && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSearch('')}
                                    className="h-10 px-4 text-xs cursor-pointer self-start sm:self-auto"
                                >
                                    إلغاء البحث
                                </Button>
                            )}
                        </div>

                        {/* Category Quick Filter Pills (Smooth Mobile Horizontal Scroll) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth w-full touch-pan-x">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                                    selectedCategory === 'all'
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                }`}
                            >
                                كافة الدوريات ({allItems.length})
                            </button>

                            {Object.entries(categoryMap).map(([key, cat]) => {
                                const count = allItems.filter((i) => i.category === key).length;
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedCategory(key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                                            selectedCategory === key
                                                ? 'bg-emerald-700 text-white shadow-xs'
                                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{cat.label}</span>
                                        <span className="opacity-70 text-[10px]">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Grid of Circulars / Conventions */}
                {filteredItems.length === 0 ? (
                    <Card className="border-dashed border-stone-300 dark:border-stone-700 p-8 sm:p-12 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                            <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base font-tajawal">
                                لا توجد مناشير أو دوريات مطابقة للبحث
                            </h3>
                            <p className="text-xs text-stone-500">
                                جرب تغيير كلمة البحث أو الضغط على «كافة الدوريات» لعرض جميع المناشير الرسمية، أو أضف دورية جديدة الآن.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedCategory('all');
                                    }}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    استعادة العرض الافتراضي
                                </Button>
                                <Button
                                    variant="emerald"
                                    size="sm"
                                    onClick={() => setCreateModalOpen(true)}
                                    className="text-xs font-semibold cursor-pointer gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>إضافة دورية جديدة</span>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {filteredItems.map((conv) => {
                            const cat = categoryMap[conv.category] || {
                                label: conv.category || 'دورية رسمية',
                                badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
                                icon: FileText,
                            };
                            const Icon = cat.icon;

                            return (
                                <Card
                                    key={conv.id}
                                    className="flex flex-col justify-between hover:border-emerald-600 transition-all border-stone-200 dark:border-stone-800 shadow-xs group"
                                >
                                    <CardHeader className="p-4 sm:p-5 pb-3">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span
                                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 border ${cat.badgeClass}`}
                                            >
                                                <Icon className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{cat.label}</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-stone-400 font-mono font-medium truncate max-w-[120px]">
                                                    {conv.reference_number || 'منشور رسمي'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(conv)}
                                                    className="text-stone-300 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                                    title="حذف الدورية"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <CardTitle
                                            onClick={() => openViewModal(conv)}
                                            className="text-sm sm:text-base font-bold font-tajawal leading-snug text-stone-900 dark:text-stone-100 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                                        >
                                            {conv.title_ar || conv.title}
                                        </CardTitle>

                                        {conv.title_fr && (
                                            <p className="text-[11px] text-stone-400 mt-1 font-sans italic truncate" dir="ltr">
                                                {conv.title_fr}
                                            </p>
                                        )}

                                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5 line-clamp-3 leading-relaxed">
                                            {conv.description_ar || conv.description}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50 px-4 py-2.5">
                                        <span className="text-[11px] text-stone-400 flex items-center gap-1.5 font-medium">
                                            <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                            <span>
                                                {conv.issued_date ? new Date(conv.issued_date).toLocaleDateString('ar-MA') : '2026'}
                                            </span>
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openViewModal(conv)}
                                                className="inline-flex items-center gap-1 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-700 font-semibold cursor-pointer"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>تفاصيل</span>
                                            </button>
                                            <a
                                                href={conv.file_path || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
                                            >
                                                <span>(PDF) تحميل</span>
                                                <Download className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {paginationLinks && paginationLinks.length > 3 && (
                    <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center gap-1 overflow-x-auto">
                        {paginationLinks.map((link: any, idx: number) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveState
                                className={`px-3 py-1 rounded text-xs transition-colors shrink-0 ${
                                    link.active
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : link.url
                                        ? 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                                        : 'text-stone-300 dark:text-stone-600 cursor-not-allowed pointer-events-none'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Convention Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base sm:text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            <span>إضافة دورية أو منشور رسمي جديد</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500">
                            تسجيل منشور رسمي صادر وتعميمه على مسؤولي وكتاب المكتب مع إمكانية إرفاق ملف PDF الأصلي.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-3.5 text-xs">
                        <div className="space-y-1">
                            <Label>عنوان الدورية / المنشور بالعربية *</Label>
                            <Input
                                value={form.data.title_ar}
                                onChange={(e) => form.setData('title_ar', e.target.value)}
                                placeholder="مثال: دورية المحافظة العقارية بشأن تقييد الرسوم والبيوع..."
                                required
                            />
                            {form.errors.title_ar && <p className="text-red-500 text-[11px]">{form.errors.title_ar}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label>العنوان بالفرنسية (اختياري)</Label>
                            <Input
                                value={form.data.title_fr}
                                onChange={(e) => form.setData('title_fr', e.target.value)}
                                placeholder="Circulaire relative à l'enregistrement des actes..."
                                dir="ltr"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>الجهة المصدرة / الصنف *</Label>
                                <select
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                >
                                    <option value="ministry">وزارة العدل</option>
                                    <option value="ancfcc">المحافظة العقارية (ANCFCC)</option>
                                    <option value="taxes">إدارة الضرائب (DGI)</option>
                                    <option value="order">الهيئة الوطنية للعدول</option>
                                    <option value="judiciary">رئاسة النيابة العامة</option>
                                    <option value="finance">صندوق الإيداع والتدبير (CDG)</option>
                                    <option value="other">جهة حكومية أو قضائية أخرى</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label>رقم المرجع / المنشور</Label>
                                <Input
                                    value={form.data.reference_number}
                                    onChange={(e) => form.setData('reference_number', e.target.value)}
                                    placeholder="مثال: منشور 2026/18"
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>تاريخ الصدور</Label>
                            <Input
                                type="date"
                                value={form.data.issued_date}
                                onChange={(e) => form.setData('issued_date', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>موجز المقتضيات والتعليمات التوثيقية</Label>
                            <textarea
                                value={form.data.description_ar}
                                onChange={(e) => form.setData('description_ar', e.target.value)}
                                rows={3}
                                placeholder="اكتب ملخصاً لمضمون المنشور والمساطر الإلزامية المطلوبة..."
                                className="w-full p-2.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs leading-relaxed"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>إرفاق ملف الدورية الرسمي (PDF)</Label>
                            <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-3 text-center bg-stone-50/50 dark:bg-stone-900/50">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        form.setData('file', file);
                                    }}
                                    className="hidden"
                                    id="convention_file_upload"
                                />
                                <label
                                    htmlFor="convention_file_upload"
                                    className="cursor-pointer flex flex-col items-center gap-1.5 text-stone-600 dark:text-stone-300"
                                >
                                    <Upload className="h-5 w-5 text-emerald-600" />
                                    <span className="text-xs font-semibold">
                                        {form.data.file ? form.data.file.name : 'انقر لاختيار ملف المنشور بصيغة PDF'}
                                    </span>
                                    <span className="text-[10px] text-stone-400">الحد الأقصى للحجم 20 ميغابايت</span>
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="w-full sm:w-auto">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={form.processing} className="w-full sm:w-auto">
                                {form.processing ? 'جاري الحفظ...' : 'نشر وتوثيق الدورية'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Convention Details Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                {selectedConvention && (
                    <DialogContent className="max-w-lg w-[95vw] sm:w-full">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="emerald" className="text-[10px]">
                                    {categoryMap[selectedConvention.category]?.label || selectedConvention.category}
                                </Badge>
                                <span className="font-mono text-[11px] text-stone-400">
                                    {selectedConvention.reference_number || 'منشور رسمي'}
                                </span>
                            </div>
                            <DialogTitle className="font-tajawal text-base sm:text-lg leading-snug">
                                {selectedConvention.title_ar || selectedConvention.title}
                            </DialogTitle>
                            {selectedConvention.title_fr && (
                                <DialogDescription className="text-xs text-stone-400 italic font-sans" dir="ltr">
                                    {selectedConvention.title_fr}
                                </DialogDescription>
                            )}
                        </DialogHeader>

                        <div className="space-y-4 text-xs my-2">
                            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                                <div className="text-[11px] text-stone-400 font-semibold">تاريخ الصدور الرسمي:</div>
                                <div className="font-medium text-stone-800 dark:text-stone-200">
                                    {selectedConvention.issued_date ? new Date(selectedConvention.issued_date).toLocaleDateString('ar-MA') : 'غير محدد'}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-stone-700 dark:text-stone-300">مضمون الدورية والمقتضيات:</div>
                                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line p-3 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 max-h-60 overflow-y-auto">
                                    {selectedConvention.description_ar || selectedConvention.description || 'لا يوجد نص وصفي مرفق مع هذه الدورية.'}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => setViewModalOpen(false)} className="w-full sm:w-auto">
                                إغلاق
                            </Button>
                            <a
                                href={selectedConvention.file_path || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button variant="emerald" className="w-full sm:w-auto gap-2">
                                    <Download className="h-4 w-4" />
                                    <span>تحميل النسخة الكاملة (PDF)</span>
                                </Button>
                            </a>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </TenantAdminLayout>
    );
}
