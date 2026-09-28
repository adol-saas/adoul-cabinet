import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { SharedProps } from '@/types';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import { ShieldCheck, Lock, Mail, KeyRound, ExternalLink, Sparkles, CheckCircle2, UserCheck, Scale, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TenantLoginProps {
    tenant: {
        id: string;
        name: string;
        city: string;
    };
}

export default function TenantLogin({ tenant }: TenantLoginProps) {
    const { t } = useLanguage();
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = (email: string) => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col selection:bg-emerald-500 selection:text-white">
            <FlashBanner flash={flash} />
            <div className="flex-1 flex flex-col lg:flex-row">
            <Head title={`تسجيل الدخول — ${tenant?.name || 'مكتب العدل'}`} />

            {/* Left Column (50% on lg+ screens): Office Moroccan Emerald & Zellij Showcase */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-850 text-white flex-col justify-between p-12 overflow-hidden bg-zellij">
                <div className="absolute inset-0 bg-radial from-transparent via-emerald-950/60 to-emerald-950 pointer-events-none" />

                {/* Top Office Header */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-800/80 border border-amber-400/40 text-amber-300 shadow-lg">
                            <ShieldCheck className="h-7 w-7 text-amber-400" />
                        </div>
                        <div>
                            <span className="font-extrabold text-2xl tracking-tight font-tajawal text-white block">
                                {tenant?.name}
                            </span>
                            <span className="text-xs text-emerald-200/80">
                                {tenant?.city} — دائرة نفوذ المحكمة الابتدائية المختصة
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center Content: Oath of Adoul & Office Highlights */}
                <div className="relative z-10 my-auto max-w-lg space-y-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>منظومة التوثيق العدلي المعتمدة بالمملكة المغربية</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl xl:text-4xl font-extrabold font-tajawal leading-snug text-white">
                            فضاء هيئة التوثيق وكتابة الضبط بالمكتب
                        </h1>
                        <blockquote className="relative p-5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-sm text-sm text-emerald-100/90 leading-relaxed font-tajawal">
                            <div className="text-amber-400 font-bold mb-1 text-xs">قَسَمُ خطة العدالة (المادة 10 من القانون 16.03):</div>
                            «أقسم بالله العظيم أن أؤدي مهامي بإخلاص وأمانة، وأن أحافظ على السر المهني، وأن أسلك في ذلك مسلك العدل المخلص لدينه ووطنه وملكه.»
                        </blockquote>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-emerald-100">سجلات عقود مشفرة ومعزولة كلياً</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-emerald-100">صياغة العقود وتوليد ملفات Word و PDF</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-emerald-100">توزيع الصلاحيات لكتاب وأعضاء المكتب</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-emerald-100">تتبع الخطاب والتأشير والرسوم الجبائية</span>
                        </div>
                    </div>
                </div>

                {/* Footer on Left */}
                <div className="relative z-10 pt-6 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300/80">
                    <span>قاعدة بيانات مشفرة لمكتب {tenant?.name}</span>
                    <span className="flex items-center gap-1">
                        <Scale className="h-4 w-4 text-amber-400" />
                        القانون 16.03
                    </span>
                </div>
            </div>

            {/* Right Column (50% on lg+, 100% on mobile): Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
                {/* Header with Nav Controls */}
                <div className="flex items-center justify-between">
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="font-bold font-tajawal text-emerald-950 dark:text-emerald-300">{tenant?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 ms-auto">
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                </div>

                {/* Main Login Form Container */}
                <div className="w-full max-w-md mx-auto my-auto py-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shadow-sm">
                            <ShieldCheck className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold font-tajawal text-stone-900 dark:text-white">
                            دخول فضاء المكتب
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
                            {tenant?.name} — {tenant?.city}
                        </p>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errors.email || errors.password || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                                {t('email')}
                            </Label>
                            <div className="relative">
                                <Mail className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="adoul@etude.ma"
                                    className="ps-9 h-11 text-sm bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                                    {t('password')}
                                </Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="ps-9 h-11 text-sm bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-xs py-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-stone-600 dark:text-stone-400">تذكر حسابي على هذا الجهاز</span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="emerald"
                            className="w-full h-11 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                            disabled={processing}
                        >
                            {processing ? 'جاري فتح فضاء المكتب...' : 'الدخول لفضاء المكتب'}
                        </Button>
                    </form>

                    {/* Fast Demo Switcher */}
                    <div className="mt-8 pt-5 border-t border-stone-200 dark:border-stone-800">
                        <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-2.5 flex items-center gap-1.5">
                            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                            <span>حسابات تجريبية سريعة بنقرة واحدة (Demo):</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => fillDemo(tenant?.id === 'casablanca-adoul' ? 'owner@casa-adoul.test' : tenant?.id === 'marrakech-adoul' ? 'owner@marrakech-adoul.test' : 'owner@rabat-adoul.test')}
                                className="text-[11px] p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-start transition-all cursor-pointer shadow-xs"
                            >
                                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>صاحب المكتب (العدل)</span>
                                </div>
                                <div className="text-stone-500 text-[10px] mt-0.5 truncate">
                                    {tenant?.id === 'casablanca-adoul' ? 'owner@casa-adoul.test' : `owner@${tenant?.id}.test`}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('katib@casa-adoul.test')}
                                className="text-[11px] p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-start transition-all cursor-pointer shadow-xs"
                            >
                                <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    <span>كاتب(ة) المكتب</span>
                                </div>
                                <div className="text-stone-500 text-[10px] mt-0.5 truncate">katib@casa-adoul.test</div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        <a
                            href={`/office/${tenant?.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>الصفحة العامة للمكتب</span>
                        </a>

                        <Link href="/" className="hover:underline">
                            البوابة الوطنية Adoul
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[11px] text-stone-400 py-2">
                    نظام Adoul للتوثيق العدلي بالمملكة المغربية — مكتب {tenant?.name}
                </div>
            </div>
        </div>
    </div>
    );
}

