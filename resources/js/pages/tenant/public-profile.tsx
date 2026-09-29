import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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
    Scale,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle2,
    Send,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    MessageCircle,
    Stamp,
    Building2,
    Award,
    FileText,
    Search,
    FileCheck2,
    Globe,
    AlertCircle,
    Loader2,
    Lock,
    LayoutDashboard,
    Check,
    ChevronDown,
    ChevronUp,
    Heart,
    Home,
    Users,
    QrCode,
    ExternalLink,
    HelpCircle,
    FileSignature,
    CheckCircle,
    Copy,
    Building,
} from 'lucide-react';
import { SharedProps } from '@/types';

interface OfficeService {
    type: string;
    category?: string;
    title_ar: string;
    title_fr: string;
    desc_ar: string;
    delay_ar?: string;
    badge_ar?: string;
    required_docs_ar?: string[];
}

interface PublicProfileProps {
    tenant: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
    };
    officeSetting: any;
    services: OfficeService[];
}

const FAQ_ITEMS = [
    {
        q_ar: 'ما هي الوثائق المطلوبة لعقد الزواج الشرعي؟',
        q_fr: 'Quelles sont les pièces requises pour un acte de mariage ?',
        a_ar: 'يتطلب عقد الزواج: نسخة كاملة من رسم الولادة (أقل من 3 أشهر) للخطيبين، بطاقة التعريف الوطنية الإلكترونية لهما وللشاهدين، الشهادة الإدارية للخطوبة/العزوبة من السلطة المحلية، الشهادة الطبية للزواج، وإذن القاضي في حالات زواج القاصر أو التعدد أو زواج الأجانب.',
    },
    {
        q_ar: 'كيف يمكن لمغاربة العالم (MRE) إبرام وكالة أو عقد دون الحضور للمغرب؟',
        q_fr: 'Comment les MRE peuvent-ils établir une procuration ou un acte à distance ?',
        a_ar: 'يمكن إعداد نص الوكالة العدلية بدقة بالتنسيق المسبق مع مكتبنا عبر الواتساب والبريد الإلكتروني، وتوقيعها لدى القنصلية المغربية بالخارج، أو توكيل شخص مفوض بالمغرب لإتمام إجراءات البيع، الإراثة، أو استخراج النظائر مع إرسال النسخ الرسمية عبر البريد السريع.',
    },
    {
        q_ar: 'ما هو الفرق بين رسم اللفيف الشرعي والرسم العقاري بالمحافظة؟',
        q_fr: 'Quelle est la différence entre un acte de Lafif et le titre foncier ANCFCC ?',
        a_ar: 'رسم اللفيف الشرعي (المحرر بحضور 12 شاهداً) يثبت أصل الملكية الشرعية والحيازة الهادئة والتصرف للعقارات غير المحفظة. بينما الرسم العقاري صادر عن المحافظة العقارية (ANCFCC) ويمنح حجية قطعية لا تقبل الطعن. ورسم اللفيف يعتبر وثيقة أساسية لطلب التحفيظ العقاري.',
    },
    {
        q_ar: 'ما هي المدة الزمنية لمخاطبة قاضي التوثيق (الخطاب والتأشير)؟',
        q_fr: 'Quel est le délai pour le Khitab du Qadi de Tawthiq ?',
        a_ar: 'بمجرد إتمام الإشهاد وتوقيع الأطراف والعدلين واستخلاص الرسوم، يودع المحرر بكتابة ضبط المحكمة الابتدائية قسم قضاء الأسرة، ويتم الخطاب عليه عادة خلال 24 إلى 72 ساعة ليصبح وثيقة رسمية تنفيذية نافذة.',
    },
    {
        q_ar: 'كيف يمكنني استخراج نظير رسمي من عقد ضائع أو قديم؟',
        q_fr: 'Comment obtenir une expédition certifiée conforme d\'un ancien acte ?',
        a_ar: 'يمكنكم تقديم طلب عبر بوابة المكتب (تبويب "طلب نظير") مع تحديد نوع المحرر وسنة الإبرام وأسماء الأطراف. نقوم بالرجوع إلى كناش التضمين وسجلات المحكمة لاستخراج النظير وتسليمه لكم أو إرساله بريدياً لمغاربة العالم.',
    },
];

