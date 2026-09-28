import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plan, BlogPost, SharedProps } from '@/types';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ShieldCheck,
    CheckCircle2,
    Calendar,
    ArrowLeft,
    ArrowRight,
    Search,
    Scale,
    Building,
    FileText,
    QrCode,
    Users,
    ChevronRight,
    ChevronDown,
    Send,
    Sparkles,
    Star,
    Check,
    HelpCircle,
    Quote,
    Award,
    FileCheck2,
    Menu,
    X,
    MapPin,
    Mail,
    ExternalLink,
    Globe,
} from 'lucide-react';

interface FeaturedOffice {
    id: string;
    name: string;
    city: string;
    phone: string;
    email: string;
    public_url?: string;
}

interface WelcomeProps {
    plans: Plan[];
    blogPosts: BlogPost[];
    featuredOffices: FeaturedOffice[];
    stats: {
        total_offices: number;
        cities_count: number;
        satisfaction_rate: number;
        compliance_standard: string;
    };
}

export default function Welcome({ plans = [], blogPosts = [], featuredOffices = [], stats }: WelcomeProps) {
    const { t, isRtl, language } = useLanguage();
    const { auth, flash } = usePage<SharedProps>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activePreviewTab, setActivePreviewTab] = useState<'act_studio' | 'qadi_workflow' | 'qr_verify'>('act_studio');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const contactForm = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const submitContact = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/contact', {
            onSuccess: () => contactForm.reset(),
        });
    };

    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
            <Head title={t('app_name') + ' — ' + t('tagline')} />
            <FlashBanner flash={flash} />

            <header className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-sm flex items-center justify-center">
                            <Scale className="h-6 w-6 text-amber-300" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-300 font-tajawal">
                                {t('app_name')}
                            </span>
                            <span className="hidden sm:inline-block ms-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                                {t('digital_justice')}
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600 dark:text-stone-300">
                        <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_features')}</a>
                        <Link href="/directory" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_directory')}</Link>
                        <a href="#pricing" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_pricing')}</a>
                        <a href="#compliance" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_law')}</a>
                        <a href="#blog" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_news')}</a>
                        <a href="#contact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">{t('nav_contact')}</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <ThemeToggle />
                        {auth.user ? (
                            auth.user.is_super_admin ? (
                                <Link href="/super-admin"><Button variant="emerald" size="sm">{t('super_admin_panel')}</Button></Link>
                            ) : (
                                <Link href="/dashboard"><Button variant="emerald" size="sm">{t('dashboard')}</Button></Link>
                            )
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/register"><Button variant="gold" size="sm">{t('register_short')}</Button></Link>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Navigation"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                            <a
                                href="#features"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_features')}
                            </a>
                            <Link
                                href="/directory"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_directory')}
                            </Link>
                            <a
                                href="#pricing"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_pricing')}
                            </a>
                            <a
                                href="#compliance"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_law')}
                            </a>
                            <a
                                href="#blog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_news')}
                            </a>
                            <a
                                href="#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200"
                            >
                                {t('nav_contact')}
                            </a>
                        </div>
                    </div>
                )}
            </header>


            <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-white bg-zellij">
                <div className="absolute inset-0 bg-radial from-transparent via-emerald-950/70 to-emerald-950 pointer-events-none" />
                
                {/* Ambient glowing animated light orbs */}
                <div className="absolute top-1/4 -start-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" />
                <div className="absolute bottom-10 -end-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" style={{ animationDelay: '3s' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl mx-auto">
                    {/* Logo emblem with animated floating effects */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group mb-6">
                            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/40 via-emerald-400/30 to-amber-400/40 rounded-3xl blur-lg opacity-60 group-hover:opacity-90 transition duration-1000 animate-pulse-subtle"></div>
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-amber-400/60 flex items-center justify-center shadow-2xl shadow-emerald-950/80 animate-float-slow">
                                <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-amber-300 drop-shadow-md" />
                            </div>
                            <div className="absolute -top-1.5 -end-1.5 w-7 h-7 rounded-full bg-amber-400 border-2 border-emerald-950 flex items-center justify-center shadow-md animate-bounce">
                                <ShieldCheck className="h-4 w-4 text-emerald-950" />
                            </div>
                        </div>

                        {/* Responsive Trust & Legal Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-2xl mx-auto px-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-md backdrop-blur-md hover:scale-105 transition-transform">
                                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>تأشيرة قاضي التوثيق الرقمية</span>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-800 to-emerald-850 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-md hover:scale-105 transition-transform">
                                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
                                <span>{t('hero_badge')}</span>
                            </div>

                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-md backdrop-blur-md hover:scale-105 transition-transform">
                                <QrCode className="h-4 w-4 text-amber-400 shrink-0" />
                                <span>تحقق رسمي بالرمز (QR)</span>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-tajawal">
                        {t('hero_heading')}
                    </h1>

                    <p className="mt-6 text-base sm:text-xl text-emerald-100/90 leading-relaxed max-w-3xl mx-auto">
                        {t('hero_sub')}
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link href="/register">
                            <Button variant="gold" size="lg" className="text-base px-8 py-6 font-bold shadow-xl shadow-amber-900/40 glow-gold hover:scale-105 transition-all">
                                <span>{t('cta_start')}</span>
                                <Arrow className="h-5 w-5 ms-2" />
                            </Button>
                        </Link>
                        <Link href="/directory">
                            <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-6 py-6 text-base hover:scale-105 transition-all">
                                <Search className="h-5 w-5 me-2" />
                                <span>{t('cta_directory')}</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-emerald-950/60 backdrop-blur-sm border border-emerald-700/40 text-center">
                        <div>
                            <div className="text-3xl font-extrabold text-amber-300 font-tajawal">{stats?.total_offices || 3}+</div>
                            <div className="text-xs text-emerald-200/80 mt-1">{t('stat_offices')}</div>
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-amber-300 font-tajawal">{stats?.cities_count || 12}</div>
                            <div className="text-xs text-emerald-200/80 mt-1">{t('stat_cities')}</div>
                        </div>
                        <div>
                            <div className="text-3xl font-extrabold text-amber-300 font-tajawal">{stats?.satisfaction_rate || 99.4}%</div>
                            <div className="text-xs text-emerald-200/80 mt-1">{t('stat_satisfaction')}</div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white mt-2 font-tajawal">{stats?.compliance_standard || '16.03 & 051.26'}</div>
                            <div className="text-xs text-emerald-200/80 mt-1">{t('stat_compliance')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Moroccan Legal Product Showcase */}
            <section className="py-16 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl overflow-hidden glass-card">
                    {/* Showcase Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-stone-100/70 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800">
                        <button
                            type="button"
                            onClick={() => setActivePreviewTab('act_studio')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                activePreviewTab === 'act_studio'
                                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <FileCheck2 className="h-4 w-4 text-amber-300" />
                            <span>{t('showcase_tab_acts')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActivePreviewTab('qadi_workflow')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                activePreviewTab === 'qadi_workflow'
                                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <Scale className="h-4 w-4 text-amber-300" />
                            <span>{t('showcase_tab_qadi')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActivePreviewTab('qr_verify')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                activePreviewTab === 'qr_verify'
                                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <QrCode className="h-4 w-4 text-amber-300" />
                            <span>{t('showcase_tab_qr')}</span>
                        </button>
                    </div>

                    {/* Preview Content Area */}
                    <div className="p-6 md:p-8 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950 min-h-[380px]">
                        {activePreviewTab === 'act_studio' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                                            ع.ز
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base font-tajawal text-stone-900 dark:text-stone-100">{t('showcase_act_sample_title')}</h3>
                                            <p className="text-xs text-stone-500">{t('showcase_act_sample_sub')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                                            {t('signed_tag')}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                                            {t('pending_qadi_tag')}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    <div className="p-4 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 shadow-xs space-y-3">
                                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">{t('showcase_sample_badge')}</div>
                                        <div className="flex justify-between border-b border-stone-100 dark:border-stone-700/40 pb-2">
                                            <span className="text-stone-500">الطرف الأول:</span>
                                            <span className="font-semibold text-stone-800 dark:text-stone-200">الطرف الأول (نموذج توضيحي) — (ب.ت.و: XX******)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-stone-100 dark:border-stone-700/40 pb-2">
                                            <span className="text-stone-500">الطرف الثاني:</span>
                                            <span className="font-semibold text-stone-800 dark:text-stone-200">الطرف الثاني (نموذج توضيحي) — (ب.ت.و: XX******)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-500">ملاحظات العقد:</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-300">[وفق الاتفاق الشرعي والقانوني]</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 shadow-xs space-y-3">
                                        <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">{t('tagline_sub')}</div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/40">
                                            <div className="text-xs">
                                                <div className="font-bold text-stone-800 dark:text-stone-200">{t('role_owner')}</div>
                                                <div className="text-stone-500">رقم التسجيل بالجدول: ****</div>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/40">
                                            <div className="text-xs">
                                                <div className="font-bold text-stone-800 dark:text-stone-200">{t('role_adoul')}</div>
                                                <div className="text-stone-500">رقم التسجيل بالجدول: ****</div>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePreviewTab === 'qadi_workflow' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="text-center max-w-xl mx-auto mb-6">
                                    <h3 className="font-bold text-lg font-tajawal text-stone-900 dark:text-stone-100">{t('tab_track_dossier')}</h3>
                                    <p className="text-xs text-stone-500 mt-1">{t('hero_sub')}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-center space-y-1">
                                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mx-auto">1</div>
                                        <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">{t('step_draft')}</div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-center space-y-1">
                                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mx-auto">2</div>
                                        <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">{t('step_dual_signing')}</div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-500 text-center space-y-1 shadow-md">
                                        <div className="w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center mx-auto">3</div>
                                        <div className="text-xs font-bold text-amber-950 dark:text-amber-200">{t('step_qadi_visa')}</div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 text-center space-y-1 opacity-70">
                                        <div className="w-7 h-7 rounded-full bg-stone-400 text-white text-xs font-bold flex items-center justify-center mx-auto">4</div>
                                        <div className="text-xs font-bold text-stone-700 dark:text-stone-300">{t('step_registration')}</div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 text-center space-y-1 opacity-70">
                                        <div className="w-7 h-7 rounded-full bg-stone-400 text-white text-xs font-bold flex items-center justify-center mx-auto">5</div>
                                        <div className="text-xs font-bold text-stone-700 dark:text-stone-300">{t('step_ready')}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePreviewTab === 'qr_verify' && (
                            <div className="space-y-4 animate-in fade-in duration-300 max-w-2xl mx-auto">
                                <div className="p-6 rounded-2xl bg-white dark:bg-stone-800 border-2 border-dashed border-emerald-500/50 shadow-inner flex flex-col sm:flex-row items-center gap-6">
                                    <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col items-center">
                                        <div className="w-32 h-32 bg-stone-900 text-white rounded-xl flex items-center justify-center p-2">
                                            <QrCode className="w-28 h-28 text-emerald-400" />
                                        </div>
                                        <span className="text-[10px] text-stone-500 mt-2 font-mono">ADL-2026-VERIFIED</span>
                                    </div>
                                    <div className="space-y-2 text-start">
                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            <span>{t('showcase_qr_badge')}</span>
                                        </div>
                                        <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 font-tajawal">{t('showcase_qr_title')}</h4>
                                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                            {t('showcase_qr_desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 bg-white dark:bg-stone-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="emerald" className="mb-3">{t('features_badge')}</Badge>
                        <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-tajawal">{t('features_title')}</h2>
                        <p className="mt-4 text-stone-600 dark:text-stone-400">{t('features_sub')}</p>
                    </div>

                    <div className="mt-14 grid md:grid-cols-2 max-w-4xl mx-auto gap-8">
                        <Card className="border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-lg">{t('feat_qadi_title')}</CardTitle>
                                <CardDescription className="text-sm mt-2">{t('feat_qadi_desc')}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-4">
                                    <QrCode className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-lg">{t('feat_qr_title')}</CardTitle>
                                <CardDescription className="text-sm mt-2">{t('feat_qr_desc')}</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>


            {/* Featured Service Providers Section */}
            {featuredOffices && featuredOffices.length > 0 && (
                <section id="offices" className="py-20 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <Badge variant="emerald" className="mb-3">{t('service_providers')}</Badge>
                            <h2 className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                {t('featured_offices')}
                            </h2>
                            <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm">
                                {t('service_providers_sub')}
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredOffices.map((office) => (
                                <div
                                    key={office.id}
                                    className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg font-tajawal shrink-0">
                                            {office.name?.charAt(0) || 'ع'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-stone-900 dark:text-stone-100 font-tajawal truncate text-base">
                                                {office.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                                                <Building className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{office.city}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                                        {office.phone && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 text-center">📞</span>
                                                <span dir="ltr">{office.phone}</span>
                                            </div>
                                        )}
                                        {office.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 text-center">✉️</span>
                                                <span className="truncate">{office.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800 flex gap-2">
                                        <a
                                            href={office.public_url || `/office/${office.id}`}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" size="sm" className="w-full text-xs">
                                                <ChevronRight className="h-3.5 w-3.5 me-1" />
                                                {t('all_services')}
                                            </Button>
                                        </a>
                                        <a
                                            href={office.public_url ? `${office.public_url}#appointment` : `/office/${office.id}#appointment`}
                                        >
                                            <Button variant="emerald" size="sm" className="text-xs shrink-0">
                                                <Calendar className="h-3.5 w-3.5 me-1" />
                                                {t('appointment_cta')}
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link href="/directory">
                                <Button variant="outline" size="lg" className="font-semibold">
                                    {t('view_all_offices')}
                                    <Arrow className="h-4 w-4 ms-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            <section className="py-20 bg-emerald-950 text-white relative overflow-hidden bg-zellij">
                <div className="absolute inset-0 bg-radial from-transparent via-emerald-950/80 to-emerald-950 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <Badge variant="gold" className="mb-3">{t('testimonials_badge')}</Badge>
                        <h2 className="text-3xl font-extrabold font-tajawal text-white">{t('testimonials_title')}</h2>
                        <p className="mt-3 text-emerald-200/80 text-sm">{t('testimonials_sub')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 backdrop-blur-sm flex flex-col justify-between hover:border-amber-400/40 transition-colors">
                            <div className="space-y-4">
                                <div className="flex text-amber-400 gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed text-emerald-50 italic">
                                    {t('testimony_1_quote')}
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center font-tajawal">
                                    ع.ك
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white font-tajawal">{t('testimony_1_author')}</div>
                                    <div className="text-xs text-emerald-300">{t('testimony_1_role')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-emerald-900/40 border border-amber-400/40 backdrop-blur-sm flex flex-col justify-between shadow-lg shadow-amber-950/20">
                            <div className="space-y-4">
                                <div className="flex text-amber-400 gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed text-emerald-50 italic">
                                    {t('testimony_2_quote')}
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-700 text-amber-300 font-bold flex items-center justify-center font-tajawal">
                                    ن.ب
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white font-tajawal">{t('testimony_2_author')}</div>
                                    <div className="text-xs text-emerald-300">{t('testimony_2_role')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 backdrop-blur-sm flex flex-col justify-between hover:border-amber-400/40 transition-colors">
                            <div className="space-y-4">
                                <div className="flex text-amber-400 gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed text-emerald-50 italic">
                                    {t('testimony_3_quote')}
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center font-tajawal">
                                    ع.ت
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white font-tajawal">{t('testimony_3_author')}</div>
                                    <div className="text-xs text-emerald-300">{t('testimony_3_role')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-20 bg-stone-50 dark:bg-stone-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge variant="emerald" className="mb-3">{t('nav_pricing')}</Badge>
                    <h2 className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">{t('pricing_sub')}</h2>
                    <div className="mt-6 inline-flex p-1 rounded-xl bg-stone-200 dark:bg-stone-800">
                        <button type="button" onClick={() => setBillingCycle('monthly')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${billingCycle === 'monthly' ? 'bg-white dark:bg-stone-900 shadow-xs text-emerald-800 dark:text-emerald-400' : 'text-stone-500'}`}>{t('monthly')}</button>
                        <button type="button" onClick={() => setBillingCycle('yearly')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${billingCycle === 'yearly' ? 'bg-white dark:bg-stone-900 shadow-xs text-emerald-800 dark:text-emerald-400' : 'text-stone-500'}`}>{t('yearly')} ({t('save_two_months')})</button>
                    </div>

                    <div className="mt-12 grid md:grid-cols-3 gap-8 text-start">
                        {plans.map((p) => {
                            const isPro = p.id === 'muhtaraf';
                            const price = billingCycle === 'monthly' ? p.price_monthly : Math.round(p.price_monthly * 10);
                            return (
                                <Card key={p.id} className={`flex flex-col justify-between border-2 ${isPro ? 'border-amber-400 dark:border-amber-500 shadow-xl' : 'border-stone-200 dark:border-stone-800'}`}>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold font-tajawal flex items-center justify-between">
                                            <span>{p.name_ar}</span>
                                            <span className="text-xs text-stone-500 font-normal">{p.name_fr}</span>
                                        </CardTitle>
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">{price}</span>
                                            <span className="text-sm font-semibold text-stone-500">{p.currency} / {billingCycle === 'monthly' ? t('per_month') : t('per_year')}</span>
                                        </div>
                                        <div className="my-6 border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3 text-xs">
                                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span>{p.max_users === 999 ? t('unlimited_users') : t('max_users_limit', { count: p.max_users })}</span></div>
                                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span>{p.max_dossiers === 99999 ? t('unlimited_dossiers') : t('max_dossiers_limit', { count: p.max_dossiers })}</span></div>
                                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span>{p.features?.module_all_docs ? t('all_doc_types') : t('marriage_only')}</span></div>
                                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span>{p.features?.module_pdf_export ? t('pdf_qr_export') : t('basic_export')}</span></div>
                                        </div>
                                    </CardHeader>
                                    <div className="p-6 pt-0">
                                        <Link href={`/register?plan=${p.id}`}>
                                            <Button variant={isPro ? 'gold' : 'outline'} className="w-full font-bold">
                                                <span>{t('choose_plan')}</span>
                                                <Arrow className="h-4 w-4 ms-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Moroccan Legal FAQ Accordion Section */}
            <section id="compliance" className="py-20 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Badge variant="emerald" className="mb-3">{t('faq_badge')}</Badge>
                        <h2 className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                            {t('faq_heading')}
                        </h2>
                        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                            {t('faq_sub')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: t('faq_q1'),
                                a: t('faq_a1'),
                            },
                            {
                                q: t('faq_q2'),
                                a: t('faq_a2'),
                            },
                            {
                                q: t('faq_q3'),
                                a: t('faq_a3'),
                            },
                            {
                                q: t('faq_q4'),
                                a: t('faq_a4'),
                            },
                            {
                                q: t('faq_q5'),
                                a: t('faq_a5'),
                            },
                        ].map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden transition-all bg-stone-50/50 dark:bg-stone-950/50"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-start font-bold font-tajawal text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-center font-mono">
                                                {idx + 1}
                                            </span>
                                            <span className="text-base">{faq.q}</span>
                                        </span>
                                        <ChevronDown
                                            className={`h-5 w-5 text-stone-400 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180 text-emerald-600' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-4 animate-in fade-in duration-200">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact & Creator Section */}
            <section id="contact" className="py-20 bg-stone-50 dark:bg-stone-950">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Badge variant="emerald" className="mb-2">{t('nav_contact')}</Badge>
                        <h2 className="text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                            {t('contact_heading')}
                        </h2>
                        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                            {t('contact_sub')}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Creator Card - AccessPoint IT Taroudant */}
                        <div className="lg:col-span-1 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white border border-emerald-700/60 shadow-2xl space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 end-0 -mt-8 -me-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>{t('creator_title')}</span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black font-tajawal text-white tracking-tight">
                                    AccessPoint IT
                                </h3>
                                <p className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                                    <span>تارودانت — المملكة المغربية</span>
                                </p>
                            </div>

                            <p className="text-xs text-emerald-100/85 leading-relaxed">
                                {t('creator_desc')}
                            </p>

                            <div className="pt-4 border-t border-emerald-800/80 space-y-3.5 text-xs">
                                <div className="flex items-center gap-3 text-emerald-200">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center shrink-0 text-amber-300">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span>تارودانت، جهة سوس ماسة، المغرب</span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-200">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center shrink-0 text-amber-300">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="truncate">support@adoul.accesspoint.ma</span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-200">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center shrink-0 text-amber-300">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <a
                                        href="https://accesspoint.ma"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-amber-300 font-bold hover:underline"
                                    >
                                        www.accesspoint.ma
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2">
                                <a
                                    href="https://accesspoint.ma"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs transition-all shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
                                >
                                    <span>زيارة موقع AccessPoint IT الرسمي</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-stone-200 dark:border-stone-800 shadow-xl">
                                <CardContent className="p-6 sm:p-8">
                                    <form onSubmit={submitContact} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-name">{t('contact_name_label')}</Label>
                                                <Input
                                                    id="contact-name"
                                                    required
                                                    value={contactForm.data.name}
                                                    onChange={(e) => contactForm.setData('name', e.target.value)}
                                                    placeholder={t('contact_name_placeholder')}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-email">{t('email')}</Label>
                                                <Input
                                                    id="contact-email"
                                                    type="email"
                                                    required
                                                    value={contactForm.data.email}
                                                    onChange={(e) => contactForm.setData('email', e.target.value)}
                                                    placeholder="contact@exemple.ma"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact-subject">{t('contact_subject_label')}</Label>
                                            <Input
                                                id="contact-subject"
                                                required
                                                value={contactForm.data.subject}
                                                onChange={(e) => contactForm.setData('subject', e.target.value)}
                                                placeholder={t('contact_subject_placeholder')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact-message">{t('message')}</Label>
                                            <textarea
                                                id="contact-message"
                                                required
                                                rows={4}
                                                value={contactForm.data.message}
                                                onChange={(e) => contactForm.setData('message', e.target.value)}
                                                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder={t('contact_message_placeholder')}
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                size="lg"
                                                disabled={contactForm.processing}
                                                className="px-8 font-bold"
                                            >
                                                <Send className="h-4 w-4 me-2" />
                                                <span>{contactForm.processing ? t('sending') : t('send')}</span>
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="mt-auto bg-emerald-950 text-emerald-300/70 border-t border-emerald-800">
                {/* Footer main columns */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
                    {/* Brand & Creator column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shadow-sm">
                                <Scale className="h-5 w-5 text-amber-300" />
                            </div>
                            <span className="text-lg font-extrabold tracking-tight text-emerald-100 font-tajawal">
                                {t('app_name')}
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-400/70">
                            {t('footer_tagline')}
                        </p>
                        <div className="flex gap-2 pt-1">
                            <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-emerald-900/60 border border-emerald-800 text-emerald-400">
                                <ShieldCheck className="h-3 w-3 text-amber-400" />
                                <span>16.03</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-emerald-900/60 border border-emerald-800 text-emerald-400">
                                <Award className="h-3 w-3 text-amber-400" />
                                <span>051.26</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-emerald-900/80 space-y-1.5 text-xs">
                            <div className="font-bold text-amber-300 flex items-center gap-1.5">
                                <span>تطوير وإشراف: شركة AccessPoint IT</span>
                            </div>
                            <div className="text-emerald-400/80 text-[11px]">
                                تارودانت — سوس ماسة، المملكة المغربية
                            </div>
                            <div className="text-[11px]">
                                <a href="https://accesspoint.ma" target="_blank" rel="noreferrer" className="text-amber-300/90 underline hover:text-amber-200">
                                    www.accesspoint.ma
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">{t('nav_features')}</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#features" className="hover:text-emerald-200 transition-colors">{t('dossiers')}</a></li>
                            <li><a href="#features" className="hover:text-emerald-200 transition-colors">{t('appointments')}</a></li>
                            <li><a href="#features" className="hover:text-emerald-200 transition-colors">{t('inheritance_calculator')}</a></li>
                            <li><a href="#features" className="hover:text-emerald-200 transition-colors">{t('registers')}</a></li>
                            <li><a href="#features" className="hover:text-emerald-200 transition-colors">{t('reports')}</a></li>
                        </ul>
                    </div>

                    {/* Legal & Platform */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">{t('footer_platform')}</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/directory" className="hover:text-emerald-200 transition-colors">{t('nav_directory')}</Link></li>
                            <li><Link href="/register" className="hover:text-emerald-200 transition-colors">{t('register_office')}</Link></li>
                            <li><a href="#pricing" className="hover:text-emerald-200 transition-colors">{t('nav_pricing')}</a></li>
                            <li><a href="#compliance" className="hover:text-emerald-200 transition-colors">{t('nav_law')}</a></li>
                            <li><a href="#contact" className="hover:text-emerald-200 transition-colors">{t('nav_contact')}</a></li>
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">{t('nav_contact')}</h4>
                        <p className="text-xs text-emerald-400/70 leading-relaxed">
                            {t('footer_demo_ask')}
                        </p>
                        <a href="#contact">
                            <Button variant="emerald" size="sm" className="text-xs mt-2 w-full">
                                <Send className="h-3.5 w-3.5 me-2" />
                                {t('send')}
                            </Button>
                        </a>
                        <div className="text-[11px] text-emerald-400/90 mt-4 pt-3 border-t border-emerald-900/80 space-y-1">
                            <div>📧 support@adoul.accesspoint.ma</div>
                            <div>🌐 adoul.accesspoint.ma</div>
                            <div className="text-amber-300/80 text-[10px] font-semibold">📍 تارودانت — المغرب</div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-emerald-900 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
                    <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-start">
                        <span>© {new Date().getFullYear()} {t('footer_legal')}</span>
                        <span className="hidden sm:inline text-emerald-700">•</span>
                        <span className="text-amber-300 font-medium">
                            {t('created_by')}{' '}
                            (<a href="https://accesspoint.ma" target="_blank" rel="noreferrer" className="font-bold underline hover:text-amber-200">accesspoint.ma</a>)
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <span className="text-emerald-800">|</span>
                        <span className="text-emerald-400 font-semibold">{t('morocco')}</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
