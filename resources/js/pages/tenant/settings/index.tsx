import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Settings,
    ShieldCheck,
    Building2,
    Scale,
    Sparkles,
    CheckCircle2,
    Phone,
    Mail,
    MapPin,
    Palette,
    Image,
    ExternalLink,
    Upload,
    Stamp,
    MessageCircle,
    FileText,
    Eye,
} from 'lucide-react';
import { OfficeSetting, Plan, SharedProps } from '@/types';

interface SettingsIndexProps {
    setting: OfficeSetting;
    subscription: any;
    plans: Plan[];
}

const THEME_OPTIONS = [
    {
        id: 'emerald',
        name_ar: 'أخضر زمردي عدلي (تقليدي)',
        colorClass: 'bg-emerald-700',
        borderClass: 'border-emerald-700',
        gradient: 'from-emerald-950 via-emerald-900 to-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-400',
    },
    {
        id: 'blue',
        name_ar: 'أزرق ملكي قضائي',
        colorClass: 'bg-blue-700',
        borderClass: 'border-blue-700',
        gradient: 'from-blue-950 via-blue-900 to-blue-800',
        text: 'text-blue-700 dark:text-blue-400',
    },
    {
        id: 'amber',
        name_ar: 'ذهبي صحراوي مذهب',
        colorClass: 'bg-amber-600',
        borderClass: 'border-amber-600',
        gradient: 'from-amber-950 via-amber-900 to-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
    },
    {
        id: 'ruby',
        name_ar: 'عنابي وقور (بورجوندي)',
        colorClass: 'bg-rose-900',
        borderClass: 'border-rose-900',
        gradient: 'from-rose-950 via-rose-900 to-rose-800',
        text: 'text-rose-700 dark:text-rose-400',
    },
    {
        id: 'slate',
        name_ar: 'فحمي عصري رصين',
        colorClass: 'bg-slate-800',
        borderClass: 'border-slate-800',
        gradient: 'from-slate-950 via-slate-900 to-slate-800',
        text: 'text-slate-700 dark:text-slate-400',
    },
];