export default function PublicOfficeProfile({ tenant, officeSetting, services = [] }: PublicProfileProps) {
    const { t, isRtl } = useLanguage();
    const { flash, auth } = usePage<SharedProps>().props;

    const today = new Date().toISOString().split('T')[0];

    // Interactive Citizen Suite active tab
    const [activeTab, setActiveTab] = useState<'appointment' | 'copy' | 'track' | 'verify'>('appointment');

    // Service catalog category filter
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedServiceType, setExpandedServiceType] = useState<string | null>(null);

    // FAQ Accordion State
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    // Check if Office is currently open in Moroccan Time
    const isOpenNow = useMemo(() => {
        try {
            const now = new Date();
            const day = now.getDay(); // 0 is Sunday, 6 is Saturday
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentTotalMin = hours * 60 + minutes;

            if (day === 0) return false; // Sunday closed
            if (day === 6) {
                // Saturday 09:00 - 13:00
                return currentTotalMin >= 9 * 60 && currentTotalMin <= 13 * 60;
            }
            // Monday to Friday: 08:30 - 17:00
            return currentTotalMin >= 8 * 60 + 30 && currentTotalMin <= 17 * 60;
        } catch {
            return true;
        }
    }, []);

    // Filtered services
    const filteredServices = useMemo(() => {
        if (selectedCategory === 'all') return services;
        return services.filter((s) => s.category === selectedCategory || s.type === selectedCategory);
    }, [services, selectedCategory]);

    // Appointment Form
    const apptForm = useForm({
        client_name: '',
        client_phone: '',
        client_email: '',
        type: 'marriage',
        preferred_date: today,
        notes: '',
    });

    const submitAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
        const url = isCentralPath ? `/office/${tenant.id}/appointment` : '/appointment-request';
        apptForm.post(url, {
            onSuccess: () => {
                apptForm.reset();
            },
        });
    };

    // Copy / Extract Request Form (Citizens & MRE)
    const copyForm = useForm({
        applicant_name: '',
        applicant_cin: '',
        applicant_phone: '',
        applicant_email: '',
        act_type: 'marriage',
        act_year: '',
        parties_names: '',
        delivery_mode: 'pickup',
        country_city: '',
        notes: '',
    });

    const submitCopyRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
        const url = isCentralPath ? `/office/${tenant.id}/copy-request` : '/copy-request';
        copyForm.post(url, {
            onSuccess: () => copyForm.reset(),
        });
    };

    // Dossier Tracking State
    const [trackRef, setTrackRef] = useState('');
    const [trackCin, setTrackCin] = useState('');
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [trackResult, setTrackResult] = useState<any>(null);

    const handleTrackDossier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackRef.trim()) return;
        setTrackLoading(true);
        setTrackError(null);
        setTrackResult(null);

        try {
            const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
            const trackUrl = isCentralPath ? `/office/${tenant.id}/track-dossier` : '/track-dossier';
            const res = await axios.post(trackUrl, {
                reference: trackRef.trim(),
                cin: trackCin.trim(),
            });

            if (res.data?.success && res.data?.dossier) {
                setTrackResult(res.data.dossier);
            } else {
                setTrackError(res.data?.message || 'تعذر العثور على الملف بالرقم المرجعي المدخل.');
            }
        } catch (err: any) {
            setTrackError(
                err?.response?.data?.message ||
                'تعذر استرداد بيانات الملف. يرجى التحقق من الرقم المرجعي أو التواصل مع كتابة المكتب.'
            );
        } finally {
            setTrackLoading(false);
        }
    };

    // Direct Act Verification State
    const [verifyRef, setVerifyRef] = useState('');

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyRef.trim()) return;
        window.location.href = `/verify/${encodeURIComponent(verifyRef.trim())}`;
    };

    // Quick book helper for services
    const handleBookForService = (serviceType: string) => {
        apptForm.setData('type', serviceType);
        setActiveTab('appointment');
        const element = document.getElementById('citizen-suite-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const officeName = officeSetting?.office_name_ar || tenant.name;
    const adoulName = officeSetting?.adoul_name || 'الأستاذ العدل المحلف';
    const courtName = officeSetting?.court_name || 'المحكمة الابتدائية - قسم قضاء الأسرة وقضاء التوثيق';
    const city = officeSetting?.city || tenant.city;
    const phone = officeSetting?.phone || tenant.phone;
    const whatsapp = officeSetting?.whatsapp_number || phone;
    const email = officeSetting?.email || tenant.email;
    const address = officeSetting?.address || 'شارع محمد الخامس، عمارة التوثيق';

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            <Head>
                <title>{`${officeName} — فضاء المواطن والتوثيق العدلي الرسمي`}</title>
                <meta
                    name="description"
                    content={`البوابة الإلكترونية الرسمية لمكتب العدل ${adoulName} بمدينة ${city}. حجز المواعيد، تتبع الإجراءات، طلب النظائر لمغاربة العالم، واستشارات توثيقية معتمدة.`}
                />
            </Head>

            <FlashBanner flash={flash} />

            {/* Backoffice Admin Mode Banner */}
            {auth?.user && (
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-emerald-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-emerald-700/60 sticky top-0 z-50 shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-bold text-amber-300 font-tajawal text-xs sm:text-sm">
                            أنت تعاين الآن الواجهة العامة المخصصة للمواطنين والموكلين
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm cursor-pointer"
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            <span>العودة إلى لوحة تحكم المكتب</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Top Official Morocco Compliance Bar */}
            <div className="bg-emerald-950 text-emerald-200/90 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                            <Scale className="h-3 w-3" />
                            المملكة المغربية • وزارة العدل
                        </span>
                        <span className="text-emerald-500 hidden md:inline">•</span>
                        <span className="hidden md:inline text-emerald-300">
                            {courtName}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                            <span>{isOpenNow ? 'المكتب مفتوح لاستقبالكم' : 'خارج أوقات العمل • الحجز متاح 24/7'}</span>
                        </div>
                        <span className="text-emerald-500">•</span>
                        <a href={`tel:${phone}`} dir="ltr" className="hover:text-amber-300 transition-colors font-mono font-bold">
                            {phone}
                        </a>
                    </div>
                </div>
            </div>

            {/* Sticky Modern Floating Header */}
            <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3.5">
                        {officeSetting?.logo_path ? (
                            <img
                                src={officeSetting.logo_path}
                                alt={officeName}
                                className="h-12 w-12 object-contain rounded-2xl border border-stone-200 dark:border-stone-800 p-1.5 bg-white shadow-sm"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-emerald-700 text-white shadow-md flex items-center justify-center border border-emerald-600/30">
                                <Scale className="h-6 w-6 text-amber-300" />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-300 font-tajawal">
                                    {officeName}
                                </span>
                                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] border border-amber-300/40 hidden sm:inline-flex">
                                    عدل محلف
                                </Badge>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                {adoulName} • دائرة نفوذ {city}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
                        <a href="#services-section" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                            الخدمات التوثيقية
                        </a>
                        <a href="#roadmap-section" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                            مسار المعاملة
                        </a>
                        <a href="#mre-section" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                            <span>مغاربة العالم MRE</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        </a>
                        <a href="#faq-section" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                            الأسئلة الشائعة
                        </a>
                        <a href="#contact-section" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                            موقع المكتب والتواصل
                        </a>
                    </nav>

                    {/* Header Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="emerald"
                            size="sm"
                            onClick={() => {
                                setActiveTab('appointment');
                                const el = document.getElementById('citizen-suite-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-600/20"
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>حجز موعد فوري</span>
                        </Button>

                        <div className="h-5 w-px bg-stone-300 dark:bg-stone-800 hidden sm:block"></div>

                        <LanguageSelector />
                        <ThemeToggle />

                        <Link
                            href="/login"
                            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:border-emerald-500/40 transition-all cursor-pointer"
                            title="ولوج فضاء العدل وكتابة المكتب"
                        >
                            <Lock className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO SECTION WITH DYNAMIC GRADIENTS & PRESTIGIOUS ZEILIJ */}
            <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 text-white bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-950">
                {/* Ambient Glow Orbs */}
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-10 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Subtle Geometric Overlay */}
                <div className="absolute inset-0 bg-zellij opacity-30 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text Column */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
                            {/* Trust Pill */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-800/70 border border-emerald-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-sm"
                            >
                                <Sparkles className="h-4 w-4 text-amber-400" />
                                <span>مكتب توثيق عدلي معتمد • اختصاص قضائي وشرعي بالمملكة المغربية</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-3xl sm:text-5xl lg:text-6xl font-black font-tajawal tracking-tight leading-tight sm:leading-tight"
                            >
                                الأصالة في <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent">التوثيق</span>،{' '}
                                والريادة في <span className="text-emerald-300">الخدمات الرقمية</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-emerald-100/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
                            >
                                نضع بين أيديكم خبرتنا التوثيقية لإبرام كافة الرسوم الشرعية، المعاملات العقارية، والفرائض وقسمة التركات طبقاً لمقتضيات القانون المغربي رقم 16.03 المنظم لخطة العدالة ومدونة الأسرة.
                            </motion.p>

                            {/* Dual CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4"
                            >
                                <Button
                                    size="lg"
                                    variant="emerald"
                                    onClick={() => {
                                        setActiveTab('appointment');
                                        const el = document.getElementById('citizen-suite-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-7 py-3.5 text-sm font-bold shadow-xl shadow-emerald-950/50 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/30"
                                >
                                    <Calendar className="h-4 w-4 me-2 text-amber-300" />
                                    <span>حجز موعد استشارة أو إبرام عقد</span>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => {
                                        setActiveTab('track');
                                        const el = document.getElementById('citizen-suite-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-6 py-3.5 text-sm font-bold rounded-2xl border-emerald-600/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-white backdrop-blur-md"
                                >
                                    <Search className="h-4 w-4 me-2 text-amber-300" />
                                    <span>تتبع مسار ملفك ومخاطبة القاضي</span>
                                </Button>

                                {whatsapp && (
                                    <a
                                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار حول إبرام عقد لدى مكتبكم الموقر.')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-800/60 hover:bg-emerald-700/80 text-white font-bold text-xs border border-emerald-500/30 backdrop-blur-md transition-all shadow-md"
                                    >
                                        <MessageCircle className="h-4 w-4 text-emerald-400" />
                                        <span>تواصل واتساب فوري</span>
                                    </a>
                                )}
                            </motion.div>

                            {/* Trust Features Badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-start border-t border-emerald-800/60"
                            >
                                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/30 backdrop-blur-xs">
                                    <ShieldCheck className="h-5 w-5 text-amber-400 mb-1" />
                                    <div className="font-bold text-white text-xs">حجية رسمية</div>
                                    <div className="text-[10px] text-emerald-200/80">نافذة بقوة القانون</div>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/30 backdrop-blur-xs">
                                    <Stamp className="h-5 w-5 text-amber-400 mb-1" />
                                    <div className="font-bold text-white text-xs">خطاب القاضي</div>
                                    <div className="text-[10px] text-emerald-200/80">تأشير وتضمين فوري</div>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/30 backdrop-blur-xs">
                                    <Globe className="h-5 w-5 text-amber-400 mb-1" />
                                    <div className="font-bold text-white text-xs">مغاربة العالم</div>
                                    <div className="text-[10px] text-emerald-200/80">إرسال دولي للنظائر</div>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/30 backdrop-blur-xs">
                                    <Clock className="h-5 w-5 text-amber-400 mb-1" />
                                    <div className="font-bold text-white text-xs">مواعيد مضبوطة</div>
                                    <div className="text-[10px] text-emerald-200/80">استقبال دون انتظار</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Hero Quick Spotlight Card */}
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-stone-900/90 to-stone-950/90 border-2 border-amber-400/30 shadow-2xl backdrop-blur-xl text-stone-100"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-amber-400 font-bold">بطاقة تعريف المكتب</div>
                                            <div className="text-sm font-bold font-tajawal text-white">{adoulName}</div>
                                        </div>
                                    </div>
                                    {officeSetting?.license_number && (
                                        <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-300">
                                            {officeSetting.license_number}
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-5 space-y-3.5 text-xs">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/50 border border-stone-700/40">
                                        <Building2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <div>
                                            <span className="text-stone-400 block text-[10px]">المقر والمحكمة المشرفة:</span>
                                            <span className="font-semibold text-stone-200">{courtName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/50 border border-stone-700/40">
                                        <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <div>
                                            <span className="text-stone-400 block text-[10px]">العنوان الدقيق:</span>
                                            <span className="font-semibold text-stone-200">{address} — {city}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/50 border border-stone-700/40">
                                        <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <div>
                                            <span className="text-stone-400 block text-[10px]">ساعات استقبال العموم:</span>
                                            <span className="font-semibold text-stone-200">الإثنين - الجمعة: 08:30 إلى 17:00 | السبت: 09:00 إلى 13:00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct QR Verification Strip */}
                                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-stone-900 border border-emerald-500/30 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="h-5 w-5 text-amber-400" />
                                            <div>
                                                <div className="font-bold text-white">التحقق الفوري من صحة المحرر</div>
                                                <div className="text-[10px] text-stone-400">تأكد من توقيع العدل وخاتم المحكمة الرسمي</div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setActiveTab('verify');
                                                const el = document.getElementById('citizen-suite-section');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-[11px] h-8 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-400/40"
                                        >
                                            تحقق الآن
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CITIZEN INTERACTIVE SUITE: APPOINTMENT, COPY, TRACK & VERIFY */}
            <section id="citizen-suite-section" className="relative -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30 pb-16">
                <Card className="rounded-3xl border-2 border-stone-200/90 dark:border-stone-800 shadow-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl overflow-hidden">
                    {/* Modern Tabs Navigation Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 p-2 bg-stone-100/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 gap-1 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('appointment')}
                            className={`py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'appointment'
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-white/50 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>طلب موعد رسمي</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('copy')}
                            className={`py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'copy'
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-white/50 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <Copy className="h-4 w-4" />
                            <span>طلب نظير (مواطنون & MRE)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('track')}
                            className={`py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'track'
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-white/50 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <Search className="h-4 w-4" />
                            <span>تتبع مسار الملف</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('verify')}
                            className={`py-3 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'verify'
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'text-stone-600 dark:text-stone-300 hover:bg-white/50 dark:hover:bg-stone-700/50'
                            }`}
                        >
                            <QrCode className="h-4 w-4" />
                            <span>التحقق من صحة رسم</span>
                        </button>
                    </div>

                    <div className="p-6 sm:p-8">
                        <AnimatePresence mode="wait">
                            {/* TAB 1: APPOINTMENT REQUEST */}
                            {activeTab === 'appointment' && (
                                <motion.div
                                    key="appointment"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-4xl mx-auto"
                                >
                                    <div className="text-center max-w-xl mx-auto mb-8">
                                        <Badge variant="emerald" className="mb-2">حجز إلكتروني مسبق</Badge>
                                        <h3 className="text-2xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                            حجز موعد استشارة أو إبرام رسم بالمكتب
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                                            املأ الاستمارة وسيتصل بكم كاتب المكتب لتأكيد التاريخ والساعة وتحضير الوثائق المطلوبة
                                        </p>
                                    </div>

                                    <form onSubmit={submitAppointment} className="space-y-5 text-xs">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-name" className="font-bold">الاسم الكامل للمرتفق(ة) *</Label>
                                                <Input
                                                    id="b-name"
                                                    value={apptForm.data.client_name}
                                                    onChange={(e) => apptForm.setData('client_name', e.target.value)}
                                                    placeholder="مثال: ذ. عبد الرحيم العلمي"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-phone" className="font-bold">رقم الهاتف للتواصل *</Label>
                                                <Input
                                                    id="b-phone"
                                                    value={apptForm.data.client_phone}
                                                    onChange={(e) => apptForm.setData('client_phone', e.target.value)}
                                                    placeholder="06XXXXXXXX أو +33 6..."
                                                    dir="ltr"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-email" className="font-bold">البريد الإلكتروني (اختياري)</Label>
                                                <Input
                                                    id="b-email"
                                                    type="email"
                                                    value={apptForm.data.client_email}
                                                    onChange={(e) => apptForm.setData('client_email', e.target.value)}
                                                    placeholder="client@domaine.ma"
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-type" className="font-bold">نوع الرسم أو الخدمة *</Label>
                                                <select
                                                    id="b-type"
                                                    value={apptForm.data.type}
                                                    onChange={(e) => apptForm.setData('type', e.target.value)}
                                                    className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                                                    required
                                                >
                                                    <option value="marriage">عقد زواج شرعي</option>
                                                    <option value="property_sale">معاملة أو بيع عقاري</option>
                                                    <option value="will">إراثة شرعية / فريضة / وصية</option>
                                                    <option value="mulkiya_lafif">شهادة ملكية أو لفيف شرعي (12 شاهداً)</option>
                                                    <option value="poa">وكالة رسمية خاصة أو عامة</option>
                                                    <option value="divorce">إشهاد طلاق أو رجعة شرعية</option>
                                                    <option value="donation">عقد هبة أو صدقة</option>
                                                    <option value="tarakah_qisma">قسمة رضائية للتركة</option>
                                                    <option value="consultation">استشارة قانونية وتوثيقية</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-date" className="font-bold">التاريخ المرغوب فيه للحضور *</Label>
                                                <Input
                                                    id="b-date"
                                                    type="date"
                                                    min={today}
                                                    value={apptForm.data.preferred_date}
                                                    onChange={(e) => apptForm.setData('preferred_date', e.target.value)}
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="b-notes" className="font-bold">تفاصيل أو استفسارات إضافية حول العقد</Label>
                                            <textarea
                                                id="b-notes"
                                                rows={3}
                                                value={apptForm.data.notes}
                                                onChange={(e) => apptForm.setData('notes', e.target.value)}
                                                placeholder="أذكر هنا طبيعة العقار، أسماء الأطراف، أو أية وثائق تود التأكد من توفرها قبل القدوم..."
                                                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3 text-xs focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-900"
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                            <p className="text-[11px] text-stone-500">
                                                * الموعد يبقى مبدئياً ريثما يتم تأكيده هاتفياً من كتابة المكتب لضمان حضور العدلين.
                                            </p>
                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                size="lg"
                                                className="px-8 rounded-xl font-bold shadow-lg"
                                                disabled={apptForm.processing}
                                            >
                                                <Send className="h-4 w-4 me-2" />
                                                <span>{apptForm.processing ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال طلب الموعد'}</span>
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* TAB 2: COPY / EXTRACT REQUEST (MRE FRIENDLY) */}
                            {activeTab === 'copy' && (
                                <motion.div
                                    key="copy"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-4xl mx-auto"
                                >
                                    <div className="text-center max-w-xl mx-auto mb-8">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-300">
                                            <Globe className="h-3.5 w-3.5" />
                                            <span>خدمة سريعة للمواطنين ومغاربة العالم (MRE)</span>
                                        </div>
                                        <h3 className="text-2xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                            طلب استخراج نظير أو نسخة رسمية مطابقة للأصل
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                                            استخراج نسخ المحررات والرسوم العدلية المحفوظة بكناش التضمين مع إمكانية التوصيل الدولي
                                        </p>
                                    </div>

                                    <form onSubmit={submitCopyRequest} className="space-y-5 text-xs">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-name" className="font-bold">الاسم الكامل للطالب(ة) *</Label>
                                                <Input
                                                    id="c-name"
                                                    value={copyForm.data.applicant_name}
                                                    onChange={(e) => copyForm.setData('applicant_name', e.target.value)}
                                                    placeholder="الاسم العائلي والشخصي"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-cin" className="font-bold">رقم البطاقة الوطنية أو جواز السفر *</Label>
                                                <Input
                                                    id="c-cin"
                                                    value={copyForm.data.applicant_cin}
                                                    onChange={(e) => copyForm.setData('applicant_cin', e.target.value)}
                                                    placeholder="AB123456 / C123456"
                                                    dir="ltr"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-phone" className="font-bold">رقم الهاتف للتواصل *</Label>
                                                <Input
                                                    id="c-phone"
                                                    value={copyForm.data.applicant_phone}
                                                    onChange={(e) => copyForm.setData('applicant_phone', e.target.value)}
                                                    placeholder="+33 6... أو 06..."
                                                    dir="ltr"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-type" className="font-bold">نوع المحرر المطلوب استخراجه *</Label>
                                                <select
                                                    id="c-type"
                                                    value={copyForm.data.act_type}
                                                    onChange={(e) => copyForm.setData('act_type', e.target.value)}
                                                    className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                                                    required
                                                >
                                                    <option value="marriage">رسم عقد زواج</option>
                                                    <option value="property_sale">رسم شراء أو بيع عقاري</option>
                                                    <option value="will">رسم إراثة شرعية أو وصية</option>
                                                    <option value="mulkiya_lafif">رسم ملكية أو لفيف شرعي</option>
                                                    <option value="poa">وكالة عدلية خاصة أو عامة</option>
                                                    <option value="divorce">رسم طلاق أو رجعة</option>
                                                    <option value="other">رسم أو إشهاد عدلي آخر</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-year" className="font-bold">سنة أو تاريخ الإبرام التقريبي</Label>
                                                <Input
                                                    id="c-year"
                                                    value={copyForm.data.act_year}
                                                    onChange={(e) => copyForm.setData('act_year', e.target.value)}
                                                    placeholder="مثال: 2018 أو 1999"
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-delivery" className="font-bold">طريقة الاستلام المفضلة *</Label>
                                                <select
                                                    id="c-delivery"
                                                    value={copyForm.data.delivery_mode}
                                                    onChange={(e) => copyForm.setData('delivery_mode', e.target.value)}
                                                    className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                                                    required
                                                >
                                                    <option value="pickup">سحب مباشر من مكتب العدل</option>
                                                    <option value="postal_mre">إرسالية بريدية دولية معتمدة (MRE)</option>
                                                    <option value="email_scan">نسخة رقمية أولية عبر البريد الإلكتروني</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-parties" className="font-bold">أسماء أطراف العقد الأصليين *</Label>
                                                <Input
                                                    id="c-parties"
                                                    value={copyForm.data.parties_names}
                                                    onChange={(e) => copyForm.setData('parties_names', e.target.value)}
                                                    placeholder="مثال: الزوج أحمد والزوجة فاطمة، أو البائع والمشتري"
                                                    className="h-11 rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-country" className="font-bold">بلد ومدينة الإقامة الحالية</Label>
                                                <Input
                                                    id="c-country"
                                                    value={copyForm.data.country_city}
                                                    onChange={(e) => copyForm.setData('country_city', e.target.value)}
                                                    placeholder="مثال: فرنسا - باريس / إسبانيا - مدريد / الدار البيضاء"
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="c-notes" className="font-bold">مراجع إضافية (أرقام التضمين، مذكرة الحفظ، أو تفاصيل العقار)</Label>
                                            <textarea
                                                id="c-notes"
                                                rows={2}
                                                value={copyForm.data.notes}
                                                onChange={(e) => copyForm.setData('notes', e.target.value)}
                                                placeholder="أية معلومات تسهل البحث في أرشيف المكتب وسجلات المحكمة..."
                                                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-3 text-xs focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-900"
                                            />
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                            <p className="text-[11px] text-stone-500">
                                                * تسليم النظائر يخضع للتأكد من صفة الطالب القانونية لحماية خصوصية الأطراف طبقاً للقانون.
                                            </p>
                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                size="lg"
                                                className="px-8 rounded-xl font-bold shadow-lg"
                                                disabled={copyForm.processing}
                                            >
                                                <Send className="h-4 w-4 me-2" />
                                                <span>{copyForm.processing ? 'جاري إرسال الطلب...' : 'إرسال طلب استخراج النظير'}</span>
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* TAB 3: LIVE DOSSIER TRACKING */}
                            {activeTab === 'track' && (
                                <motion.div
                                    key="track"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-3xl mx-auto"
                                >
                                    <div className="text-center max-w-xl mx-auto mb-8">
                                        <Badge variant="emerald" className="mb-2">تتبع لحظي شفاف</Badge>
                                        <h3 className="text-2xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                            تتبع مسار ملفك ومخاطبة السيد قاضي التوثيق
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                                            أدخل الرقم المرجعي المسلم لكم للاطلاع المباشر على المرحلة الحالية وتاريخ التأشير القضائي
                                        </p>
                                    </div>

                                    {!trackResult ? (
                                        <form onSubmit={handleTrackDossier} className="space-y-4 max-w-lg mx-auto text-xs">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="t-ref" className="font-bold">الرقم المرجعي للملف العدلي *</Label>
                                                <Input
                                                    id="t-ref"
                                                    value={trackRef}
                                                    onChange={(e) => setTrackRef(e.target.value)}
                                                    placeholder="مثال: DOS-2026-00001 أو 00001"
                                                    dir="ltr"
                                                    className="h-12 rounded-xl text-sm font-mono"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="t-cin" className="font-bold">رقم بطاقة التعريف الوطنية (لحماية الخصوصية)</Label>
                                                <Input
                                                    id="t-cin"
                                                    value={trackCin}
                                                    onChange={(e) => setTrackCin(e.target.value)}
                                                    placeholder="رقم بطاقة أحد أطراف العقد (اختياري)"
                                                    dir="ltr"
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>

                                            {trackError && (
                                                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-2.5 text-xs">
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <span>{trackError}</span>
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                size="lg"
                                                className="w-full h-12 rounded-xl font-bold shadow-md"
                                                disabled={trackLoading}
                                            >
                                                {trackLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                                        <span>جاري البحث في سجلات المكتب...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="h-4 w-4 me-2" />
                                                        <span>تتبع مسار المحرر</span>
                                                    </>
                                                )}
                                            </Button>

                                            <p className="text-[11px] text-stone-400 text-center">
                                                تجدون الرقم المرجعي في وصل الإيداع المسلم لكم أو في الإشعار المرسل لهاتفكم.
                                            </p>
                                        </form>
                                    ) : (
                                        /* TRACKING RESULTS DISPLAY */
                                        <div className="space-y-6">
                                            {/* Dossier Card Header */}
                                            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-xs text-stone-500 block">الرقم المرجعي:</span>
                                                        <span className="font-mono text-base font-extrabold text-emerald-900 dark:text-emerald-300">
                                                            {trackResult.reference}
                                                        </span>
                                                    </div>
                                                    <Badge variant="emerald" className="text-xs px-3 py-1">
                                                        {trackResult.type_label}
                                                    </Badge>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 grid sm:grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-stone-500">أطراف العقد: </span>
                                                        <span className="font-semibold text-stone-800 dark:text-stone-200">{trackResult.parties_masked}</span>
                                                    </div>
                                                    {trackResult.act_date && (
                                                        <div>
                                                            <span className="text-stone-500">تاريخ التحرير: </span>
                                                            <span className="font-semibold text-stone-800 dark:text-stone-200">{trackResult.act_date}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Qadi Homologation Status Banner */}
                                            {trackResult.qadi_reference ? (
                                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 flex items-center gap-3">
                                                    <Stamp className="h-7 w-7 text-amber-600 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-sm">تم خطاب السيد قاضي التوثيق بالمحكمة المختصة</div>
                                                        <div className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                                                            رقم الخطاب: <span className="font-mono font-bold">{trackResult.qadi_reference}</span> {trackResult.qadi_validation_date ? `بتاريخ ${trackResult.qadi_validation_date}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center gap-3">
                                                    <Clock className="h-6 w-6 text-stone-400 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-xs">الملف في طور استيفاء الإجراءات وإيداع المحكمة</div>
                                                        <div className="text-[11px] text-stone-500 mt-0.5">
                                                            سيتم إشعاركم فور تأشير وخطاب السيد قاضي التوثيق على الرسم.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pipeline Stages */}
                                            <div className="space-y-3 pt-2">
                                                <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                                                    مراحل الإجراءات ومسار الرسم التوثيقي:
                                                </h4>

                                                <div className="space-y-3">
                                                    {trackResult.stages.map((stage: any) => {
                                                        const isCompleted = stage.state === 'completed';
                                                        const isCurrent = stage.state === 'current';

                                                        return (
                                                            <div
                                                                key={stage.step}
                                                                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                                                                    isCompleted
                                                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                                                                        : isCurrent
                                                                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-sm ring-2 ring-amber-400/20'
                                                                        : 'bg-stone-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-60'
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                                                                        isCompleted
                                                                            ? 'bg-emerald-600 text-white'
                                                                            : isCurrent
                                                                            ? 'bg-amber-500 text-white animate-pulse'
                                                                            : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stage.step}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 font-tajawal">
                                                                            {stage.name_ar}
                                                                        </h5>
                                                                        <span
                                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                                                isCompleted
                                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                                                                    : isCurrent
                                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                                                                    : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                                                            }`}
                                                                        >
                                                                            {isCompleted ? 'تم بنجاح' : isCurrent ? 'المرحلة الجارية' : 'في الانتظار'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                                                                        {stage.desc_ar}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setTrackResult(null);
                                                        setTrackRef('');
                                                        setTrackCin('');
                                                    }}
                                                    className="w-full text-xs rounded-xl"
                                                >
                                                    البحث عن ملف آخر
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* TAB 4: DIRECT QR & REFERENCE VERIFICATION */}
                            {activeTab === 'verify' && (
                                <motion.div
                                    key="verify"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-2xl mx-auto text-center"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 border border-emerald-300 dark:border-emerald-800">
                                        <QrCode className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                        التحقق الفوري من صحة وموثوقية الرسم
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 max-w-md mx-auto">
                                        أدخل الرمز أو الرقم المرجعي الموجود أسفل المحرر أو جانب رمز الاستجابة السريعة (QR) للتأكد من سلامة التوقيعات والخطاب القضائي.
                                    </p>

                                    <form onSubmit={handleVerifySubmit} className="mt-6 space-y-4 max-w-md mx-auto">
                                        <div className="space-y-1.5 text-start">
                                            <Label htmlFor="v-ref" className="font-bold text-xs">الرقم المرجعي للعقد أو الوثيقة *</Label>
                                            <Input
                                                id="v-ref"
                                                value={verifyRef}
                                                onChange={(e) => setVerifyRef(e.target.value)}
                                                placeholder="مثال: DOS-2026-00001 أو ACT-..."
                                                dir="ltr"
                                                className="h-12 rounded-xl text-sm font-mono text-center"
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="emerald"
                                            size="lg"
                                            className="w-full h-12 rounded-xl font-bold shadow-md"
                                        >
                                            <ShieldCheck className="h-4 w-4 me-2 text-amber-300" />
                                            <span>فحص ومطابقة الوثيقة الرسمية</span>
                                        </Button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </section>

            {/* SERVICES ENCYCLOPEDIA & REQUIRED DOCUMENTS CHECKLIST */}
            <section id="services-section" className="py-16 sm:py-20 bg-stone-100/70 dark:bg-stone-900/50 border-y border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                        <div>
                            <Badge variant="emerald" className="mb-2">دليل المحررات الشرعية والمدنية</Badge>
                            <h2 className="text-2xl sm:text-4xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                اختصاصات وخدمات المكتب المعتمدة
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
                                جميع العقود تنجز بحضور شاهدي عدل ويتم تضمينها ومخاطبة السيد قاضي التوثيق عليها بالمحكمة الابتدائية المختصة.
                            </p>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            {[
                                { id: 'all', label: 'كافة الخدمات' },
                                { id: 'family', label: 'الأسرة والزواج' },
                                { id: 'property', label: 'العقارات والبيوع' },
                                { id: 'inheritance', label: 'التركات والفرائض' },
                                { id: 'lafif', label: 'اللفيف والملكيات' },
                                { id: 'powers', label: 'الوكالات الرسمية' },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'bg-emerald-800 text-white shadow-xs'
                                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Services Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((svc) => {
                            const isExpanded = expandedServiceType === svc.type;

                            return (
                                <Card
                                    key={svc.type}
                                    className="rounded-3xl border border-stone-200 dark:border-stone-800/80 hover:border-emerald-500/80 transition-all hover:shadow-xl bg-white dark:bg-stone-900 flex flex-col justify-between overflow-hidden"
                                >
                                    <CardHeader className="p-6">
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                                                {svc.category === 'family' ? (
                                                    <Heart className="h-5 w-5" />
                                                ) : svc.category === 'property' ? (
                                                    <Home className="h-5 w-5" />
                                                ) : svc.category === 'inheritance' ? (
                                                    <Scale className="h-5 w-5" />
                                                ) : svc.category === 'lafif' ? (
                                                    <Users className="h-5 w-5" />
                                                ) : (
                                                    <FileSignature className="h-5 w-5" />
                                                )}
                                            </div>
                                            {svc.badge_ar && (
                                                <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-700 dark:text-emerald-300">
                                                    {svc.badge_ar}
                                                </Badge>
                                            )}
                                        </div>

                                        <CardTitle className="text-base sm:text-lg font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
                                            {svc.title_ar}
                                        </CardTitle>
                                        <div className="text-[11px] text-stone-400 font-sans">{svc.title_fr}</div>

                                        <CardDescription className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed line-clamp-3">
                                            {svc.desc_ar}
                                        </CardDescription>

                                        {svc.delay_ar && (
                                            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>المدة المقدرة: {svc.delay_ar}</span>
                                            </div>
                                        )}

                                        {/* Expandable Required Docs Checklist */}
                                        {svc.required_docs_ar && svc.required_docs_ar.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedServiceType(isExpanded ? null : svc.type)}
                                                    className="flex items-center justify-between w-full font-bold text-emerald-800 dark:text-emerald-300 text-xs cursor-pointer hover:underline"
                                                >
                                                    <span>الوثائق والمستندات المطلوبة ({svc.required_docs_ar.length})</span>
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.ul
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mt-2.5 space-y-1.5 text-[11px] text-stone-600 dark:text-stone-400 overflow-hidden"
                                                        >
                                                            {svc.required_docs_ar.map((doc, idx) => (
                                                                <li key={idx} className="flex items-start gap-1.5">
                                                                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                                    <span>{doc}</span>
                                                                </li>
                                                            ))}
                                                        </motion.ul>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </CardHeader>

                                    <CardContent className="p-6 pt-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBookForService(svc.type)}
                                            className="w-full rounded-xl text-xs font-bold hover:bg-emerald-700 hover:text-white transition-all"
                                        >
                                            <Calendar className="h-3.5 w-3.5 me-1.5" />
                                            <span>حجز موعد لهذا المحرر</span>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PROCEDURAL ROADMAP: HOW A MOROCCAN ADOUL ACT IS COMPLETED */}
            <section id="roadmap-section" className="py-16 sm:py-20 bg-white dark:bg-stone-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <Badge variant="emerald" className="mb-2">الشفافية والمسار القانوني</Badge>
                        <h2 className="text-2xl sm:text-4xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                            كيف تسير معاملتكم من الاستقبال إلى تسليم النظير؟
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
                            خطوات مضبوطة طبقاً لقانون خطة العدالة 16.03 ومدونة الأسرة والحقوق العينية
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                step: '01',
                                title: 'طلب الموعد وتدقيق الوثائق',
                                desc: 'استقبال الأطراف أو طلبهم إلكترونياً، والتحقق من الأهلية وخلو الأطراف من موانع التعاقد مع مراجعة الشواهد الإدارية والطبية.',
                                icon: Calendar,
                            },
                            {
                                step: '02',
                                title: 'التسويد والتدوين بمذكرة الحفظ',
                                desc: 'تحرير نص الرسم الشرعي، وقراءته على الحاضرين، وتوقيع الشاهدين والعدلين المتعاقدين في كناش مذكرة الحفظ الرسمية.',
                                icon: FileSignature,
                            },
                            {
                                step: '03',
                                title: 'استيفاء الضرائب والتسجيل',
                                desc: 'أداء واجبات التسجيل والتمبر بإدارة الضرائب (DGI) للعقود الملزمة، والتقييد بالمحافظة العقارية (ANCFCC) لضمان الملكية.',
                                icon: Stamp,
                            },
                            {
                                step: '04',
                                title: 'خطاب القاضي وتسليم النظير',
                                desc: 'عرض الرسم على السيد قاضي التوثيق بالمحكمة للخطاب عليه وتضمينه بالسجل الرسمي، وتسليم النظير التنفيذي للأطراف.',
                                icon: Award,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="relative rounded-3xl p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-600 transition-all hover:shadow-lg"
                            >
                                <div className="text-3xl font-black font-mono text-emerald-800/20 dark:text-emerald-400/20 mb-3">
                                    {item.step}
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-base font-tajawal text-stone-900 dark:text-stone-100 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MRE DIASPORA DEDICATED SPOTLIGHT */}
            <section id="mre-section" className="py-14 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-zellij opacity-20 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-4 text-center lg:text-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                                <Globe className="h-3.5 w-3.5" />
                                <span>مواكبة خاصة لمغاربة العالم (Moroccan Diaspora)</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-extrabold font-tajawal tracking-tight">
                                خدمات توثيقية عن بعد وسرعة في استخراج النظائر والوكالات
                            </h2>
                            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
                                ندرك ضيق الوقت والتزاماتكم بالخارج. يوفر مكتبنا خدمة مخصصة لأفراد الجالية المغربية: تدقيق الوثائق مسبقاً عبر الواتساب، توجيهكم في إجراءات القنصليات، إبرام الوكالات، وإرسال النظائر الرسمية والمخاطب عليها عبر البريد الدولي المضمون.
                            </p>
                        </div>
                        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                            <Button
                                size="lg"
                                variant="emerald"
                                onClick={() => {
                                    setActiveTab('copy');
                                    const el = document.getElementById('citizen-suite-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg text-xs"
                            >
                                <Copy className="h-4 w-4 me-2" />
                                <span>طلب استخراج نظير مع إرسال دولي</span>
                            </Button>

                            {whatsapp && (
                                <a
                                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أنا مقيم بالخارج وأود استشارة حول إبرام عقد أو وكالة لدى مكتبكم.')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-500/40 transition-all text-center"
                                >
                                    <MessageCircle className="h-4 w-4 text-emerald-300" />
                                    <span>محادثة استشارية فورية عبر الواتساب</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
            <section id="faq-section" className="py-16 sm:py-20 bg-stone-100/70 dark:bg-stone-900/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Badge variant="emerald" className="mb-2">دليل المرتفق</Badge>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                            الأسئلة الشائعة والإرشادات القانونية
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            إجابات شافية حول وثائق وإجراءات التوثيق العدلي بالمغرب
                        </p>
                    </div>

                    <div className="space-y-3">
                        {FAQ_ITEMS.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;

                            return (
                                <Card
                                    key={idx}
                                    className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full p-4 sm:p-5 text-start flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-tajawal cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>{faq.q_ar}</span>
                                        </div>
                                        {isOpen ? (
                                            <ChevronUp className="h-4 w-4 text-emerald-600 shrink-0" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="border-t border-stone-100 dark:border-stone-800 px-5 pb-5 pt-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed overflow-hidden"
                                            >
                                                {faq.a_ar}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* LOCATION, WORKING HOURS & CONTACT HUB */}
            <section id="contact-section" className="py-16 sm:py-20 bg-white dark:bg-stone-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                        {/* Office Details */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <Badge variant="emerald" className="mb-2">زيارة وتواصل</Badge>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-tajawal text-stone-900 dark:text-stone-100">
                                    موقع المكتب وأوقات الاستقبال
                                </h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                    يسعدنا استقبالكم شخصياً لإتمام كافة الإشهادات أو الإجابة عن استفساراتكم التوثيقية
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                                        <MapPin className="h-4 w-4" />
                                        <span>عنوان المكتب:</span>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                                        {address} — {city}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        بدائرة نفوذ {courtName}
                                    </p>
                                </div>

                                <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                                        <Phone className="h-4 w-4" />
                                        <span>أرقام الهاتف المباشرة:</span>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 font-mono font-bold text-sm" dir="ltr">
                                        {phone}
                                    </p>
                                    {whatsapp && (
                                        <p className="text-stone-700 dark:text-stone-300 font-mono text-xs" dir="ltr">
                                            WhatsApp: {whatsapp}
                                        </p>
                                    )}
                                </div>

                                <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                                        <Mail className="h-4 w-4" />
                                        <span>البريد الإلكتروني:</span>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 font-mono text-xs">
                                        {email}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        للإرساليات الرسمية والوثائق الرقمية
                                    </p>
                                </div>

                                <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                                        <Scale className="h-4 w-4" />
                                        <span>الإشراف القضائي:</span>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 font-medium">
                                        {officeSetting?.qadi_name || 'السيد قاضي التوثيق بالمحكمة الابتدائية'}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        قسم قضاء الأسرة والتوثيق
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Table Card */}
                        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl">
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                        <span className="font-bold text-base font-tajawal text-white">ساعات العمل الرسمية</span>
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${isOpenNow ? 'border-emerald-400 text-emerald-300' : 'border-amber-400 text-amber-300'}`}>
                                        {isOpenNow ? 'مفتوح الآن' : 'مغلق حالياً'}
                                    </Badge>
                                </div>

                                <div className="mt-5 space-y-2.5 text-xs text-stone-300">
                                    <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                                        <span>الإثنين - الخميس</span>
                                        <span className="font-semibold text-white">08:30 - 17:00</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                                        <span>الجمعة</span>
                                        <span className="font-semibold text-white">08:30 - 12:30 | 15:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                                        <span>السبت</span>
                                        <span className="font-semibold text-white">09:00 - 13:00 (حسب المواعيد)</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 text-stone-500">
                                        <span>الأحد</span>
                                        <span className="text-rose-400">عطلة أسبوعية</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-stone-800 text-[11px] text-stone-400 text-center">
                                * يمكنكم حجز المواعيد وتقديم طلبات النظائر عبر هذه البوابة على مدار 24 ساعة طوال أيام الأسبوع.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRESTIGIOUS FOOTER */}
            <footer className="bg-stone-950 text-stone-400 py-12 text-xs border-t border-stone-800/80 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-stone-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/30 text-amber-300 flex items-center justify-center">
                                <Scale className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-extrabold text-sm text-white font-tajawal block">
                                    {officeName}
                                </span>
                                <span className="text-[11px] text-stone-500">
                                    توثيق عدلي معتمد بالمملكة المغربية • {city}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-stone-400">
                            <a href="#services-section" className="hover:text-emerald-400 transition-colors">الخدمات</a>
                            <a href="#roadmap-section" className="hover:text-emerald-400 transition-colors">مسار المعاملة</a>
                            <a href="#mre-section" className="hover:text-emerald-400 transition-colors">مغاربة العالم</a>
                            <a href="#faq-section" className="hover:text-emerald-400 transition-colors">الأسئلة الشائعة</a>
                            <Link href="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold text-stone-300">
                                <Lock className="h-3 w-3" />
                                <span>فضاء العدل وكتابة المكتب</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-stone-500 text-[11px]">
                        <p>© {new Date().getFullYear()} {officeName}. كافة الحقوق محفوظة طبقا للتشريع المغربي المنظم لخطة العدالة وحماية المعطيات ذات الطابع الشخصي (القانون 09-08).</p>
                        <div className="flex items-center gap-2">
                            <span>النظام التوثيقي الرقمي المستقل</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{courtName}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
