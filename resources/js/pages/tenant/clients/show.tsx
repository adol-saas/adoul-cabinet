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
import {
    Users,
    FolderKanban,
    Calendar,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Edit2,
    Trash2,
    Plus,
    Scale,
    Clock,
} from 'lucide-react';
import { Client, Dossier, Appointment } from '@/types';

interface ClientShowProps {
    client: Client & {
        dossiers?: Dossier[];
        secondaryDossiers?: Dossier[];
        appointments?: Appointment[];
    };
}

export default function TenantClientShow({ client }: ClientShowProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);

    const form = useForm({
        cin: client.cin,
        name_ar: client.name_ar,
        name_fr: client.name_fr,
        name_ber: client.name_ber || '',
        birth_date: client.birth_date || '',
        birth_city: client.birth_city || '',
        address: client.address || '',
        phone: client.phone || '',
        email: client.email || '',
        gender: client.gender || 'male',
        marital_status: client.marital_status || 'single',
        notes: client.notes || '',
    });

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/clients/${client.id}`, {
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`هل أنت متأكد من رغبتك في حذف المتعاقد [${client.name_ar}]؟ سيتم الاحتفاظ بالعقود المسجلة.`)) {
            router.delete(`/clients/${client.id}`);
        }
    };

    return (
        <TenantAdminLayout title={`ملف المتعاقد: ${client.name_ar}`}>
            <Head title={`المتعاقد: ${client.name_ar} (${client.cin}) — Adoul`} />

            <div className="space-y-6">
                {/* Header Back & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/clients">
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <ArrowRight className="h-4 w-4" />
                                <span>العودة للسجل</span>
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span>{client.name_ar}</span>
                                <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    {client.cin}
                                </span>
                            </h2>
                            <p className="text-xs text-stone-400">{client.name_fr}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/dossiers/create?client_id=${client.id}`}>
                            <Button variant="emerald" size="sm" className="gap-1.5 text-xs font-semibold">
                                <Plus className="h-4 w-4" />
                                <span>فتح ملف جديد لهذا المتعاقد</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="gap-1 text-xs">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>تعديل البيانات</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold font-tajawal">المعطيات الشخصية والهوية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                <span className="text-stone-500">رقم البطاقة (CIN):</span>
                                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{client.cin}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                <span className="text-stone-500">الجنس:</span>
                                <span>{client.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                <span className="text-stone-500">الحالة العائلية:</span>
                                <span>{client.marital_status === 'married' ? 'متزوج(ة)' : client.marital_status === 'divorced' ? 'مطلق(ة)' : client.marital_status === 'widowed' ? 'أرمل(ة)' : 'عازب(ة)'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                <span className="text-stone-500">تاريخ ومكان الازدياد:</span>
                                <span>{client.birth_date || 'غير محدد'} ({client.birth_city || 'المغرب'})</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-stone-500">العنوان:</span>
                                <span className="text-end max-w-[180px] truncate">{client.address || 'غير محدد'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold font-tajawal">الاتصال والتواصل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800">
                                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-stone-400 block">رقم الهاتف:</span>
                                    <span className="font-bold text-stone-800 dark:text-stone-200" dir="ltr">{client.phone || 'غير مسجل'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800">
                                <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-stone-400 block">البريد الإلكتروني:</span>
                                    <span className="text-stone-800 dark:text-stone-200 truncate">{client.email || 'غير مسجل'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold font-tajawal">ملاحظات وسجل المواعيد</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                            <p className="text-stone-600 dark:text-stone-400 leading-relaxed italic bg-stone-50 dark:bg-stone-800 p-2.5 rounded-lg min-h-[70px]">
                                {client.notes || 'لا توجد ملاحظات خاصة مسجلة حول هذا المتعاقد.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dossiers List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-emerald-600" />
                            <span>العقود والمحررات المقترنة بهذا المتعاقد ({client.dossiers?.length || 0})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-y border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3 text-start">المرجع</th>
                                    <th className="p-3 text-start">نوع العقد</th>
                                    <th className="p-3 text-start">الحالة الإدارية</th>
                                    <th className="p-3 text-start">تاريخ الإبرام</th>
                                    <th className="p-3 text-end">فتح الملف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {client.dossiers?.map((d) => (
                                    <tr key={d.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                        <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">{d.reference}</td>
                                        <td className="p-3 font-semibold text-stone-800 dark:text-stone-200">{d.type}</td>
                                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{d.status}</Badge></td>
                                        <td className="p-3 text-stone-500">{d.act_date || 'مسجل'}</td>
                                        <td className="p-3 text-end">
                                            <Link href={`/dossiers/${d.id}`}>
                                                <Button variant="outline" size="sm" className="h-7 text-xs text-emerald-700">فتح العقد</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">تعديل بيانات المتعاقد</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitUpdate} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>الاسم بالعربية *</Label>
                                <Input value={form.data.name_ar} onChange={(e) => form.setData('name_ar', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>الاسم بالفرنسية *</Label>
                                <Input value={form.data.name_fr} onChange={(e) => form.setData('name_fr', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>الهاتف</Label>
                                <Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} dir="ltr" />
                            </div>
                            <div className="space-y-1">
                                <Label>البريد الإلكتروني</Label>
                                <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>العنوان</Label>
                            <Input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={form.processing}>حفظ التعديلات</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
