import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { SharedProps, OfficeSetting } from '@/types';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import {
    ShieldCheck,
    Lock,
    Mail,
    Scale,
    Sparkles,
    CheckCircle2,
    UserCheck,
    AlertCircle,
    ArrowLeft,
    Building2,
    BookOpen,
    KeyRound,
    Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TenantLoginProps {
    tenant?: {
        id: string;
        name: string;
        city: string;
    };
    office?: OfficeSetting;
}

export default function TenantLogin({ tenant, office }: TenantLoginProps) {
    const { t } = useLanguage();
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const officeName = office?.office_name_ar || tenant?.name || 'مكتب التوثيق العدلي';
    const adoulName = office?.adoul_name || 'الأستاذ د. محمد الإدريسي';
    const courtName = office?.court_name || 'المحكمة الابتدائية - قسم قضاء الأسرة';
    const cityName = office?.city || tenant?.city || 'المملكة المغربية';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const fillAccount = (email: string) => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col selection:bg-emerald-600 selection:text-white font-tajawal">
            <FlashBanner flash={flash} />

            <div className="flex-1 flex flex-col lg:flex-row">
                <Head title={`تسجيل الدخول — ${officeName}`} />

                {/* Left Side: Authentic Moroccan Judicial Presentation */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-[#073b2d] to-stone-950 text-white flex-col justify-between p-12 overflow-hidden border-e border-emerald-800/40">
                    {/* Background Subtle Geometric Pattern */}
                    <div className="absolute inset-0 bg-radial from-emerald-800/10 via-transparent to-stone-950/80 pointer-events-none" />

                    {/* Top Branding */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-3.5 bg-emerald-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-400/30 shadow-lg">
                            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-inner">
                                <Scale className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold text-amber-300/90 tracking-wide">
                                    المملكة المغربية — وزارة العدل
                                </div>
                                <span className="font-extrabold text-lg text-white block">
                                    خطة العدالة والتـوثيق الـشرعي
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="relative z-10 my-auto max-w-lg space-y-7">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/50 text-emerald-200 text-xs font-semibold">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>نظام التدبير الإلكتروني المكتبي المستقل</span>
                            </div>
                            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
                                {officeName}
                            </h1>
                            <p className="text-sm text-emerald-200/90 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
                                <span>{courtName} ({cityName})</span>
                            </p>
                        </div>

                        {/* Oath Quote */}
                        <blockquote className="relative p-5 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 backdrop-blur-sm text-sm text-emerald-100/95 leading-relaxed">
                            <div className="text-amber-300 font-bold mb-1.5 text-xs flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>قَسَمُ خطة العدالة (المادة 10 من القانون 16.03):</span>
                            </div>
                            «أقسم بالله العظيم أن أؤدي مهامي بإخلاص وأمانة، وأن أحافظ على السر المهني، وأن أسلك في ذلك مسلك العدل المخلص لدينه ووطنه وملكه.»
                        </blockquote>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <span className="text-emerald-100 font-medium">سجلات عقود ومذكرة حفظ مؤمنة</span>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <span className="text-emerald-100 font-medium">صياغة الرسوم وتوليد النماذج الرسمية</span>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <span className="text-emerald-100 font-medium">تتبع التأشير والخطاب القضائي</span>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <span className="text-emerald-100 font-medium">فضاء مشترك بين العدل والسكرتارية</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Left */}
                    <div className="relative z-10 pt-5 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300/80">
                        <span>إشراف الأستاذ: {adoulName}</span>
                        <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                            <ShieldCheck className="h-4 w-4" />
                            نسخة المكتب المعتمدة
                        </span>
                    </div>
                </div>

                {/* Right Side: Login Form & Credentials Cards */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto bg-stone-50 dark:bg-stone-900">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between pb-4">
                        <div className="lg:hidden flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300 shadow-sm">
                                <Scale className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                                    {officeName}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                    {cityName}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ms-auto">
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Main Login Box */}
                    <div className="w-full max-w-md mx-auto my-auto py-6">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-amber-300 flex items-center justify-center shadow-md border border-amber-400/30">
                                <ShieldCheck className="h-7 w-7 text-amber-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                                دخول فضاء المكتب
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                                أدخل بيانات الدخول المصرح بها لمكتب التوثيق
                            </p>
                        </div>

                        {/* Error Alert */}
                        {Object.keys(errors).length > 0 && (
                            <div className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-xs">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                <span className="font-medium">
                                    {errors.email || errors.password || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}
                                </span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                    البريد الإلكتروني
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="adoul@cabinet.ma"
                                        className="ps-9 h-11 text-sm bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-600"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                        كلمة المرور
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="ps-9 h-11 text-sm bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-600"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between text-xs py-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                                    />
                                    <span className="text-stone-600 dark:text-stone-400">تذكر هذا الجهاز</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                variant="emerald"
                                className="w-full h-11 text-sm font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
                                disabled={processing}
                            >
                                {processing ? 'جاري التحقق والدخول...' : 'تسجيل الدخول إلى فضاء المكتب'}
                            </Button>
                        </form>

                        {/* Authorized Office Accounts Section (Clean & Official) */}
                        <div className="mt-7 pt-5 border-t border-stone-200 dark:border-stone-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                    <KeyRound className="h-4 w-4 text-amber-500" />
                                    <span>الحسابات المصرح بها للمكتب:</span>
                                </span>
                                <span className="text-[11px] text-stone-400">انقر للتعبئة الفورية</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Account 1: Adoul */}
                                <div
                                    onClick={() => fillAccount('adoul@cabinet.ma')}
                                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer text-start shadow-xs relative overflow-hidden ${
                                        data.email === 'adoul@cabinet.ma'
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                            <Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                            <span>الأستاذ(ة) العدل</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                            رئيس المكتب
                                        </span>
                                    </div>
                                    <div className="text-stone-700 dark:text-stone-300 font-mono text-xs font-semibold select-all">
                                        adoul@cabinet.ma
                                    </div>
                                    <div className="text-stone-400 text-[10px] mt-1 flex items-center justify-between">
                                        <span>كلمة المرور: <span className="font-mono text-stone-600 dark:text-stone-300 font-bold">password</span></span>
                                        <span className="text-emerald-600 font-bold group-hover:underline">تعبئة</span>
                                    </div>
                                </div>

                                {/* Account 2: Secrétaire */}
                                <div
                                    onClick={() => fillAccount('secretaire@cabinet.ma')}
                                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer text-start shadow-xs relative overflow-hidden ${
                                        data.email === 'secretaire@cabinet.ma'
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="font-extrabold text-xs text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                                            <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            <span>كتابة المكتب</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                                            السكرتارية
                                        </span>
                                    </div>
                                    <div className="text-stone-700 dark:text-stone-300 font-mono text-xs font-semibold select-all">
                                        secretaire@cabinet.ma
                                    </div>
                                    <div className="text-stone-400 text-[10px] mt-1 flex items-center justify-between">
                                        <span>كلمة المرور: <span className="font-mono text-stone-600 dark:text-stone-300 font-bold">password</span></span>
                                        <span className="text-blue-600 font-bold group-hover:underline">تعبئة</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back to Public Portal */}
                        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                            <Link
                                href="/"
                                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1.5"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                                <span>زيارة البوابة الرقمية للمكتب</span>
                            </Link>

                            <Link
                                href="/settings"
                                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                            >
                                إعدادات المكتب
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-[11px] text-stone-400 py-2 border-t border-stone-100 dark:border-stone-800/80">
                        نظام التوثيق العدلي المغربي — {officeName} © {new Date().getFullYear()}
                    </div>
                </div>
            </div>
        </div>
    );
}
