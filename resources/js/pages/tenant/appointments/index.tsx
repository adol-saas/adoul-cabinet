import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
import { Calendar, Plus, Clock, User, Phone, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Appointment, Client, Dossier, PaginatedData } from '@/types';

interface AppointmentsIndexProps {
    appointments: PaginatedData<Appointment>;
    clients: Client[];
    dossiers: Dossier[];
    currentStatus?: string;
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
    };
}

export default function TenantAppointmentsIndex({
    appointments,
    clients = [],
    dossiers = [],
    currentStatus = 'all',
    stats,
}: AppointmentsIndexProps) {
    const clientList: Client[] = Array.isArray(clients)
        ? clients
        : (clients && Array.isArray((clients as any).data) ? (clients as any).data : []);

    const [createModalOpen, setCreateModalOpen] = useState(false);

    const form = useForm({
        client_id: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        dossier_id: '',
        type: 'marriage',
        scheduled_at: '',
        duration_minutes: 30,
        notes: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/appointments', {
            onSuccess: () => {
                setCreateModalOpen(false);
                form.reset();
            },
        });
    };

    const updateStatus = (id: number, newStatus: string) => {
        router.put(`/appointments/${id}/status`, { status: newStatus });
    };

    const handleDelete = (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
            router.delete(`/appointments/${id}`);
        }
    };

    const statusBadges: Record<string, { label: string; variant: 'emerald' | 'destructive' | 'outline' | 'gold' }> = {
        pending: { label: 'طلب مواطن معلق', variant: 'destructive' },
        confirmed: { label: 'مؤكد ومبرمج', variant: 'emerald' },
        completed: { label: 'تم الحضور والإنجاز', variant: 'outline' },
        cancelled: { label: 'ملغى', variant: 'destructive' },
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج',
        divorce: 'طلاق ورجعة',
        property_sale: 'معاملة عقارية',
        inheritance: 'إراثة وتركات',
        poa: 'وكالة رسمية',
        will: 'وصية شرعية',
        consultation: 'استشارة',
        copy_extract: 'طلب نظير / نسخة رسمية (MRE)',
    };

    return (
        <TenantAdminLayout title="أجندة المواعيد والاستقبالات">
            <Head title="أجندة المواعيد — فضاء التوثيق العدلي" />

            <div className="space-y-6">
                {/* Header & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            أجندة مواعيد المكتب ({appointments.total || appointments.data?.length || 0})
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            تنظيم استقبال المتعاقدين وتلقي الإشهادات ومتابعة طلبات البوابة الإلكترونية
                        </p>
                    </div>

                    <Button variant="emerald" onClick={() => setCreateModalOpen(true)} className="gap-2 self-start font-bold">
                        <Plus className="h-4 w-4" />
                        <span>برمجة موعد جديد</span>
                    </Button>
                </div>

                {/* Status Filter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                        type="button"
                        onClick={() => router.get('/appointments', { status: 'all' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            currentStatus === 'all' || !currentStatus ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-xs text-stone-500 block">كافة المواعيد</span>
                        <span className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">{stats?.total || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/appointments', { status: 'pending' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            currentStatus === 'pending' ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-xs text-stone-500 block">طلبات قيد التأكيد</span>
                        <span className="text-xl font-bold font-tajawal text-red-600">{stats?.pending || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/appointments', { status: 'confirmed' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            currentStatus === 'confirmed' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-xs text-stone-500 block">مواعيد مؤكدة</span>
                        <span className="text-xl font-bold font-tajawal text-emerald-600">{stats?.confirmed || 0}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.get('/appointments', { status: 'completed' })}
                        className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                            currentStatus === 'completed' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' : 'border-stone-200 dark:border-stone-800'
                        }`}
                    >
                        <span className="text-xs text-stone-500 block">منجزة</span>
                        <span className="text-xl font-bold font-tajawal text-blue-600">{stats?.completed || 0}</span>
                    </button>
                </div>

                {/* Appointments List */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="p-3.5 text-start">التاريخ والتوقيت</th>
                                    <th className="p-3.5 text-start">المتعاقد / المعني بالأمر</th>
                                    <th className="p-3.5 text-start">نوع العقد / الجلسة</th>
                                    <th className="p-3.5 text-start">حالة الموعد</th>
                                    <th className="p-3.5 text-start">ملاحظات</th>
                                    <th className="p-3.5 text-end">تغيير الحالة والإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {appointments.data?.map((appt) => {
                                    const st = statusBadges[appt.status] || { label: appt.status, variant: 'outline' };
                                    const apptDate = new Date(appt.scheduled_at);
                                    return (
                                        <tr key={appt.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                            <td className="p-3.5 font-medium">
                                                <div className="font-bold text-stone-900 dark:text-stone-100">
                                                    {apptDate.toLocaleDateString('ar-MA')}
                                                </div>
                                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{apptDate.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })} ({appt.duration_minutes} دقيقة)</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-bold text-stone-900 dark:text-stone-100 font-tajawal">
                                                    {appt.client?.name_ar || appt.client_name}
                                                </div>
                                                <div className="text-[11px] text-stone-400" dir="ltr">
                                                    {appt.client?.phone || appt.client_phone}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {actTypeLabels[appt.type] || appt.type}
                                                </Badge>
                                                {appt.dossier && (
                                                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                                                        {appt.dossier.reference}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                                            </td>
                                            <td className="p-3.5 text-stone-500 max-w-[200px] truncate">
                                                {appt.notes || '—'}
                                            </td>
                                            <td className="p-3.5 text-end space-x-1.5 space-x-reverse">
                                                {appt.status === 'pending' && (
                                                    <Button
                                                        variant="emerald"
                                                        size="sm"
                                                        onClick={() => updateStatus(appt.id, 'confirmed')}
                                                        className="h-7 text-[10px] px-2 font-bold"
                                                    >
                                                        تأكيد الموعد
                                                    </Button>
                                                )}
                                                {appt.status === 'confirmed' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateStatus(appt.id, 'completed')}
                                                        className="h-7 text-[10px] px-2"
                                                    >
                                                        تم الحضور
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(appt.id)}
                                                    className="h-7 p-1 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Appointment Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">برمجة موعد أو استقبال جديد</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <Label>ربط بمتعاقد مسجل مسبقاً (اختياري)</Label>
                            <select
                                value={form.data.client_id}
                                onChange={(e) => {
                                    const cId = e.target.value;
                                    form.setData('client_id', cId);
                                    if (cId) {
                                        const found = clients.find((c) => String(c.id) === String(cId));
                                        if (found) {
                                            form.setData((prev) => ({
                                                ...prev,
                                                client_id: cId,
                                                client_name: found.name_ar || found.name || '',
                                                client_phone: found.phone || '',
                                            }));
                                        }
                                    }
                                }}
                                className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                            >
                                <option value="">-- أو إدخال اسم يدوي أدناه --</option>
                                {clientList.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name_ar} ({c.cin})</option>
                                ))}
                            </select>
                        </div>

                        {!form.data.client_id && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>اسم المتعاقد *</Label>
                                    <Input
                                        value={form.data.client_name}
                                        onChange={(e) => form.setData('client_name', e.target.value)}
                                        placeholder="الاسم الكامل"
                                        required={!form.data.client_id}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>رقم الهاتف *</Label>
                                    <Input
                                        value={form.data.client_phone}
                                        onChange={(e) => form.setData('client_phone', e.target.value)}
                                        placeholder="06XXXXXXXX"
                                        dir="ltr"
                                        required={!form.data.client_id}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>نوع العقد / المقابلة *</Label>
                                <select
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                                >
                                    <option value="marriage">عقد زواج</option>
                                    <option value="property_sale">معاملة عقارية</option>
                                    <option value="poa">وكالة رسمية</option>
                                    <option value="will">إراثة أو وصية</option>
                                    <option value="consultation">استشارة وتوثيق</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label>المدة التقديرية (دقيقة)</Label>
                                <Input
                                    type="number"
                                    min={15}
                                    max={180}
                                    value={form.data.duration_minutes}
                                    onChange={(e) => form.setData('duration_minutes', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>تاريخ وتوقيت الموعد *</Label>
                            <Input
                                type="datetime-local"
                                value={form.data.scheduled_at}
                                onChange={(e) => form.setData('scheduled_at', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>ملاحظات إضافية</Label>
                            <Input
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                placeholder="وثائق مطلوبة أو تفاصيل الحضور"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
                            <Button type="submit" variant="emerald" disabled={form.processing}>تأكيد وحفظ الموعد</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
