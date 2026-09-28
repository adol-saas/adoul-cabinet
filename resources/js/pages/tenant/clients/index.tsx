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
import { Users, Search, Plus, Eye, Phone, Mail, MapPin, CreditCard, FolderKanban, Download, Printer } from 'lucide-react';
import { Client, PaginatedData } from '@/types';

interface ClientsIndexProps {
    clients: any;
    filters?: { search?: string };
}

export default function TenantClientsIndex({ clients, filters = {} }: ClientsIndexProps) {
    const clientList: (Client & { dossiers_count?: number })[] = Array.isArray(clients?.data)
        ? clients.data
        : (Array.isArray(clients) ? clients : []);
    const totalClients = typeof clients?.total === 'number' ? clients.total : clientList.length;

    const [search, setSearch] = useState(filters.search || '');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const form = useForm({
        cin: '',
        name_ar: '',
        name_fr: '',
        name_ber: '',
        birth_date: '',
        birth_city: '',
        address: '',
        phone: '',
        email: '',
        gender: 'male',
        marital_status: 'single',
        notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/clients', { search }, { preserveState: true });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/clients', {
            onSuccess: () => {
                setCreateModalOpen(false);
                form.reset();
            },
        });
    };

    return (
        <TenantAdminLayout title="سجل المتعاقدين والأطراف">
            <Head title="المتعاقدون — فضاء التوثيق العدلي" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            سجل المتعاقدين والموكلين ({totalClients})
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            قاعدة معطيات الأطراف والموقعين على الشهادات والمحررات الرسمية
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start">
                        <a href="/exports/clients/pdf" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer border-blue-500/50 text-blue-700 dark:text-blue-400">
                                <Printer className="h-3.5 w-3.5 text-blue-600" />
                                <span>(PDF) تصدير لائحة المتعاقدين</span>
                            </Button>
                        </a>
                        <a href="/exports/clients" download>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                                <Download className="h-3.5 w-3.5 text-emerald-600" />
                                <span>(CSV) تصدير لائحة المتعاقدين</span>
                            </Button>
                        </a>
                        <Button variant="emerald" onClick={() => setCreateModalOpen(true)} className="gap-2 font-bold cursor-pointer">
                            <Plus className="h-4 w-4" />
                            <span>إضافة متعاقد جديد</span>
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث بالاسم، رقم البطاقة الوطنية (CIN)، أو رقم الهاتف..."
                                    className="ps-9 h-10 text-xs"
                                />
                            </div>
                            <Button type="submit" variant="emerald" size="sm" className="h-10 px-6 font-semibold">
                                بحث
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3.5 text-start">رقم البطاقة (CIN)</th>
                                    <th className="p-3.5 text-start">الاسم الكامل (عربي / فرنسي)</th>
                                    <th className="p-3.5 text-start">معلومات الاتصال</th>
                                    <th className="p-3.5 text-start">الحالة الاجتماعية</th>
                                    <th className="p-3.5 text-start">العقود المبرمة</th>
                                    <th className="p-3.5 text-end">الملف الشخصي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {clientList.map((client) => (
                                    <tr key={client.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                        <td className="p-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                            {client.cin}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm">
                                                {client.name_ar || client.name}
                                            </div>
                                            <div className="text-[11px] text-stone-400">
                                                {client.name_fr}
                                            </div>
                                        </td>
                                        <td className="p-3.5 space-y-0.5">
                                            {client.phone && (
                                                <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                                                    <Phone className="h-3 w-3 text-amber-600" />
                                                    <span dir="ltr">{client.phone}</span>
                                                </div>
                                            )}
                                            {client.email && (
                                                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                                                    <Mail className="h-3 w-3 text-stone-400" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <Badge variant="outline" className="text-[10px]">
                                                {client.marital_status === 'married' ? 'متزوج(ة)' : client.marital_status === 'divorced' ? 'مطلق(ة)' : client.marital_status === 'widowed' ? 'أرمل(ة)' : 'عازب(ة)'}
                                            </Badge>
                                        </td>
                                        <td className="p-3.5 font-semibold text-stone-700 dark:text-stone-300">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px]">
                                                <FolderKanban className="h-3 w-3 text-emerald-600" />
                                                <span>{client.dossiers_count || 0} عقود</span>
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-end">
                                            <Link href={`/clients/${client.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700">
                                                    <span>عرض الملف</span>
                                                    <Eye className="h-3.5 w-3.5 ms-1" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {clients?.links && clients.links.length > 3 && (
                            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center gap-1">
                                {clients.links.map((link: any, idx: number) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded text-xs transition-colors ${
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
                    </CardContent>
                </Card>
            </div>

            {/* Create Client Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">تسجيل متعاقد جديد في كناش المكتب</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>رقم البطاقة الوطنية (CIN) *</Label>
                                <Input
                                    value={form.data.cin}
                                    onChange={(e) => form.setData('cin', e.target.value.toUpperCase())}
                                    placeholder="مثال: AB123456"
                                    className="font-mono uppercase"
                                    required
                                />
                                {form.errors.cin && <p className="text-red-500 text-[11px]">{form.errors.cin}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>الجنس *</Label>
                                <select
                                    value={form.data.gender}
                                    onChange={(e) => form.setData('gender', e.target.value as any)}
                                    className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                                    required
                                >
                                    <option value="male">ذكر (Homme)</option>
                                    <option value="female">أنثى (Femme)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>الاسم الكامل بالعربية *</Label>
                                <Input
                                    value={form.data.name_ar}
                                    onChange={(e) => form.setData('name_ar', e.target.value)}
                                    placeholder="الاسم الشخصي والعائلي"
                                    required
                                />
                                {form.errors.name_ar && <p className="text-red-500 text-[11px]">{form.errors.name_ar}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>الاسم الكامل بالفرنسية (Nom Prénom) *</Label>
                                <Input
                                    value={form.data.name_fr}
                                    onChange={(e) => form.setData('name_fr', e.target.value)}
                                    placeholder="Nom & Prénom"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label>رقم الهاتف</Label>
                                <Input
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    placeholder="06XXXXXXXX"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>البريد الإلكتروني</Label>
                                <Input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="mail@domaine.ma"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>الحالة العائلية *</Label>
                                <select
                                    value={form.data.marital_status}
                                    onChange={(e) => form.setData('marital_status', e.target.value as any)}
                                    className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                                >
                                    <option value="single">عازب(ة)</option>
                                    <option value="married">متزوج(ة)</option>
                                    <option value="divorced">مطلق(ة)</option>
                                    <option value="widowed">أرمل(ة)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>تاريخ الازدياد</Label>
                                <Input
                                    type="date"
                                    value={form.data.birth_date}
                                    onChange={(e) => form.setData('birth_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>مكان الازدياد</Label>
                                <Input
                                    value={form.data.birth_city}
                                    onChange={(e) => form.setData('birth_city', e.target.value)}
                                    placeholder="الرباط، فاس..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>العنوان ومحل السكنى</Label>
                            <Input
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                placeholder="العنوان الشخصي المذكور في البطاقة الوطنية"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={form.processing}>تسجيل المتعاقد</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