export default function TenantSettingsIndex({
    setting,
    subscription,
    plans = [],
}: SettingsIndexProps) {
    const { tenant } = usePage<SharedProps>().props;

    const [logoPreview, setLogoPreview] = useState<string | null>(setting.logo_path || null);
    const [stampPreview, setStampPreview] = useState<string | null>(setting.stamp_image_path || null);
    const [heroPreview, setHeroPreview] = useState<string | null>(setting.hero_image_path || null);

    const form = useForm<{
        office_name_ar: string;
        office_name_fr: string;
        adoul_name: string;
        second_adoul_name: string;
        court_name: string;
        license_number: string;
        city: string;
        region: string;
        phone: string;
        whatsapp_number: string;
        email: string;
        address: string;
        qadi_name: string;
        color_primary: string;
        theme_color: 'emerald' | 'blue' | 'amber' | 'ruby' | 'slate';
        tagline_ar: string;
        tagline_fr: string;
        bio_ar: string;
        bio_fr: string;
        footer_text_ar: string;
        footer_text_fr: string;
        logo: File | null;
        stamp: File | null;
        hero_image: File | null;
    }>({
        office_name_ar: setting.office_name_ar || '',
        office_name_fr: setting.office_name_fr || '',
        adoul_name: setting.adoul_name || '',
        second_adoul_name: setting.second_adoul_name || '',
        court_name: setting.court_name || 'المحكمة الابتدائية - قسم قضاء الأسرة',
        license_number: setting.license_number || '',
        city: setting.city || 'الرباط',
        region: setting.region || 'المملكة المغربية',
        phone: setting.phone || '',
        whatsapp_number: setting.whatsapp_number || '',
        email: setting.email || '',
        address: setting.address || '',
        qadi_name: setting.qadi_name || 'قاضي التوثيق بالمحكمة الابتدائية المختصة',
        color_primary: setting.color_primary || '#0d5f47',
        theme_color: setting.theme_color || 'emerald',
        tagline_ar: setting.tagline_ar || '',
        tagline_fr: setting.tagline_fr || '',
        bio_ar: setting.bio_ar || '',
        bio_fr: setting.bio_fr || '',
        footer_text_ar: setting.footer_text_ar || '',
        footer_text_fr: setting.footer_text_fr || '',
        logo: null,
        stamp: null,
        hero_image: null,
    });

    const handleFileChange = (field: 'logo' | 'stamp' | 'hero_image', file: File | null) => {
        form.setData(field, file);
        if (file) {
            const url = URL.createObjectURL(file);
            if (field === 'logo') setLogoPreview(url);
            if (field === 'stamp') setStampPreview(url);
            if (field === 'hero_image') setHeroPreview(url);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/settings', {
            forceFormData: true,
        });
    };

    const currentPlan = subscription?.plan;

    return (
        <TenantAdminLayout title="إعدادات المكتب وتخصيص البوابة">
            <Head title="إعدادات المكتب وتخصيص البوابة — Adoul" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                            إعدادات المكتب العدلي واستوديو البوابة العامة
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            التحكم الكامل في هوية المكتب، شعاره وخاتمه الرسمي، وتخصيص الصفحة العامة للمواطنين
                        </p>
                    </div>

                    {tenant?.id && (
                        <a
                            href={tenant.public_url || `/office/${tenant.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
                        >
                            <Eye className="h-4 w-4 text-emerald-600" />
                            <span>معاينة البوابة العامة للمكتب</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>

                {/* Dedicated Cabinet System Overview */}
                <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/5 via-white to-amber-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/20 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <Badge variant="gold" className="text-[10px] mb-1 font-bold">النسخة الخاصة بالمكتب (Standalone Edition)</Badge>
                                <CardTitle className="text-lg font-bold font-tajawal text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                    <span>نظام تدبير مكتب التوثيق العدلي — ترخيص مكتبي دائم</span>
                                </CardTitle>
                            </div>
                            <div className="text-xs font-bold font-tajawal text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                قاعدة بيانات خاصة ومستقلة 100%
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="grid sm:grid-cols-3 gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                            <div>
                                <span className="text-stone-400 block mb-0.5">حالة النظام:</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    جاهز ومفعل لجميع الوحدات
                                </span>
                            </div>
                            <div>
                                <span className="text-stone-400 block mb-0.5">المستخدمون المصرح لهم:</span>
                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                    الأستاذ العدل + كتابة المكتب (السكرتارية)
                                </span>
                            </div>
                            <div>
                                <span className="text-stone-400 block mb-0.5">الملفات والوثائق:</span>
                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                    غير محدودة (محلياً وسحابياً)
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Office Details Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: Official Identity */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                <Building2 className="h-4 w-4 text-emerald-600" />
                                <span>1. هوية السادة العدول وبيانات المكتب الرسمية (تظهر في الواجهة والشهادات والمحررات)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-stone-800 dark:text-stone-200">اسم الأستاذ(ة) العدل (صاحب المكتب / رئيس الهيئة) *</Label>
                                    <Input
                                        value={form.data.adoul_name}
                                        onChange={(e) => form.setData('adoul_name', e.target.value)}
                                        placeholder="مثال: الأستاذ د. محمد الإدريسي"
                                    />
                                    <p className="text-[10px] text-stone-400">يظهر كاسم المستخدم الرئيسي ويوقع به في محررات التوثيق</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-bold text-stone-800 dark:text-stone-200">اسم العدل الثاني الشريك (الشريك في التلقي)</Label>
                                    <Input
                                        value={form.data.second_adoul_name}
                                        onChange={(e) => form.setData('second_adoul_name', e.target.value)}
                                        placeholder="مثال: الأستاذة ذة. فاطمة الزهراء بنجلون"
                                    />
                                    <p className="text-[10px] text-stone-400">العدل الثاني المعتمد لإتمام ركن شهادة عدلين في التلقي الشرعي</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>اسم المكتب بالعربية *</Label>
                                    <Input
                                        value={form.data.office_name_ar}
                                        onChange={(e) => form.setData('office_name_ar', e.target.value)}
                                        placeholder="مكتب الأستاذين فلان وفلان - عدول محلفون"
                                        required
                                    />
                                    {form.errors.office_name_ar && <p className="text-red-500 text-[11px]">{form.errors.office_name_ar}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>اسم المكتب بالفرنسية *</Label>
                                    <Input
                                        value={form.data.office_name_fr}
                                        onChange={(e) => form.setData('office_name_fr', e.target.value)}
                                        placeholder="Cabinet Notarial Adoulaire"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>المحكمة الابتدائية المختصة وقسم قضاء الأسرة *</Label>
                                    <Input
                                        value={form.data.court_name}
                                        onChange={(e) => form.setData('court_name', e.target.value)}
                                        placeholder="مثال: المحكمة الابتدائية بالرباط - قسم قضاء الأسرة"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>صفة أو اسم قاضي التوثيق المشرف بالمحكمة المختصة *</Label>
                                    <Input
                                        value={form.data.qadi_name}
                                        onChange={(e) => form.setData('qadi_name', e.target.value)}
                                        placeholder="السيد قاضي التوثيق بالمحكمة الابتدائية"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label>المدينة والدائرة القضائية *</Label>
                                    <Input
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>الجهة الترابية</Label>
                                    <Input
                                        value={form.data.region}
                                        onChange={(e) => form.setData('region', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>رقم بطاقة المهنة / قرار التعيين</Label>
                                    <Input
                                        value={form.data.license_number}
                                        onChange={(e) => form.setData('license_number', e.target.value)}
                                        placeholder="مثال: قرار وزاري عدد 2018/142"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label>رقم هاتف المكتب *</Label>
                                    <Input
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        dir="ltr"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>رقم الواتساب (للتواصل المباشر)</span>
                                    </Label>
                                    <Input
                                        value={form.data.whatsapp_number}
                                        onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                        placeholder="+212 6..."
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>البريد الإلكتروني الرسمي *</Label>
                                    <Input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>العنوان ومقر المكتب الكامل</Label>
                                <Input
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    placeholder="العنوان الكامل كما يظهر في خاتم وترويسة المحررات"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Visual Brand & Official Assets (Logo, Stamp, Hero Banner) */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <Image className="h-4 w-4 text-emerald-600" />
                                <span>2. الصور والشعارات الرسمية للمكتب (شعار، خاتم، صورة الواجهة)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-6 text-xs">
                            <div className="grid sm:grid-cols-3 gap-6">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label className="font-semibold block">شعار المكتب (Logo)</Label>
                                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors">
                                        {logoPreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={logoPreview}
                                                    alt="شعار المكتب"
                                                    className="w-20 h-20 object-contain mx-auto rounded-lg shadow-sm border border-stone-200 dark:border-stone-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                                                <ShieldCheck className="h-8 w-8" />
                                            </div>
                                        )}
                                        <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer">
                                            <Upload className="h-3.5 w-3.5" />
                                            <span>{logoPreview ? 'تغيير الشعار' : 'رفع الشعار'}</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        <p className="text-[10px] text-stone-400 mt-1">PNG أو SVG بخلفية شفافة (حد أقصى 2MB)</p>
                                    </div>
                                </div>

                                {/* Stamp / Seal Upload */}
                                <div className="space-y-2">
                                    <Label className="font-semibold block">خاتم المكتب الرسمي (طابع العدل)</Label>
                                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors">
                                        {stampPreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={stampPreview}
                                                    alt="خاتم المكتب"
                                                    className="w-20 h-20 object-contain mx-auto rounded-lg shadow-sm border border-stone-200 dark:border-stone-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                                                <Stamp className="h-8 w-8" />
                                            </div>
                                        )}
                                        <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer">
                                            <Upload className="h-3.5 w-3.5" />
                                            <span>{stampPreview ? 'تغيير الخاتم' : 'رفع الخاتم'}</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('stamp', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        <p className="text-[10px] text-stone-400 mt-1">يُطبع في أسفل المحررات والنسخ الرسمية</p>
                                    </div>
                                </div>

                                {/* Hero Banner Image */}
                                <div className="space-y-2">
                                    <Label className="font-semibold block">صورة الواجهة للبوابة (Hero Banner)</Label>
                                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors">
                                        {heroPreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={heroPreview}
                                                    alt="واجهة البوابة"
                                                    className="w-full h-20 object-cover mx-auto rounded-lg shadow-sm border border-stone-200 dark:border-stone-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                                                <Image className="h-8 w-8" />
                                            </div>
                                        )}
                                        <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer">
                                            <Upload className="h-3.5 w-3.5" />
                                            <span>{heroPreview ? 'تغيير صورة الغلاف' : 'رفع صورة الغلاف'}</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleFileChange('hero_image', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        <p className="text-[10px] text-stone-400 mt-1">صورة عريضة لمقر المكتب أو الواجهة التوثيقية</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Portal Customization & White-Label Theme */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <Palette className="h-4 w-4 text-emerald-600" />
                                <span>3. تخصيص البوابة العامة (الألوان، الشعار، النبذة التعريفية والتذييل)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-5 text-xs">
                            {/* Color Theme Selector */}
                            <div className="space-y-2">
                                <Label className="font-semibold">نسق ألوان البوابة العامة (Color Theme):</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {THEME_OPTIONS.map((theme) => {
                                        const isSelected = form.data.theme_color === theme.id;
                                        return (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => form.setData('theme_color', theme.id as any)}
                                                className={`p-3 rounded-xl border-2 text-start transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm'
                                                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                                                }`}
                                            >
                                                <div className={`w-full h-8 rounded-lg ${theme.colorClass} mb-2 shadow-xs`} />
                                                <div className="font-bold text-[11px] text-stone-900 dark:text-stone-100 truncate">
                                                    {theme.name_ar}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Taglines */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>شعار أو عبارة البوابة بالعربية (Tagline)</Label>
                                    <Input
                                        value={form.data.tagline_ar}
                                        onChange={(e) => form.setData('tagline_ar', e.target.value)}
                                        placeholder="الدقة، الأمانة، والسرعة في توثيق كافة المعاملات العدلية"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>شعار البوابة بالفرنسية (Tagline FR)</Label>
                                    <Input
                                        value={form.data.tagline_fr}
                                        onChange={(e) => form.setData('tagline_fr', e.target.value)}
                                        placeholder="Rigueur, probité et célérité au service de vos actes notariés"
                                    />
                                </div>
                            </div>

                            {/* Office Biography */}
                            <div className="space-y-1.5">
                                <Label>نبذة تعريفية عن المكتب وخبرات السادة العدول (Bio / Presentation)</Label>
                                <textarea
                                    value={form.data.bio_ar}
                                    onChange={(e) => form.setData('bio_ar', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="مكتب عدلي معتمد بخبرة تتجاوز 15 سنة في توثيق عقود العقار، الزواج، التركات، والمعاملات التجارية..."
                                />
                            </div>

                            {/* Custom Footer */}
                            <div className="space-y-1.5">
                                <Label>نص تذييل البوابة وشروط الاستقبال (Custom Footer & Instructions)</Label>
                                <textarea
                                    value={form.data.footer_text_ar}
                                    onChange={(e) => form.setData('footer_text_ar', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="مواقيت الاستقبال: من الاثنين إلى الجمعة (8:30 إلى 16:30). يرجى إحضار البطاقة الوطنية الأصلية لجميع الأطراف."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between pt-2">
                        {tenant?.id && (
                            <a
                                href={tenant.public_url || `/office/${tenant.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>معاينة صفحة المكتب المخصصة</span>
                            </a>
                        )}

                        <Button type="submit" variant="emerald" className="px-8 font-bold text-sm h-11" disabled={form.processing}>
                            {form.processing ? 'جاري حفظ التخصيصات...' : 'حفظ إعدادات وتخصيص البوابة'}
                        </Button>
                    </div>
                </form>
            </div>
        </TenantAdminLayout>
    );
}
