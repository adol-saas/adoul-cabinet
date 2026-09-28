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
    DialogDescription,
} from '@/components/ui/dialog';
import {
    UserCheck,
    Plus,
    Trash2,
    Mail,
    Phone,
    ShieldCheck,
    Users,
    Lock,
    Unlock,
    Check,
    FolderKanban,
    Calendar,
    DollarSign,
    Settings,
    UserPlus,
    KeyRound,
    Pencil,
    Eye,
    EyeOff,
    AlertTriangle,
} from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    phone?: string;
    job_title?: string;
    role: string;
    permissions?: string[];
    is_active: boolean;
    created_at: string;
}

interface TeamIndexProps {
    members: any;
    roles?: { id: number; name: string }[];
    maxUsers?: number;
    currentUsersCount?: number;
}

export default function TenantTeamIndex({
    members = [],
    roles = [],
    maxUsers = 1,
    currentUsersCount = 1,
}: TeamIndexProps) {
    const memberList: TeamMember[] = Array.isArray(members)
        ? members
        : (members && Array.isArray(members.data) ? members.data : []);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        job_title: '',
        role: 'katib',
        password: '',
        can_manage_clients: true,
        can_manage_appointments: true,
        can_draft_dossiers: true,
        can_view_financials: false,
        can_edit_settings: false,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        job_title: '',
        role: 'katib',
        is_active: true,
        can_manage_clients: true,
        can_manage_appointments: true,
        can_draft_dossiers: true,
        can_view_financials: false,
        can_edit_settings: false,
    });

    // Password Form
    const passwordForm = useForm({
        password: '',
    });

    const handleCreateRoleChange = (role: string) => {
        createForm.setData((prev) => ({
            ...prev,
            role,
            job_title: role === 'katib' ? 'كاتب(ة) التوثيق وإعداد المحاضر' : role === 'adoul' ? 'عدل موثق شريك' : 'أمين الأرشيف والحفظ',
            can_manage_clients: true,
            can_manage_appointments: true,
            can_draft_dossiers: role !== 'muhafidh',
            can_view_financials: role === 'adoul',
            can_edit_settings: role === 'adoul',
        }));
    };

    const handleEditRoleChange = (role: string) => {
        editForm.setData((prev) => ({
            ...prev,
            role,
            can_manage_clients: true,
            can_manage_appointments: true,
            can_draft_dossiers: role !== 'muhafidh',
            can_view_financials: role === 'adoul',
            can_edit_settings: role === 'adoul',
        }));
    };

    const openEditModal = (member: TeamMember) => {
        setSelectedUser(member);
        const perms = member.permissions || [];
        editForm.setData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            job_title: member.job_title || '',
            role: member.role,
            is_active: member.is_active,
            can_manage_clients: perms.includes('clients.view') || member.role === 'owner',
            can_manage_appointments: perms.includes('appointments.manage') || member.role === 'owner',
            can_draft_dossiers: perms.includes('dossiers.view') || member.role === 'owner',
            can_view_financials: perms.includes('reports.view') || member.role === 'owner' || member.role === 'adoul',
            can_edit_settings: perms.includes('team.manage') || member.role === 'owner',
        });
        setEditModalOpen(true);
    };

    const openPasswordModal = (member: TeamMember) => {
        setSelectedUser(member);
        passwordForm.reset();
        setShowPassword(false);
        setPasswordModalOpen(true);
    };

    const openDeleteModal = (member: TeamMember) => {
        setSelectedUser(member);
        setDeleteModalOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/team', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(`/team/${selectedUser.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        passwordForm.put(`/team/${selectedUser.id}/password`, {
            onSuccess: () => {
                setPasswordModalOpen(false);
                passwordForm.reset();
                setSelectedUser(null);
            },
        });
    };

    const confirmDelete = () => {
        if (!selectedUser) return;
        router.delete(`/team/${selectedUser.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const roleLabels: Record<string, { label: string; badge: string }> = {
        owner: { label: 'العدل صاحب المكتب الرئيسي', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
        adoul: { label: 'عدل موثق شريك بالإشهاد', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
        katib: { label: 'كاتب(ة) المكتب وسكرتارية التوثيق', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        muhafidh: { label: 'أمين الأرشيف وسجلات الحفظ', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    };

    const isLimitReached = maxUsers > 0 && currentUsersCount >= maxUsers;

    return (
        <TenantAdminLayout title="إدارة فريق عمل المكتب">
            <Head title="فريق العمل وكتابة المكتب — Adoul" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            هيئة التوثيق وكتابة المكتب ({currentUsersCount} / {maxUsers === 999 ? 'غير محدود' : maxUsers})
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            تعيين وإدارة كتاب وسكرتارية المكتب، تعديل الصلاحيات وتغيير كلمات المرور وحجب الأتعاب
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="emerald"
                            onClick={() => {
                                handleCreateRoleChange('katib');
                                setCreateModalOpen(true);
                            }}
                            disabled={isLimitReached}
                            className="gap-2 self-start font-bold text-xs cursor-pointer shadow-xs"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>إضافة كاتب(ة) جديد بالمكتب</span>
                        </Button>
                    </div>
                </div>

                {isLimitReached && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
                        <span>لقد بلغت الحد الأقصى لعدد المستخدمين المتاح في باقتك الحالية ({maxUsers} مستخدمين).</span>
                        <Link href="/settings" className="font-bold underline ms-2">ترقية الباقة</Link>
                    </div>
                )}

                {/* Team Members Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {memberList.map((member) => {
                        const rInfo = roleLabels[member.role] || { label: member.role, badge: 'bg-stone-200 text-stone-700' };
                        const isOwner = member.role === 'owner';
                        const perms = member.permissions || [];
                        const canViewMoney = isOwner || member.role === 'adoul' || perms.includes('reports.view');

                        return (
                            <Card key={member.id} className="flex flex-col justify-between hover:border-emerald-600 transition-all border-stone-200 dark:border-stone-800 shadow-xs">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold font-tajawal text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                                <span>{member.name}</span>
                                                {isOwner && (
                                                    <span title="صاحب المكتب الرئيسي" className="text-amber-500">
                                                        <ShieldCheck className="h-4 w-4 inline" />
                                                    </span>
                                                )}
                                            </CardTitle>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block mt-1 ${rInfo.badge}`}>
                                                {rInfo.label}
                                            </span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                            {member.name.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                        {member.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                                <span dir="ltr">{member.phone}</span>
                                            </div>
                                        )}
                                        {member.job_title && (
                                            <div className="text-[11px] text-stone-500 font-medium">
                                                المهمة: {member.job_title}
                                            </div>
                                        )}
                                    </div>

                                    {/* Granular Capabilities Pills */}
                                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
                                        <span className="text-[10px] font-semibold text-stone-400 block">الصلاحيات الممنوحة:</span>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                <FolderKanban className="h-3 w-3 text-emerald-600" />
                                                إدخال الأطراف والملفات
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                <Calendar className="h-3 w-3 text-blue-600" />
                                                المواعيد والاستقبال
                                            </span>
                                            {canViewMoney ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                                                    <DollarSign className="h-3 w-3" />
                                                    الاطلاع على الأتعاب
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                    <Lock className="h-3 w-3" />
                                                    الأتعاب محجوبة
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Action Buttons Toolbar */}
                                <CardContent className="pt-2 pb-3 px-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                                        <span>انضم في: {member.created_at}</span>
                                        {isOwner ? (
                                            <span className="text-amber-600 font-semibold flex items-center gap-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                حساب المالك الرئيسي
                                            </span>
                                        ) : (
                                            <span className="text-emerald-600 font-medium">عضو نشط بالمكتب</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-1">
                                        {/* Change Password Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openPasswordModal(member)}
                                            className="h-8 text-[11px] gap-1 px-2.5 flex-1 font-semibold border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                                            title="تغيير كلمة المرور"
                                        >
                                            <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                                            <span>كلمة المرور</span>
                                        </Button>

                                        {/* Edit Details Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(member)}
                                            className="h-8 text-[11px] gap-1 px-2.5 flex-1 font-semibold border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                                            title="تعديل البيانات والصلاحيات"
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-blue-600" />
                                            <span>تعديل</span>
                                        </Button>

                                        {/* Delete Button (Only for Non-Owner) */}
                                        {!isOwner && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteModal(member)}
                                                className="h-8 px-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 cursor-pointer"
                                                title="حذف العضو"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 1. Modal: Create Team Member / Secretary                      */}
                {/* ───────────────────────────────────────────────────────────── */}
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-emerald-700" />
                                <span>إضافة عضو جديد / كاتب(ة) للمكتب</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-500">
                                قم بإدخال بيانات المستخدم وتحديد صلاحياته المهنية داخل منظومة المكتب.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitCreate} className="space-y-4 text-xs mt-2">
                            <div className="space-y-1.5">
                                <Label>الصفة والدور الوظيفي بالمكتب *</Label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => handleCreateRoleChange(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold"
                                >
                                    <option value="katib">كاتب(ة) المكتب وسكرتارية التوثيق (الافتراضي)</option>
                                    <option value="adoul">عدل موثق شريك بالإشهاد (صلاحيات كاملة + أتعاب)</option>
                                    <option value="muhafidh">أمين الأرشيف وسجلات الحفظ</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>الاسم الكامل *</Label>
                                    <Input
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="مثال: ذ. فلان الفلاني"
                                        className="h-9 text-xs"
                                        required
                                    />
                                    {createForm.errors.name && <p className="text-[10px] text-red-600">{createForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>المهمة الرسمية بالمكتب</Label>
                                    <Input
                                        value={createForm.data.job_title}
                                        onChange={(e) => createForm.setData('job_title', e.target.value)}
                                        placeholder="كاتب توثيق / سكرتير"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>البريد الإلكتروني للدخول *</Label>
                                    <Input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="staff@adoul.ma"
                                        className="h-9 text-xs"
                                        required
                                    />
                                    {createForm.errors.email && <p className="text-[10px] text-red-600">{createForm.errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="0600000000"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>كلمة المرور الأولية للحساب *</Label>
                                <Input
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="8 أحرف أو أرقام على الأقل"
                                    className="h-9 text-xs"
                                    required
                                />
                                {createForm.errors.password && <p className="text-[10px] text-red-600">{createForm.errors.password}</p>}
                            </div>

                            {/* Granular Capabilities */}
                            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 space-y-2.5">
                                <span className="font-bold text-[11px] text-stone-700 dark:text-stone-300 block">
                                    تخصيص الصلاحيات المهنية للعضو:
                                </span>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.can_manage_clients}
                                        onChange={(e) => createForm.setData('can_manage_clients', e.target.checked)}
                                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>تسجيل بيانات الموكلين والأطراف (بطاقة التعريف، العنوان)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.can_manage_appointments}
                                        onChange={(e) => createForm.setData('can_manage_appointments', e.target.checked)}
                                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>تدبير جدول المواعيد واستقبال المواطنين</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.can_draft_dossiers}
                                        onChange={(e) => createForm.setData('can_draft_dossiers', e.target.checked)}
                                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>تحضير وتعبئة مسودات العقود (دون إمكانية الختم النهائي)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.can_view_financials}
                                        onChange={(e) => createForm.setData('can_view_financials', e.target.checked)}
                                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="font-semibold text-amber-800 dark:text-amber-300">
                                        الاطلاع على أتعاب العقود والإحصائيات المالية (افتراضياً: محجوبة)
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.can_edit_settings}
                                        onChange={(e) => createForm.setData('can_edit_settings', e.target.checked)}
                                        className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                                    />
                                    <span>تعديل إعدادات المكتب والاشتراك</span>
                                </label>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="cursor-pointer"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    className="font-bold cursor-pointer"
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing ? 'جاري الإضافة...' : 'إنشاء الحساب وحفظ الصلاحيات'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 2. Modal: Edit Team Member Info & Permissions                */}
                {/* ───────────────────────────────────────────────────────────── */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                <Pencil className="h-5 w-5 text-blue-600" />
                                <span>تعديل بيانات العضو: {selectedUser?.name}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-500">
                                يمكنك تحديث معلومات الاتصال والصلاحيات الممنوحة لهذا الحساب.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitEdit} className="space-y-4 text-xs mt-2">
                            {selectedUser?.role !== 'owner' && (
                                <div className="space-y-1.5">
                                    <Label>الصفة والدور الوظيفي بالمكتب</Label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => handleEditRoleChange(e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold"
                                    >
                                        <option value="katib">كاتب(ة) المكتب وسكرتارية التوثيق</option>
                                        <option value="adoul">عدل موثق شريك بالإشهاد</option>
                                        <option value="muhafidh">أمين الأرشيف وسجلات الحفظ</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>الاسم الكامل *</Label>
                                    <Input
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                    {editForm.errors.name && <p className="text-[10px] text-red-600">{editForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>المهمة الرسمية بالمكتب</Label>
                                    <Input
                                        value={editForm.data.job_title}
                                        onChange={(e) => editForm.setData('job_title', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>البريد الإلكتروني *</Label>
                                    <Input
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                    {editForm.errors.email && <p className="text-[10px] text-red-600">{editForm.errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {selectedUser?.role !== 'owner' && (
                                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 space-y-2.5">
                                    <span className="font-bold text-[11px] text-stone-700 dark:text-stone-300 block">
                                        تعديل الصلاحيات الممنوحة:
                                    </span>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.can_manage_clients}
                                            onChange={(e) => editForm.setData('can_manage_clients', e.target.checked)}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>تسجيل بيانات الموكلين والأطراف</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.can_manage_appointments}
                                            onChange={(e) => editForm.setData('can_manage_appointments', e.target.checked)}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>تدبير جدول المواعيد والاستقبال</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.can_draft_dossiers}
                                            onChange={(e) => editForm.setData('can_draft_dossiers', e.target.checked)}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>تحضير وتعبئة مسودات العقود</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.can_view_financials}
                                            onChange={(e) => editForm.setData('can_view_financials', e.target.checked)}
                                            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="font-semibold text-amber-800 dark:text-amber-300">
                                            الاطلاع على أتعاب العقود والتقارير المالية
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.can_edit_settings}
                                            onChange={(e) => editForm.setData('can_edit_settings', e.target.checked)}
                                            className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                                        />
                                        <span>تعديل إعدادات المكتب</span>
                                    </label>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditModalOpen(false)}
                                    className="cursor-pointer"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    className="font-bold cursor-pointer"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 3. Modal: Change / Reset Password                            */}
                {/* ───────────────────────────────────────────────────────────── */}
                <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-amber-600" />
                                <span>تغيير كلمة المرور: {selectedUser?.name}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-500">
                                تعيين كلمة مرور جديدة لهذا الحساب ({selectedUser?.email}).
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitPassword} className="space-y-4 text-xs mt-2">
                            <div className="space-y-1.5">
                                <Label>كلمة المرور الجديدة *</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="8 أحرف أو أرقام على الأقل"
                                        className="h-10 text-xs pe-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute end-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                                        title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.password && (
                                    <p className="text-[10px] text-red-600 font-semibold">{passwordForm.errors.password}</p>
                                )}
                                <p className="text-[10px] text-stone-400">
                                    ملاحظة: سيتمكن المستخدم من تسجيل الدخول بكلمة المرور الجديدة فور حفظها.
                                </p>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPasswordModalOpen(false)}
                                    className="cursor-pointer"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    className="font-bold cursor-pointer"
                                    disabled={passwordForm.processing}
                                >
                                    {passwordForm.processing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* 4. Modal: Delete Member Confirmation                         */}
                {/* ───────────────────────────────────────────────────────────── */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-bold font-tajawal text-red-600">
                                        تأكيد حذف العضو من المكتب
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-stone-500 mt-0.5">
                                        إجراء لا يمكن التراجع عنه.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="py-2 text-xs text-stone-700 dark:text-stone-300">
                            هل أنت متأكد من رغبتك في حذف حساب العضو{' '}
                            <strong className="text-stone-900 dark:text-white font-bold">[{selectedUser?.name}]</strong> ({selectedUser?.email})؟
                            <p className="mt-2 text-stone-500 text-[11px]">
                                سيتم إيقاف دخوله إلى المنظومة فوراً وحذف صلاحياته من هيئة كتابة وتوثيق المكتب.
                            </p>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteModalOpen(false)}
                                className="cursor-pointer"
                            >
                                تراجع
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDelete}
                                className="font-bold cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                            >
                                نعم، حذف العضو
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TenantAdminLayout>
    );
}
