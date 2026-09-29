import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    FileSignature,
    Camera,
    Trash2,
    Save,
    CheckCircle2,
    Calendar,
    KeyRound,
    Briefcase,
    CreditCard,
    Award,
    Activity,
    FolderKanban,
    Eye,
    EyeOff,
    Upload,
    Stamp,
    Clock,
    FileText,
} from 'lucide-react';

interface ProfileData {
    id: number;
    name: string;
    email: string;
    phone: string;
    cin: string;
    job_title: string;
    license_number: string;
    bio: string;
    avatar_path: string | null;
    signature_path: string | null;
    is_active: boolean;
    roles: string[];
    permissions: string[];
    created_at: string;
}

interface UserLog {
    id: number;
    action: string;
    note: string;
    dossier_reference: string | null;
    dossier_id: number | null;
    created_at: string;
    date_formatted: string;
}

interface ProfilePageProps {
    profile: ProfileData;
    stats: {
        dossiers_count: number;
        recent_logs_count: number;
    };
    recentLogs: UserLog[];
    office: any;
}

export default function ProfileIndex({ profile, stats, recentLogs = [], office }: ProfilePageProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'signature' | 'security' | 'activity'>('info');

    // Show/hide passwords toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile info form
    const infoForm = useForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        cin: profile.cin || '',
        job_title: profile.job_title || '',
        license_number: profile.license_number || '',
        bio: profile.bio || '',
        avatar: null as File | null,
        signature: null as File | null,
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // File input refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // Image previews
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_path);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(profile.signature_path);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            infoForm.setData('avatar', file);
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            infoForm.setData('signature', file);
            const reader = new FileReader();
            reader.onload = () => setSignaturePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submitProfileInfo = (e: React.FormEvent) => {
        e.preventDefault();
        infoForm.post('/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const submitPasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const deleteAvatar = () => {
        if (confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) {
            router.delete('/profile/avatar', {
                preserveScroll: true,
                onSuccess: () => setAvatarPreview(null),
            });
        }
    };

    const deleteSignature = () => {
        if (confirm('هل أنت متأكد من حذف نموذج التوقيع؟')) {
            router.delete('/profile/signature', {
                preserveScroll: true,
                onSuccess: () => setSignaturePreview(null),
            });
        }
    };

    const roleName = profile.roles[0] || 'adoul';
    const roleLabels: Record<string, { label: string; color: string }> = {
        owner: { label: 'عدل رئيس المكتب (المالك)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
        adoul: { label: 'عدل موثق محلف', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        katib: { label: 'كاتب(ة) المكتب', color: 'bg-blue-100 text-blue-800 border-blue-300' },
        muhafidh: { label: 'أمين الأرشيف والتوثيق', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    };

    return (
        <TenantAdminLayout title="إدارة الملف الشخصي والحساب">
            <Head title="الملف الشخصي والحساب — مكتب التوثيق العدلي" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Profile Hero Header Card */}
                <Card className="overflow-hidden border-2 border-emerald-800/20 shadow-md">
                    <div className="h-28 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 relative">
                        <div className="absolute inset-0 bg-zellij opacity-20"></div>
                        <div className="absolute top-3 end-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-900/80 text-amber-300 border-amber-400/40 text-xs">
                                {office?.office_name_ar || 'مكتب التوثيق العدلي'}
                            </Badge>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 relative">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 mb-4">
                            {/* Avatar & Basic Info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-start">
                                <div className="relative group">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={profile.name}
                                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-stone-900 shadow-xl bg-white"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center font-bold text-3xl border-4 border-white dark:border-stone-900 shadow-xl">
                                            {profile.name?.charAt(0) || 'U'}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute bottom-1 end-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-transform hover:scale-105 cursor-pointer"
                                        title="تغيير الصورة الشخصية"
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black font-tajawal text-stone-900 dark:text-stone-100">
                                            {profile.name}
                                        </h1>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${roleLabels[roleName]?.color || 'bg-stone-100 text-stone-700'}`}>
                                            {roleLabels[roleName]?.label || roleName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center sm:justify-start gap-2">
                                        <span>{profile.job_title || 'مستخدم معتمد'}</span>
                                        <span>•</span>
                                        <span dir="ltr">{profile.email}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Quick Metrics */}
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
                                    <div className="text-xs text-stone-400">العقود والرسوم</div>
                                    <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                        {stats.dossiers_count}
                                    </div>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
                                    <div className="text-xs text-stone-400">حالة الحساب</div>
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span>نشط ومؤكد</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto no-scrollbar text-xs font-bold pt-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'info'
                                        ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400'
                                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <User className="h-4 w-4" />
                                <span>المعلومات الشخصية والمهنية</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('signature')}
                                className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'signature'
                                        ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400'
                                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <FileSignature className="h-4 w-4" />
                                <span>نموذج التوقيع والصورة</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('security')}
                                className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'security'
                                        ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400'
                                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <Lock className="h-4 w-4" />
                                <span>كلمة المرور والأمان</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('activity')}
                                className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'activity'
                                        ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400'
                                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                            >
                                <Activity className="h-4 w-4" />
                                <span>الصلاحيات وسجل النشاطات</span>
                            </button>
                        </div>
                    </div>
                </Card>

                {/* TAB 1: PERSONAL & PROFESSIONAL INFO */}
                {activeTab === 'info' && (
                    <Card className="shadow-sm">
                        <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-emerald-600" />
                                <span>تعديل البيانات الشخصية والمهنية</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                تُستخدم هذه البيانات في ترويسة الرسوم ومذكرات الحفظ وسجلات المكتب الرسمية
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 pt-2">
                            <form onSubmit={submitProfileInfo} className="space-y-4 text-xs">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-name" className="font-bold">الاسم الكامل *</Label>
                                        <Input
                                            id="p-name"
                                            value={infoForm.data.name}
                                            onChange={(e) => infoForm.setData('name', e.target.value)}
                                            placeholder="الأستاذ فلان الفلاني"
                                            className="h-10 rounded-xl"
                                            required
                                        />
                                        {infoForm.errors.name && (
                                            <p className="text-[11px] text-rose-600 font-semibold">{infoForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-email" className="font-bold">البريد الإلكتروني المهني *</Label>
                                        <Input
                                            id="p-email"
                                            type="email"
                                            value={infoForm.data.email}
                                            onChange={(e) => infoForm.setData('email', e.target.value)}
                                            placeholder="adoul@cabinet.ma"
                                            dir="ltr"
                                            className="h-10 rounded-xl"
                                            required
                                        />
                                        {infoForm.errors.email && (
                                            <p className="text-[11px] text-rose-600 font-semibold">{infoForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-phone" className="font-bold">رقم الهاتف المباشر</Label>
                                        <Input
                                            id="p-phone"
                                            value={infoForm.data.phone}
                                            onChange={(e) => infoForm.setData('phone', e.target.value)}
                                            placeholder="+212 661 000 000"
                                            dir="ltr"
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-cin" className="font-bold">رقم بطاقة التعريف الوطنية (CIN)</Label>
                                        <Input
                                            id="p-cin"
                                            value={infoForm.data.cin}
                                            onChange={(e) => infoForm.setData('cin', e.target.value)}
                                            placeholder="مثال: AB123456"
                                            dir="ltr"
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-job" className="font-bold">الصفة أو المهمة بالمكتب</Label>
                                        <Input
                                            id="p-job"
                                            value={infoForm.data.job_title}
                                            onChange={(e) => infoForm.setData('job_title', e.target.value)}
                                            placeholder="مثال: عدل موثق محلف - رئيس المكتب"
                                            className="h-10 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-license" className="font-bold">رقم القرار الوزاري / بوليصة التأمين المهني</Label>
                                        <Input
                                            id="p-license"
                                            value={infoForm.data.license_number}
                                            onChange={(e) => infoForm.setData('license_number', e.target.value)}
                                            placeholder="مثال: قرار وزير العدل رقم 2018/142"
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-court" className="font-bold">المحكمة ودائرة النفوذ (من إعدادات المكتب)</Label>
                                        <Input
                                            id="p-court"
                                            value={office?.court_name || 'المحكمة الابتدائية'}
                                            disabled
                                            className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-bio" className="font-bold">نبذة تعريفية وتخصصات مهنية</Label>
                                    <textarea
                                        id="p-bio"
                                        rows={3}
                                        value={infoForm.data.bio}
                                        onChange={(e) => infoForm.setData('bio', e.target.value)}
                                        placeholder="تخصصات توثيق العقار، التركات، المنازعات الأسرية، إلخ..."
                                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3 text-xs focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-900"
                                    />
                                </div>

                                <div className="flex justify-end pt-3">
                                    <Button
                                        type="submit"
                                        variant="emerald"
                                        size="lg"
                                        className="rounded-xl font-bold shadow-md"
                                        disabled={infoForm.processing}
                                    >
                                        <Save className="h-4 w-4 me-2" />
                                        <span>{infoForm.processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* TAB 2: SIGNATURE & AVATAR SPECIMEN */}
                {activeTab === 'signature' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Signature Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="p-6 pb-3">
                                <CardTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                    <FileSignature className="h-5 w-5 text-emerald-600" />
                                    <span>نموذج التوقيع الرسمي</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    صورة توقيع السيد العدل أو الكاتب تُستخدم في النظائر الرقمية والشهادات
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 pt-2 space-y-4 text-xs">
                                <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-center flex flex-col items-center justify-center min-h-[160px] bg-stone-50 dark:bg-stone-900/50">
                                    {signaturePreview ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-white rounded-xl shadow-xs border inline-block">
                                                <img
                                                    src={signaturePreview}
                                                    alt="نموذج التوقيع"
                                                    className="h-20 object-contain max-w-[240px]"
                                                />
                                            </div>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => signatureInputRef.current?.click()}
                                                    className="text-xs"
                                                >
                                                    <Upload className="h-3.5 w-3.5 me-1.5" />
                                                    <span>تغيير التوقيع</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={deleteSignature}
                                                    className="text-xs"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 me-1.5" />
                                                    <span>حذف</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                                                <FileSignature className="h-6 w-6" />
                                            </div>
                                            <p className="font-bold text-stone-700 dark:text-stone-300">لم يتم رفع نموذج التوقيع بعد</p>
                                            <p className="text-[11px] text-stone-400 max-w-xs">
                                                يرجى رفع صورة ممسوحة ضوئياً للتوقيع على خلفية بيضاء شفافة بصيغة PNG أو JPG.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="emerald"
                                                size="sm"
                                                onClick={() => signatureInputRef.current?.click()}
                                                className="mt-2 text-xs"
                                            >
                                                <Upload className="h-3.5 w-3.5 me-1.5" />
                                                <span>رفع نموذج التوقيع</span>
                                            </Button>
                                        </div>
                                    )}

                                    <input
                                        ref={signatureInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleSignatureChange}
                                    />
                                </div>

                                {infoForm.data.signature && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300">
                                        <span className="text-amber-900 dark:text-amber-300 font-bold">
                                            تم اختيار ملف جديد. اضغط حفظ لتأكيده:
                                        </span>
                                        <Button
                                            type="button"
                                            variant="emerald"
                                            size="sm"
                                            onClick={submitProfileInfo}
                                            disabled={infoForm.processing}
                                        >
                                            تأكيد وحفظ
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Avatar Management Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="p-6 pb-3">
                                <CardTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                    <Camera className="h-5 w-5 text-emerald-600" />
                                    <span>الصورة الشخصية الرسمية</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    تظهر في الشريط العلوي وقائمة الفريق ووثائق الاتصال
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 pt-2 space-y-4 text-xs">
                                <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-center flex flex-col items-center justify-center min-h-[160px] bg-stone-50 dark:bg-stone-900/50">
                                    {avatarPreview ? (
                                        <div className="space-y-3">
                                            <img
                                                src={avatarPreview}
                                                alt={profile.name}
                                                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 mx-auto shadow-md"
                                            />
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="text-xs"
                                                >
                                                    <Upload className="h-3.5 w-3.5 me-1.5" />
                                                    <span>تغيير الصورة</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={deleteAvatar}
                                                    className="text-xs"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 me-1.5" />
                                                    <span>حذف</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <p className="font-bold text-stone-700 dark:text-stone-300">لم يتم رفع صورة شخصية</p>
                                            <Button
                                                type="button"
                                                variant="emerald"
                                                size="sm"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="mt-2 text-xs"
                                            >
                                                <Camera className="h-3.5 w-3.5 me-1.5" />
                                                <span>اختيار صورة شخصية</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {infoForm.data.avatar && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300">
                                        <span className="text-amber-900 dark:text-amber-300 font-bold">
                                            تم اختيار صورة جديدة. اضغط حفظ لتأكيدها:
                                        </span>
                                        <Button
                                            type="button"
                                            variant="emerald"
                                            size="sm"
                                            onClick={submitProfileInfo}
                                            disabled={infoForm.processing}
                                        >
                                            تأكيد وحفظ
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: SECURITY & PASSWORD */}
                {activeTab === 'security' && (
                    <div className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-7">
                            <Card className="shadow-sm">
                                <CardHeader className="p-6 pb-4">
                                    <CardTitle className="text-base font-bold font-tajawal flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-emerald-600" />
                                        <span>تغيير كلمة المرور الخاصة بالحساب</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        احرص على استخدام كلمة مرور قوية تحتوي على حروف وأرقام ورموز لضمان سرية وثائق المكتب
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-6 pt-2">
                                    <form onSubmit={submitPasswordChange} className="space-y-4 text-xs">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cur-pass" className="font-bold">كلمة المرور الحالية *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="cur-pass"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                    placeholder="••••••••"
                                                    dir="ltr"
                                                    className="h-10 rounded-xl pe-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-stone-400 hover:text-stone-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.errors.current_password && (
                                                <p className="text-[11px] text-rose-600 font-semibold">{passwordForm.errors.current_password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="new-pass" className="font-bold">كلمة المرور الجديدة (8 أحرف على الأقل) *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="new-pass"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                    placeholder="••••••••"
                                                    dir="ltr"
                                                    className="h-10 rounded-xl pe-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-stone-400 hover:text-stone-600"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.errors.password && (
                                                <p className="text-[11px] text-rose-600 font-semibold">{passwordForm.errors.password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="conf-pass" className="font-bold">تأكيد كلمة المرور الجديدة *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="conf-pass"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                    placeholder="••••••••"
                                                    dir="ltr"
                                                    className="h-10 rounded-xl pe-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-stone-400 hover:text-stone-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                className="w-full h-11 rounded-xl font-bold shadow-md"
                                                disabled={passwordForm.processing}
                                            >
                                                <KeyRound className="h-4 w-4 me-2" />
                                                <span>{passwordForm.processing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-5 space-y-4">
                            <Card className="shadow-sm border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-amber-600" />
                                        <span>إرشادات أمان الحساب التوثيقي</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 text-[11px] text-amber-900/90 dark:text-amber-200/90 space-y-2 leading-relaxed">
                                    <p>• كلمة المرور الخاصة بكم تمنح الولوج إلى السجلات الشرعية وكناش التضمين ومذكرات الحفظ.</p>
                                    <p>• لا تشارك بيانات الدخول مع أطراف خارجية أو عبر رسائل البريد الإلكتروني.</p>
                                    <p>• احرص على الضغط على زر "تسجيل الخروج" فور مغادرة المكتب أو الحاسوب المخصص.</p>
                                    <p>• في حالة الشك في أي نشاط مريب، قم بتغيير كلمة المرور فوراً.</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                        بيانات الجلسة والتسجيل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 text-xs space-y-2 text-stone-600 dark:text-stone-400">
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span>تاريخ إنشاء الحساب:</span>
                                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{profile.created_at}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span>حالة الترخيص:</span>
                                        <span className="font-bold text-emerald-600">محلف ومعتمد</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>المعرف الرقمي (ID):</span>
                                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">#{profile.id}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB 4: PERMISSIONS & RECENT ACTIVITIES */}
                {activeTab === 'activity' && (
                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Permissions Box */}
                        <div className="md:col-span-4 space-y-4">
                            <Card className="shadow-sm">
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-600" />
                                        <span>الصلاحيات الممنوحة</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        مستوى الأذونات الممنوح لحسابكم في النظام
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-0">
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.permissions && profile.permissions.length > 0 ? (
                                            profile.permissions.map((perm) => (
                                                <Badge key={perm} variant="secondary" className="text-[10px] bg-stone-100 dark:bg-stone-800">
                                                    {perm}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-700">
                                                كافة الصلاحيات التوثيقية (مدير المكتب)
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity Log */}
                        <div className="md:col-span-8">
                            <Card className="shadow-sm">
                                <CardHeader className="p-5 pb-3">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-emerald-600" />
                                        <span>سجل الإجراءات الأخيرة المنجزة من حسابك</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        تتبع المعاملات، تحيين الملفات، وإشهادات مذكرة الحفظ
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-0">
                                    {recentLogs.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentLogs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-start justify-between gap-3 text-xs"
                                                >
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                                                            {log.note}
                                                        </p>
                                                        {log.dossier_reference && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                                                                <FileText className="h-3 w-3" />
                                                                <span>الملف: {log.dossier_reference}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-stone-400 shrink-0 text-end">
                                                        <div>{log.created_at}</div>
                                                        <div className="font-mono">{log.date_formatted}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-stone-400 text-center py-6">
                                            لا توجد نشاطات مسجلة مؤخراً لهذا الحساب.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </TenantAdminLayout>
    );
}
